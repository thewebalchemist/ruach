# RUACH TABERNACLE — How Everything Works Together
## System Architecture Guide for Claude Code
### Read this entire document before touching any code.

---

## THE BIG PICTURE

This is one Next.js application at `ruachtabernacle.org` that was built by merging two previously separate projects:

- **ruach-live** — the streaming/media side (sermons, live, Ask Ruach AI)
- **ruachconnect** — the church management side (Connect class, Discipleship, Crosspoints)

They share **one Supabase database** (the ruach-live project is the master). They share **one codebase**. They share **one URL**. The goal is that someone visiting the website, watching a sermon, asking the AI a question, or managing their Connect class attendance is always on the same platform — just at different URLs.

---

## THE DATABASE (Supabase — ruach-live project)

Everything lives in one Supabase project. The tables split into two logical groups:

### Streaming tables (originally from ruach-live)
```
sermons           — all sermon records (title, slug, preacher, date, thumbnail_url, youtube_url, audio_url, summary)
series            — sermon series groupings (title, slug, image_url, year)
stream_settings   — single row: is_live (boolean), stream_url (text), default_youtube_url (text)
watch_history     — per-user sermon watch tracking (user_id, sermon_id, progress_seconds)
watchlist         — per-user saved sermons (user_id, sermon_id)
prayer_requests   — prayer submissions (name, request, is_public, is_answered)
chat_rate_limits  — Ask Ruach rate limiting (ip_address, session_id, message_count, window_start)
church_info       — single row with church name, address, service times, phone, email (feeds Ask Ruach)
events            — events calendar (title, date, time, location, description, chatbot_enabled)
faqs              — FAQ items (question, answer, is_active, order_index) — feeds Ask Ruach
```

### Management tables (originally from ruachconnect — run schema.sql migration)
```
profiles          — every user's profile (id, email, first_name, last_name, role, status, member_id, 
                    crosspoint_zone, is_in_crosspoint, branch, phone, avatar_url)
                    
ROLES: 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor'
STATUS: 'pending' | 'active' | 'suspended' | 'inactive'

connect_cohorts         — Connect Class groups (cohort_name, year, term, status, teacher_id)
connect_sessions        — individual class sessions (cohort_id, session_number, date, topic, session_type)
connect_attendance      — attendance per session (cohort_id, student_id, session_id, status)
connect_students        — students enrolled in connect (profile_id, cohort_id, enrolled_at, graduated_at)
connect_exams           — exam definitions (cohort_id, title, questions JSON)
connect_exam_submissions — student exam answers (exam_id, student_id, answers, score, status)
connect_resources       — downloadable files/links per cohort
connect_messages        — in-system messaging for connect class

discipleship_courses    — discipleship class definitions (title, description, level, modules JSON)
discipleship_cohorts    — discipleship group instances (course_id, facilitator_id, status)
discipleship_students   — students in discipleship (profile_id, cohort_id, enrolled_at)
discipleship_schedule   — session schedule (cohort_id, session_date, topic)

crosspoints             — the home church zones (name, zone: N/S/E/W, leader_id, venue, status)
crosspoint_members      — who belongs to which crosspoint (profile_id, crosspoint_id, joined_at)
crosspoint_attendance   — attendance records (crosspoint_id, member_id, session_date, status)
crosspoint_food_bank    — food bank distribution records
crosspoint_notices      — announcements per crosspoint
crosspoint_modules      — teaching content/materials per crosspoint

departments             — ministry departments (name, description, leader_id, status)
department_members      — who serves in which department
department_resources    — resources/files for departments
department_schedule     — dept meeting/event schedule
```

---

## SYSTEM 1: ASK RUACH (`/ask`)

### What it is
Ask Ruach is a church-specific AI chatbot. It ONLY answers questions about Ruach Tabernacle — services, events, sermons, directions, how to connect. It refuses all off-topic questions. It is powered by Groq's Llama 3.3 70B model.

### How it works (step by step)

```
User types a question in the chat UI
        ↓
POST /api/chat  {message, session_id, conversation_history, user_id}
        ↓
API checks rate limits (via chat_rate_limits table in Supabase)
  - Anonymous users: 10 messages per session, 20 per hour
  - Signed-in users: 1000 messages (essentially unlimited)
        ↓
API calls getKnowledgeBase() from lib/knowledge.ts
  This fetches from Supabase (with 1-hour in-memory cache):
    - church_info table → name, address, service times, phone, email
    - events table → upcoming 30 days, chatbot_enabled=true only
    - faqs table → all active FAQs
    - sermons table → last 50 sermons with summaries
        ↓
API builds a system prompt injecting all that data
  The AI becomes "Ask Ruach" who knows everything about the church
        ↓
API sends to Groq: system prompt + last 10 messages of history + new message
        ↓
Groq returns response (strips any <think> tags)
        ↓
Response returned to frontend, increments rate limit counter
        ↓
UI displays the response in chat bubble format
```

### What the UI looks like
- Full-page chat interface at `/ask`
- Left sidebar (desktop): "New Chat" button, chat history, back to home link
- Main area: suggested questions on first load (6 preset questions)
- Message bubbles: user on right (red), AI on left (dark card)
- Floating Ask Ruach button on sermons pages: opens as a popup panel bottom-right

### Key files
```
pages/ask.tsx (renamed from chat.tsx)     → the full chat UI
pages/api/chat.ts                          → the API route
lib/knowledge.ts                           → fetches church data, builds system prompt
```

### The knowledge base needs to be populated
For Ask Ruach to give accurate answers, these Supabase tables must have real data:
- `church_info` — at minimum: name, address, service times. Run this insert once:
```sql
INSERT INTO church_info (name, tagline, about_text, address, city, country, directions, service_times)
VALUES (
  'Ruach Tabernacle Assembly',
  'God | Work | Community',
  'A God-focused, Service-oriented, Community-driven church in Nairobi, Kenya.',
  'Rhema Grounds, Rhema Avenue, Off Northern Bypass Rd',
  'Nairobi',
  'Kenya',
  'Along the Northern Bypass, next to Shell Windsor, Nairobi.',
  '[
    {"name": "First Service", "day": "Sunday", "time": "8:00 AM - 9:30 AM"},
    {"name": "Second Service", "day": "Sunday", "time": "10:00 AM - 12:00 PM"},
    {"name": "Third Service", "day": "Sunday", "time": "12:30 PM - 2:00 PM"}
  ]'::jsonb
);
```
- `faqs` — the FAQs from the All About Ruach page should be inserted here
- `events` — any upcoming events with `chatbot_enabled = true`
- `sermons` — populated when admin uploads sermons

---

## SYSTEM 2: CONNECT CLASS (`/connect/*`)

### What it is
The Connect Class system is the formal onboarding program for new church members. A new person attends classes, takes an exam, and upon passing becomes an official member of Ruach Tabernacle. There are two sides: the student experience and the teacher/admin management experience.

### The user journey

```
New visitor comes to church
        ↓
They register at /connect/register (enter: name, phone, email, branch)
  → Creates a profile in Supabase with role='student', status='pending'
  → Sends welcome email via lib/email.ts
        ↓
Teacher/admin assigns them to a cohort (group of students) at /connect/cohorts
        ↓
Students log in at /connect (the login page)
  → Uses Kenyan phone number + OTP (Supabase SMS auth)
  → OR email + password for teachers/admins
  → After login, redirected to:
      students → /connect/student (their student portal)
      teachers/leaders → /connect/dashboard (management view)
        ↓
Weekly: Students attend class sessions
  → Teacher marks attendance at /connect/cohorts/[id] → attendance tab
        ↓
End of term: Students take the exam at /connect/student/exams/[examId]
  → Multiple choice questions
  → Score calculated immediately
  → If passing grade → student becomes eligible for graduation
        ↓
Admin marks graduates at /connect/graduates
  → Student profile role upgrades from 'student' to 'member'
  → Graduation email sent
```

### Student portal (`/connect/student`)
What a student sees after logging in:
- Their cohort information (which group, which teacher, term/year)
- Class schedule and upcoming sessions
- Attendance record (which sessions they attended)
- Resources/materials shared by their teacher
- Their exam results
- Messages from their teacher

### Teacher/Admin management (`/connect/dashboard`)
What a teacher sees:
- All active cohorts they manage
- Per-cohort: student list, attendance, exam results, messaging
- Ability to add students, create exams, share resources
- Graduate students (move them to member status)

### Key files
```
pages/connect/index.tsx          → Login page (student + teacher tabs, OTP flow)
pages/connect/register.tsx       → New student registration form
pages/connect/student/index.tsx  → Student portal
pages/connect/dashboard.tsx      → Teacher/admin dashboard
pages/connect/cohorts/[id].tsx   → Individual cohort management
pages/connect/exams/             → Exam creation and management
pages/connect/students/          → Student list and individual profiles
pages/connect/attendance/        → Attendance management
pages/connect/graduates.tsx      → Graduate management
```

### Auth for Connect
- Login is at `pages/connect/index.tsx` — NOT at `/auth/login`
- Students use phone OTP (Kenyan numbers only: +254...)
- Teachers/admins use email + password
- After auth, Supabase session is established, then the page checks the `profiles` table for the user's role and redirects accordingly
- NEVER send students to `/auth/login` — that's for streaming/website auth

---

## SYSTEM 3: DISCIPLESHIP (`/discipleship/*`)

### What it is
Discipleship is the second step after Connect Class. Once someone becomes a church member, they can enroll in discipleship courses for deeper spiritual growth and training. Discipleship is more advanced than Connect — it's about equipping people to serve and lead.

### How it's structured
```
Discipleship Courses — the curriculum (created by admins)
        ↓
Discipleship Cohorts — groups of students working through a course
        ↓
Students enroll → attend sessions → progress through levels
        ↓
Graduates become eligible for leadership roles (leader/teacher role)
```

### The user journey
```
Member (already completed Connect Class)
        ↓
Goes to /discipleship → sees enrollment option
        ↓
Teacher creates a cohort, enrolls the member
        ↓
Member gets access to /discipleship/student → their progress view
        ↓
Attends sessions, completes requirements
        ↓
Graduates → may be upgraded to 'leader' or 'teacher' role
```

### Key files
```
pages/discipleship/index.tsx        → Login/landing page
pages/discipleship/dashboard.tsx    → Teacher/admin management view
pages/discipleship/courses.tsx      → Course management
pages/discipleship/cohorts.tsx      → Cohort management
pages/discipleship/students.tsx     → Student management
pages/discipleship/student/index.tsx → Student portal
pages/discipleship/schedule.tsx     → Session schedule
pages/discipleship/enroll.tsx       → Enrollment management
pages/discipleship/graduates.tsx    → Graduate tracking
```

---

## SYSTEM 4: CROSSPOINTS (`/crosspoint/*`)

### What it is
Crosspoints are home churches — small weekly gatherings of 15-30 people, organized by geographic zone (North, South, East, West). They are the heartbeat of community at Ruach Tabernacle. Every member is encouraged to join a Crosspoint.

### How it's structured
```
4 geographic zones: North · South · East · West
Each zone has multiple Crosspoints (small groups)
Each Crosspoint has:
  - A leader (crosspoint leader)
  - Venue (usually someone's home)
  - Members list
  - Weekly meeting schedule
  - Attendance tracking
  - Food bank distribution
  - Teaching modules/materials
  - Notices board
```

### The user journey
```
Member goes to /crosspoint (login page)
  → Selects their Crosspoint from a list
  → Authenticates via OTP or email
        ↓
Leader: → /crosspoint/[cpId] → their crosspoint management dashboard
Member: → their crosspoint info (zone, meeting time, upcoming session)
        ↓
Each week: Leader takes attendance at /crosspoint/[cpId]/attendance
Leader distributes food bank at /crosspoint/[cpId]/food-bank
Leader shares teaching module at /crosspoint/[cpId]/module
Leader posts notices at /crosspoint/[cpId]/notices
```

### Key files
```
pages/crosspoint/index.tsx                  → Login (select crosspoint + OTP)
pages/crosspoint/[cpId]/index.tsx           → Crosspoint dashboard
pages/crosspoint/[cpId]/attendance.tsx      → Take attendance
pages/crosspoint/[cpId]/members.tsx         → Member list
pages/crosspoint/[cpId]/food-bank.tsx       → Food bank distribution
pages/crosspoint/[cpId]/module.tsx          → Teaching content
pages/crosspoint/[cpId]/notices.tsx         → Announcements
pages/crosspoint/[cpId]/schedule.tsx        → Meeting schedule
```

---

## SYSTEM 5: SERMONS (`/sermons/*` and `/live`)

### What it is
The sermon library and live streaming system. It's a Netflix-style experience for the church's sermon content. Sermons are stored in Supabase with metadata, and the actual video is a YouTube URL (embedded) while audio files are on Cloudflare R2.

### How it's structured

```
Admin uploads a sermon at /admin/stream/dashboard:
  → Enters title, preacher, date, series, scripture, summary
  → Pastes YouTube URL → thumbnail auto-generated from YouTube
  → Optionally uploads audio file to Cloudflare R2
  → Sermon appears in /sermons library immediately

Series are created separately — a sermon belongs to one series (or none)
```

### Sermons page (`/sermons`)
- Featured sermon at top (large banner, Netflix style)
- Horizontal scroll rows: Latest Sermons, By Series, By Preacher
- Background is dark (`#0A0C10`)
- Each card: thumbnail image, title, preacher name, date
- Clicking a card → `/sermons/[slug]`

### Individual sermon page (`/sermons/[slug]`)
- YouTube video player embedded at top
- Below: sermon details, scripture, summary
- Audio player if audio file exists on R2
- Notes editor (user can take notes, saved to `watch_history`)
- Related sermons row
- Save to watchlist button

### Live page (`/live`)
```
Page loads → fetches /api/stream → gets {isLive, stream_url, defaultYoutubeUrl}
        ↓
If isLive = true:
  → Shows YouTube embed of the live stream URL
  → Shows pulsing LIVE indicator
  → Shows tabs: Live | Past Services | Schedule | Notes | Bible
        ↓
If isLive = false:
  → Shows "Next Service" info with countdown
  → Shows Past Services list
  → Shows Schedule view
```

### Live stream management
The admin goes to `/admin/stream/dashboard`:
- Toggle `is_live` on/off
- Set the live YouTube URL (changes when they go live)
- Set the default YouTube URL (used when not live — shows latest sermon)

### Cloudflare R2 storage
Audio files are stored in Cloudflare R2. The lib/r2.ts handles:
- `generatePresignedUploadUrl()` — admin gets a URL to upload directly to R2
- `getAudioUrl()` — get the public R2 URL for a sermon's audio file
- Audio files are stored as: `sermons/{sermon_slug}/audio.mp3`

### Key files
```
pages/sermons/index.tsx        → Netflix-style sermon library
pages/sermons/[slug].tsx       → Individual sermon page
pages/series/index.tsx         → All series
pages/series/[slug].tsx        → Individual series page
pages/live.tsx                 → Live streaming page
pages/api/stream.ts            → Returns current stream settings from Supabase
pages/api/chat.ts              → Ask Ruach API (uses sermon data)
pages/admin/stream/dashboard.tsx → Admin: toggle live, set URL, add sermons
lib/r2.ts                      → Cloudflare R2 audio file handling
```

---

## HOW AUTH WORKS ACROSS ALL SYSTEMS

This is the most important thing to understand. There are TWO login contexts in this app — they use the same Supabase auth but go through different entry points.

### Public website visitors (not logged in)
- Can browse everything: homepage, about, sermons, who we are, communities
- Can watch sermons (all public)
- Can use Ask Ruach (rate limited at 10 messages)
- Cannot access member portals

### Church members (signed in)
- Log in via `/connect` (OTP with Kenyan phone) for Connect/Discipleship/Crosspoint access
- OR via `/auth/login` for streaming features (watchlist, notes, unlimited Ask Ruach)
- The `profiles` table has their `role` — this determines what they can access

### Role permissions
```
'student'  → Can access: /connect/student, /discipleship/student, streaming features
'member'   → All of above + /member portal, full streaming features
'leader'   → All of above + /crosspoint/[cpId] management
'teacher'  → All of above + /connect/dashboard, /discipleship/dashboard
'admin'    → All of above + /admin (full admin dashboard)
'pastor'   → Same as admin + special reporting features
```

### Auth flow in code
1. User authenticates via Supabase auth (OTP or email/password)
2. `AuthContext` (context/AuthContext.tsx) listens to auth state changes
3. On session change, fetches the user's `profile` from the `profiles` table
4. Exposes: `session`, `profile`, `role`, `loading` to all pages via React context
5. Pages check `role` to determine what to show/allow
6. Middleware (middleware.ts) does server-side redirects for protected routes

### The `/connect` login is NOT the same as `/auth/login`
- `/connect` → handles Connect Class + Discipleship + Crosspoint login → redirects to management portals
- `/auth/login` → handles streaming/website login → redirects to member features
- Both use the same Supabase auth under the hood
- Both populate the same `profiles` table

---

## HOW THE PAGES CONNECT TO EACH OTHER

```
Homepage (/)
  ├── "Watch Live" → /live
  ├── "Sermons" → /sermons
  ├── "Ask Ruach" → /ask
  ├── Communities grid → /r-communities → individual community pages
  ├── "Connect Class" card → /r-connect → /connect (the management system login)
  └── Footer links → all public pages

/ask (Ask Ruach AI)
  └── References sermons → links to /sermons/[slug]

/sermons
  ├── Individual sermon → /sermons/[slug]
  ├── Series → /series/[slug]
  └── Floating "Ask Ruach" button → opens /ask popup

/live
  └── Tab: "Past Services" → lists recent sermons with links to /sermons/[slug]

/r-connect (public info page)
  └── "Join Connect Class" button → /connect (the management system)

/connect (management system login)
  ├── Student login → /connect/student
  └── Teacher login → /connect/dashboard

/connect/student
  └── After completing Connect Class exam → stays member, can then join /discipleship

/discipleship
  ├── Student → /discipleship/student
  └── Teacher → /discipleship/dashboard

/crosspoint
  └── Leader → /crosspoint/[cpId]

/admin (unified admin)
  ├── /admin/members → all member management
  ├── /admin/connect → Connect Class overview
  ├── /admin/discipleship → Discipleship overview
  ├── /admin/crosspoints → All crosspoints overview
  ├── /admin/departments → Departments overview
  └── /admin/stream/dashboard → Live + sermon management
```

---

## SHARED COMPONENTS USED EVERYWHERE

```
components/shared/Layout.tsx         → Wraps every page, auto-detects public/admin/auth context
components/shared/Navbar.tsx         → Public website navigation (transparent → glass on scroll)
components/shared/Footer.tsx         → Public website footer
components/shared/AnnouncementBar.tsx → Red top bar with service times + See Directions button
components/shared/Marquee.tsx        → Animated scrolling text (You're Family, etc.)
components/shared/ExpectGallery.tsx  → Church photo gallery (same across all public pages)
```

The admin and management pages (connect, discipleship, crosspoint) use their own layout components in `components/connect/`:
```
components/connect/AdminLayout.tsx       → Main admin layout with sidebar
components/connect/ConnectLayout.tsx     → Connect class pages layout
components/connect/DiscipleshipLayout.tsx → Discipleship pages layout
components/connect/CrosspointLayout.tsx  → Crosspoint pages layout
components/connect/DepartmentLayout.tsx  → Department pages layout
```

---

## ENVIRONMENT VARIABLES REQUIRED

Every one of these must be set in `.env.local` before anything works:

```bash
# Supabase — ruach-live project is the master database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2 — for sermon audio storage
NEXT_PUBLIC_R2_PUBLIC_URL=      # The public URL for your R2 bucket
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Groq — for Ask Ruach AI
GROQ_API_KEY=

# Email — for Connect registration emails, discipleship enrollment, etc.
EMAIL_FROM=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# App
NEXT_PUBLIC_APP_URL=https://ruachtabernacle.org
```

---

## COMMON MISTAKES TO AVOID

### 1. Wrong Layout import
ALL public pages must import from `@/components/shared/Layout`.
Management pages (connect, discipleship, crosspoint) use their own layout components from `@/components/connect/`.
NEVER mix them.

### 2. Wrong auth path
`/connect/index.tsx` has its own auth flow (phone OTP). Do NOT replace this with the shared auth/login page.
The connect system login is its own complete flow — OTP + profile check + role-based redirect.

### 3. Sermons vs Connect database
Both use the same Supabase project but different tables. The sermons/streaming tables and the connect/management tables never talk to each other directly. The only shared table is `profiles` — it stores every user regardless of whether they came in through the streaming side or the connect side.

### 4. Ask Ruach API key
`/api/chat.ts` requires `GROQ_API_KEY` in env. If missing, it returns a 500 error. All Ask Ruach features — including the floating popup on the sermons page — will be broken without this key.

### 5. church_info table must have one row
`lib/knowledge.ts` does `.single()` on the `church_info` table. If that table is empty, Ask Ruach will fail. Always ensure there is exactly one row in `church_info`.

### 6. stream_settings table must have one row
`pages/live.tsx` and the homepage (`isLive` check) both call `.single()` on `stream_settings`. If empty, they crash. Ensure one row exists:
```sql
INSERT INTO stream_settings (is_live, stream_url, default_youtube_url)
VALUES (false, '', '');
```

---

## HOW TO VERIFY EVERYTHING IS CONNECTED

Run through this checklist after setup:

```
PUBLIC WEBSITE
[ ] / loads with hero image visible through transparent navbar
[ ] Navbar becomes glass/white on scroll
[ ] "Watch Online" button links to /live correctly
[ ] /ask page loads and shows suggested questions
[ ] Ask Ruach responds to "What time are Sunday services?"
    → Should return the correct times from church_info table

SERMONS
[ ] /sermons loads showing a featured sermon banner
[ ] Clicking a sermon card goes to /sermons/[slug]
[ ] /live loads without error (isLive=false shows schedule)

CONNECT CLASS
[ ] /connect loads the login page with Student + Teacher tabs
[ ] Student tab shows phone number input field
[ ] Teacher tab shows email + password fields
[ ] /connect/register loads the registration form

DISCIPLESHIP
[ ] /discipleship loads the login/landing page

CROSSPOINTS
[ ] /crosspoint loads showing the crosspoint selection list

ADMIN
[ ] /admin redirects to /auth/login (middleware protecting it)
[ ] After login with admin credentials, /admin loads the dashboard
[ ] /admin/stream/dashboard loads the stream management controls

ASK RUACH POPUP
[ ] On /sermons, a red "Ask Ruach" button appears bottom-right (desktop)
[ ] Clicking it opens the chat popup panel
[ ] Typing a question and pressing Enter sends a message
```