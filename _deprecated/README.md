# Deprecated files

Code moved out of the app (out of `pages/`, `components/`, etc.) so it's no
longer routed/imported, but kept for reference rather than deleted outright.

- `pages/admin/stream/dashboard.tsx` — duplicated `pages/control-panel/**`'s
  sermons/series/events/stream-settings CRUD, but was gated only by a
  client-settable `localStorage.getItem('adminAuth')` flag (never actually
  set anywhere in the app) and redirected to a `/admin/login` page that
  doesn't exist — effectively an unauthenticated bypass of `control-panel`'s
  real session+role check. See `AUDIT_REPORT.md` and the execution plan,
  Batch 3. `control-panel` is the one real implementation going forward.

- `pages/onboarding/index.tsx` — an orphaned duplicate of the real,
  Supabase-backed onboarding wizard at `pages/member/onboarding.tsx` (the
  one `pages/member/index.tsx` actually redirects to for
  `onboarding_complete === false`). This copy was mock-data-backed
  (`mockCrosspoints`/`mockDepartments`), hardcoded a fake identity
  ("David Mwangi", member ID `RM-2026-0128`), and never wrote any selection
  to Supabase — the "Finish" screen was purely decorative. Nothing in the
  app links to `/onboarding` (only `/member/onboarding`), so this was dead
  code rather than a reachable broken page.
