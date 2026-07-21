-- ============================================================
-- Ruach Tabernacle — RAG + JK upgrades
-- Run ONCE in the Supabase SQL editor (additive, safe, non-destructive).
-- Adds: pgvector, sermon_chunks + match_sermons RPC, preachers table,
--       sermons.article (regenerated JK-style article, leaves notes intact),
--       sermons.preacher_id link.
-- ============================================================

create extension if not exists vector;

-- ── Regenerated article lives in its own column so existing `notes`
--    stay untouched until the new design is live. New sermon page reads
--    coalesce(article, notes).
alter table sermons add column if not exists article text;

-- ── Managed pastors/preachers list (for the sermon form dropdown) ──
create table if not exists preachers (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique,
  title      text,               -- e.g. "Senior Pastor"
  photo_url  text,
  bio        text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);
alter table sermons add column if not exists preacher_id uuid references preachers(id) on delete set null;

-- ── RAG vector store (mistral-embed → 1024 dims) ──────────────────
create table if not exists sermon_chunks (
  id          uuid primary key default uuid_generate_v4(),
  sermon_id   uuid not null references sermons(id) on delete cascade,
  chunk_index int  not null default 0,
  content     text not null,
  embedding   vector(1024),
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists sermon_chunks_embedding_idx
  on sermon_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists sermon_chunks_sermon_idx on sermon_chunks(sermon_id);

-- ── Similarity search RPC (server-side, service role) ─────────────
create or replace function match_sermons(
  query_embedding vector(1024),
  match_count int default 6,
  similarity_threshold float default 0.30
)
returns table (
  sermon_id uuid,
  slug text,
  title text,
  preacher text,
  content text,
  similarity float
)
language sql stable as $$
  select
    c.sermon_id, s.slug, s.title, s.preacher, c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from sermon_chunks c
  join sermons s on s.id = c.sermon_id
  where c.embedding is not null
    and s.published = true
    and 1 - (c.embedding <=> query_embedding) > similarity_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ── RLS ───────────────────────────────────────────────────────────
alter table preachers      enable row level security;
alter table sermon_chunks  enable row level security;   -- server-only; no public policy
do $$ begin
  create policy "public read preachers" on preachers for select using (true);
exception when duplicate_object then null; end $$;

-- Seed the current default preacher so the dropdown isn't empty.
insert into preachers (name, slug, title, sort_order)
  values ('Pastor Enoch Kyula', 'pastor-enoch-kyula', 'Senior Pastor', 0)
  on conflict (slug) do nothing;
