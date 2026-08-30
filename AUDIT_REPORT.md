# RuachConnect Platform Audit
**Modules:** Admin · Discipleship · Connect · Crosspoint
**Type:** Read-only discovery audit — no code was changed
**Date:** 2026-08-09

---

## Executive Summary

The four modules are architecturally consistent with each other, which is both the good news and the bad news: they share the same handful of unfinished patterns everywhere.

1. **A large share of the UI across Admin and Crosspoint (and roughly half of Discipleship) is a prototype layer.** Pages import fixed arrays from `data/*.ts` instead of Supabase, and "Save / Create / Approve" buttons are frequently `setTimeout(...)` calls that redirect without persisting anything. A `demo`/`live` mode switch exists (`context/ModeContext.tsx`) but was only ever wired into 2 of the ~85 pages surveyed — it reads as an abandoned migration plan rather than a working toggle.
2. **Route-level and component-level auth gating is nearly absent.** `middleware.ts` only checks for *the presence of any session cookie* (not role) and only covers `/admin/**`, `/control-panel/**`, and the single `/dashboard` sub-route of Connect and Discipleship — Crosspoint has no middleware coverage at all. None of the four module layout shells (`AdminLayout`, `ConnectLayout`, `DiscipleshipLayout`, `CrosspointLayout`) perform any role check. Adoption of the app's own `useAuth()` hook inside individual pages is low: Admin 1/32, Connect 1/20, Crosspoint 0/10, Discipleship 5/14.
3. **Three confirmed, exploitable server-side vulnerabilities**, independent of the frontend gating problem:
   - `pages/api/classroom/attendance.ts` and both `pages/api/{connect,discipleship}/exams/submit.ts` use the Supabase **service-role key** (which bypasses Row Level Security entirely) and perform **zero authentication check** — any caller can mark any student present, or submit (and permanently lock in) an exam result on behalf of any other student, by supplying an arbitrary `userId`/`studentId` in the request body.
4. **A likely-live administrator account with a publicly committed password.** `pages/api/setup/seed-test-accounts.ts` — explicitly commented "ONE-TIME USE... Delete this file after use" — hardcodes the password `TestAdmin2026!` for `test.admin@ruachtabernacle.org` with role `admin`. It was added in commit `7820837 "test account creation"` on 2026-05-27 and is still present. This should be treated as a live credential leak, not a hypothetical one.
5. **One database-level policy gap affects every module at once:** `profiles_select` RLS is `USING (auth.uid() IS NOT NULL)` — any authenticated user of any role, including a freshly self-registered `student`, can read every member's full profile (email, phone, address, DOB, marital status) directly from Supabase, independent of any application code.
6. **Several core user journeys are non-functional end-to-end**, not merely mocked: Crosspoint's "Join a Crosspoint" writes to a table that doesn't exist; Discipleship's self-enrollment, legacy verification, exam creation, and attendance-marking all insert into tables where **RLS is enabled but no policy was ever written**, so every attempt is silently rejected regardless of role.

None of the above required exploiting anything exotic — all six were found by reading the code and the schema. Section 8 gives a single prioritized list; the module sections below give full file:line detail.

---

## 1. Cross-Cutting Architecture (applies to all four modules)

### 1.1 Routing / middleware
`middleware.ts` matcher covers only: `/admin/:path*`, `/control-panel/:path*`, `/member/:path*`, `/connect/dashboard/:path*`, `/discipleship/dashboard/:path*`, `/notifications/:path*`. It checks only for a `sb-session` cookie's *presence* (set client-side by `AuthContext.tsx` on any login, any role) — never role.

Practical effect: `/admin/**` requires *some* login but not an admin role. Everything under Connect and Discipleship except the one `/dashboard` route, and **all** of Crosspoint, has no edge protection whatsoever.

### 1.2 Component-level gating
`components/connect/AdminLayout.tsx`, `ConnectLayout.tsx`, `DiscipleshipLayout.tsx`, `CrosspointLayout.tsx` are pure chrome — none call `useAuth()`. Several also render **hardcoded fake identity**: `Sidebar.tsx` shows whatever `getCurrentUser()` (from the static `@/data` mock module) returns; `ConnectLayout.tsx:169-171` hardcodes avatar initials `"JM"`; `CrosspointLayout.tsx:83-89` hardcodes `"CP Leader"`/`"CL"`. An unauthenticated visitor sees what looks like a logged-in session.

Gating, where it exists at all, lives inside individual pages via `useAuth()` — and most pages don't call it (counts above). `pages/control-panel/**` is the one consistently-correct implementation: session → fetch `profiles.role` → require admin/pastor → redirect.

### 1.3 The mock-data layer
`data/*.ts` (`index.ts`, `users.ts`, `connect.ts`, `discipleship.ts`, `organizations.ts`, `programs.ts`) is a hand-written fixture dataset (fake people like "James Mwangi"). It is imported directly and unconditionally by the large majority of Admin and Crosspoint pages, and about half of Discipleship's. `context/ModeContext.tsx` defines a `demo`/`live` toggle intended to switch between this fixture data and real Supabase — it's only consulted in `pages/admin/search.tsx` and `components/connect/DemoBanner.tsx`. Everywhere else, "Save" buttons on mock-backed pages are typically `await new Promise(r => setTimeout(r, 1000))` followed by a redirect — the UI implies persistence that never happens.

### 1.4 RLS / auth model
Supabase Row Level Security is enabled on essentially every table (`supabase/schema.sql`), using two helper functions:
```sql
is_staff() -- role IN ('teacher','admin','pastor')
is_admin() -- role IN ('admin','pastor')
```
This is a reasonable model where it's applied. Two systemic problems:

- **`profiles_select` is `USING (auth.uid() IS NOT NULL)`** — no ownership or staff restriction — so the entire member directory (PII included) is readable by any logged-in account, including self-registered students. This is the single highest-leverage fix in the whole audit: one line, fixes exposure across all four modules simultaneously.
- **RLS enabled with zero policies** on several tables — `discipleship_exams` (INSERT), `discipleship_exam_questions`, `discipleship_exam_answers`, `discipleship_attendance`, `discipleship_resources`, `discipleship_warnings`, `discipleship_legacy_requests`, and `transfer_requests`. Enabling RLS without a policy defaults to deny-all. This isn't a security hole — it's a silent, permanent 0-row/rejected-write bug for every legitimate user including admins. It's why several "live" write flows (enroll, legacy request, create exam, transfers) are broken even though the client code is otherwise correct.

### 1.5 The correct pattern (cite as the template)
`pages/api/admin/graduate-connect-student.ts`, `verify-legacy-request.ts`, `verify-discipleship-legacy.ts`, and `pages/api/classroom/token.ts` all do this correctly:
```
Authorization: Bearer <token>
  → supabaseAdmin.auth.getUser(token)
  → look up caller's profile.role
  → require role ∈ {admin, pastor} (or check cohort enrollment)
  → THEN use supabaseAdmin (service role) for the privileged write
```
Every broken/insecure API route in this audit deviates from this exact template — either by skipping the auth check while still using the service-role client (`attendance.ts`, both `exams/submit.ts`), or by using the anon client with no forwarded token so RLS silently blocks even legitimate callers (`stream/settings.ts`, now confirmed dead/unreachable code — see §2).

---

## 2. Admin Module

### 2.1 State of Features

| Feature | Status | Evidence |
|---|---|---|
| Dashboard, Members, Departments, Events, Food Bank, Notices, Prayer, Suggestions, Reports (list/read views) | Mock-only | All read fixtures from `@/data`; no `supabase` import in any of these files |
| Add/Edit Member, Create Event, Create Notice | Mock-only, fake write | `setTimeout(1000)` then redirect — nothing persisted (`members/new.tsx:25-32`, `events/new.tsx:25-31`, `notices/new.tsx:20-26`) |
| Create User (incl. admin/pastor roles) | Mock-only, no API wired | `users/new.tsx:102-108` — `setSaving → sleep(2000) → success`; never calls `supabase.auth.admin.createUser` despite the UI showing a fake "generated password" success screen |
| Broadcast | Mock-only | `MOCK_DATA = true` declared and never branched on; send handler is `setTimeout` (`broadcast.tsx:11,164-171`) |
| Approve/decline dept requests, food-bank approve/fulfill, prayer status, suggestion status | Dead buttons | No `onClick` at all (`departments/requests.tsx:67-72`, `food-bank/index.tsx:173-186`, `prayer/index.tsx:97-102`, `suggestions/index.tsx:121-126`) |
| Settings (all 6 tabs) | Not implemented | Every field is uncontrolled `defaultValue`; every Save/toggle/"Reset All Data" button has no handler |
| Global Search | **Working**, dual-mode | The one admin page correctly wired to `ModeContext`; falls back to a real `supabase.rpc('search_members', …)` in live mode (`search.tsx:117-149`) |
| `/admin/stream/dashboard` | Live Supabase CRUD, but effectively unreachable | Gated by `localStorage.getItem('adminAuth')` — nothing in the codebase ever sets that flag — and its own login redirect (`/admin/login`) doesn't exist. Duplicates `pages/control-panel/**` almost feature-for-feature |
| `pages/control-panel/**` (8 pages) | **Working, properly gated** | Every page does session → role fetch → require admin/pastor, then real Supabase CRUD |
| `POST /api/stream/settings` | Dead code | Nothing in the repo calls it with `method:'POST'`; real writes go through direct client calls in `control-panel/live.tsx` and `admin/stream/dashboard.tsx` instead |
| `pages/api/admin/*.ts` (3 routes) | **Working — gold standard** | See §1.5 |

### 2.2 Dead Code & Orphaned Assets
- `Sidebar.tsx` nav links to `/admin/members/attendees` and `/admin/discipleship/connect` — neither page exists.
- Dead links from within pages: department `.../edit`, `.../teams/...`; guests `.../new`, `.../{id}`; food-bank `.../new` — none of these routes exist.
- Sidebar "Logout" button (`Sidebar.tsx:172-174`) has no `onClick`. Header search input (`Header.tsx:33-37`) has no `onChange`/`onSubmit`.
- `pages/admin/stream/dashboard.tsx` is an orphaned duplicate of `pages/control-panel/**` — its `MembersTab` literally reads "Coming soon!"
- `pages/admin/notices/new.tsx:129` "Save as Draft" and `members/[id]/edit.tsx:177` "Delete Member" — both buttons, no handlers.
- `useMode()` is consumed in only 2 of ~30 admin surfaces, so the demo/live toggle changes nothing for 90%+ of the module.

### 2.3 Refactoring & Reusability
- Identical fake-submit boilerplate (`setLoading → setTimeout(1000) → redirect`) copy-pasted across 4+ forms — extract a `useFormSubmit(mutationFn)` hook.
- Filter-tab + stat-card + status-pill pattern duplicated near-identically across `food-bank`, `prayer`, `suggestions`, `events`, `notices` — each redefines its own color-mapping switch statement. Extract `<FilterableStatGrid>` + `<StatusBadge>`.
- Detail/edit page skeleton (not-found guard, avatar-initials circle, card grid) repeated across `members/[id]/*` and `departments/[id]/*` — extract `<AdminDetailShell>`.
- **Two full admin shells exist for one church**: `AdminLayout`+`Sidebar` (no auth check) and `CPLayout` (correct auth check) are the same idea implemented twice. Consolidating fixes duplication *and* the security gap in one move.
- `pages/admin/stream/dashboard.tsx` duplicates the CRUD forms in `pages/control-panel/{sermons,series,events,church-info}.tsx` almost exactly — pick one system, delete the other.

### 2.4 Security & Authentication
- 30 of 32 admin pages have no role check (only `search.tsx` calls `useAuth()`, and even there the `isTeacher` value is read once and never used to gate anything — a dead check).
- `admin/stream/dashboard.tsx`'s `localStorage.getItem('adminAuth')` gate can be bypassed from devtools with one line (`localStorage.setItem('adminAuth','1')`), reaching live Supabase CRUD over sermons/series/events/FAQs/church-info/stream settings. Note: RLS policies for `sermons`, `series`, `faqs`, `church_info` were **not found** in any schema file surveyed — their protection posture should be verified directly in the Supabase project.
- `users/new.tsx` models a real privilege-escalation surface: it lets a caller pick `admin`/`pastor` roles and displays a plaintext temp password client-side, with no second factor and (currently) no server-side role check on the creator. If wired up naively rather than via an `/api/admin/*`-style route, this becomes a way for any already-compromised admin session to mint more admin accounts with no audit trail.
- Directly implicated by the leaked test-admin account (§Executive Summary #4): the moment any of the above pages moves from mock to live data, `test.admin@ruachtabernacle.org` has full access to all of it.

### 2.5 Actionable Fixes
1. Rotate/delete the leaked `test.admin@ruachtabernacle.org` account, rotate `SETUP_SECRET`, delete or environment-gate `pages/api/setup/{seed-test-accounts,diagnose}.ts`.
2. Add a `useAuth()`-based `isAdmin` guard to every `pages/admin/**` page (ideally via a wrapper around `AdminLayout`, or `getServerSideProps`).
3. Retire `pages/admin/stream/dashboard.tsx` in favor of `pages/control-panel/**` (already correct), or fix its auth gate and login redirect if it must stay.
4. Wire the ~15 mock write-flows to real persistence, following the `graduate-connect-student.ts` pattern for anything privileged.
5. Route `users/new.tsx` account creation through a new server-side `pages/api/admin/create-user.ts`; never create admin/pastor accounts client-side.
6. Fix or remove the dead nav links enumerated in §2.2.
7. Consolidate `AdminLayout`/`Sidebar` and `CPLayout` into one shell with one shared auth-check hook.
8. Delete the dead `POST /api/stream/settings` handler.

---

## 3. Discipleship Module

### 3.1 State of Features

| Feature | Status | Evidence |
|---|---|---|
| Facilitator/Member login | **Working** | Real `supabase.auth` flow with role-based redirect |
| Dashboard stats / "at risk" flag | Working but always wrong | Reads `discipleship_attendance` directly; that table has RLS enabled with **no policy**, so the query always returns 0 rows — "At Risk" is permanently 0 |
| Courses, Cohorts, Students, Schedule (list views) | Mock-only | Import fixtures from `data/discipleship.ts` |
| "New Cohort" modal | No-op | Create button just closes the modal — no insert |
| Graduates + "Issue Certificate" | Fake success | `setTimeout` mutating local state only |
| Settings + "Save Settings" | Fully local, no persistence | No `supabase`/API import in the file at all |
| Self-enrollment (`enroll.tsx`) | **Live but rejected** | Inserts into `discipleship_students`, but the only write policy requires `is_staff()` — a member enrolling themselves is always denied |
| Legacy verification request | **Live but rejected** | `discipleship_legacy_requests` has RLS enabled, zero policies — insert always fails |
| Create Exam (facilitator) | **Live but rejected, and unguarded** | No INSERT policy exists on `discipleship_exams`/`discipleship_exam_questions`; also the one page in this list with *no* `useAuth()` call and no manual session check at all |
| Classroom video + token issuance | **Working** | `token.ts` correctly verifies enrollment before issuing a LiveKit token |
| Manual attendance toggle (teacher) | Broken | Writes directly to `discipleship_attendance` client-side — blocked by the missing-policy bug above |
| Self-attendance via API | "Works" but is the confirmed IDOR | Goes through `/api/classroom/attendance` (service role, no auth check) |
| Take exam (student) | Working, weaker than Connect's version | Submits via `pages/api/discipleship/exams/submit.ts` (service role, no auth) — see §3.4 |
| Student dashboard attendance % | Always wrong for the same reason as the facilitator dashboard | Reads `discipleship_attendance` directly under RLS with no policy |
| Admin discipleship overview + cohort detail | Mock-only, most linked actions dead | No supabase usage at all in either file |

**Root cause worth calling out on its own:** RLS is enabled with zero policies on `discipleship_exams` (INSERT), `discipleship_exam_questions`, `discipleship_exam_answers`, `discipleship_attendance`, `discipleship_resources`, `discipleship_warnings`, and `discipleship_legacy_requests`. This single gap silently breaks exam creation, legacy verification, and all attendance reads/writes across the module for every role, including admins.

### 3.2 Dead Code & Orphaned Assets
- `DiscipleshipLayout.tsx:75-78` "Logout" is a plain link, never calls `signOut()` — the session stays alive.
- Dead links: `.../cohorts/new`, `.../cohorts/${id}` (no `[id].tsx` page exists), exam fallback `/discipleship/exams` (missing), and — most significantly — **four of the admin cohort sub-flows are entirely unimplemented**: `.../graduate`, `.../attendance`, `.../exams/new`, `.../students` all 404 from `pages/admin/discipleship/cohorts/[id]/index.tsx`.
- 9 of 14 pages carry a vestigial `const MOCK_DATA = true` that's never read conditionally anywhere.

### 3.3 Refactoring & Reusability
- **`pages/api/discipleship/exams/submit.ts` is a near line-for-line duplicate of `pages/api/connect/exams/submit.ts`**, and the two have already drifted: Connect's version rejects submissions from `dropped`/`failed` students; Discipleship's does not, so a withdrawn student can still permanently lock in an exam result. Extract a shared `lib/exams/submitAndGrade.ts` parameterized by table prefix so fixes land in both places at once.
- `DiscipleshipLayout` duplicates shell structure also implemented separately in `AdminLayout`/`ConnectLayout`/`CrosspointLayout` — a shared `PortalLayout(navItems, title, brandColor)` would also make the missing-auth-check fix a one-place change.
- `students.tsx`, `graduates.tsx`, `cohorts.tsx` all repeat the same manual "enrich with member/cohort/course" join pattern against mock arrays — becomes a single server-side join or `useEnrichedStudents()` hook once live.

### 3.4 Security & Authentication
- Confirmed IDOR in `exams/submit.ts` and shared `classroom/attendance.ts` (see §1.5/Executive Summary).
- 8 of 14 pages have no `useAuth()` call and aren't covered by middleware; today this only exposes fixture data, but nothing will add a guard automatically when they're wired to Supabase.
- `exams/new.tsx` has no auth check of any kind — currently saved only by the missing-INSERT-policy bug, not by any actual control.
- Confirmed **role/policy mismatch**: the dashboard's client-side "is staff" check includes `leader`, but the DB's `is_staff()` does not — a `leader`-role user sees create/manage buttons that will always fail server-side.

### 3.5 Actionable Fixes
1. Add auth (Bearer token → verify caller owns `studentId` or is staff) to `exams/submit.ts` and `classroom/attendance.ts`.
2. Write the missing RLS policies: staff-gated INSERT on `discipleship_exams`/`discipleship_exam_questions`; own-or-staff policy on `discipleship_attendance`; self-insert/staff-review policy on `discipleship_legacy_requests`.
3. Either allow self-insert on `discipleship_students` (scoped, e.g. `WITH CHECK (user_id = auth.uid() AND status = 'enrolled')`) or move enrollment behind a server-side API route.
4. Add `useAuth()` guards to the 8 currently-unguarded pages.
5. Fix the Logout link to call `supabase.auth.signOut()`.
6. Build or remove the 4 missing admin cohort sub-pages.
7. Port Connect's `dropped`/`failed` eligibility check into Discipleship's `submit.ts`.
8. Reconcile the `leader`-role mismatch between client `isTeacher` and DB `is_staff()`.

---

## 4. Connect Module

### 4.1 State of Features

| Feature | Status | Evidence |
|---|---|---|
| Login (OTP + email) | **Working** | Real Supabase auth, role-based redirect |
| New student registration | **Working** | Real `auth.signUp` + profile update + `connect_students` insert |
| Legacy member request — submission | **Working** | Real insert into `legacy_member_requests` |
| Legacy request — review/approve/reject | Mock-only, and disconnected from real submissions | `legacy-requests.tsx` is seeded from a mock array and never reads the real table `register.tsx` writes to — real submissions are invisible to staff |
| Teacher dashboard | Mock-only | All `mockConnect*` data; "Send Warning" is a documented no-op |
| Cohort list/detail | Mock-only | Resource upload, notify, enrollment toggle all simulated |
| Create Cohort | Fake success | `setTimeout(2000)` then redirect, no Supabase call |
| Create Exam | **Working** | Real insert into `connect_exams` + questions |
| Exam list/detail, publish toggle | Mock-only | Comment literally says "In production: PATCH /api/connect/exams/:id" |
| Student portal dashboard | Mock-only, hardcoded identity | `CURRENT_USER_ID = 'user-new-001'` constant — no session check on an unguarded route |
| Student exam-taking | **Working, best-built page in the module** | Uses `useAuth()`, anti-cheat, real submit — but the server side (`exams/submit.ts`) doesn't verify the client's honesty (see §4.4) |
| Live classroom + auto-attendance | **Working**, but inconsistent trust model | Token request correctly sends a Bearer token two lines before the attendance call sends none at all, from the same page |
| Attendance CSV import | Mock/broken | Parses a real CSV client-side, then `setTimeout`s instead of submitting; target route doesn't exist |
| Students, Graduates, Messages, Resources, Settings | Mock-only, fully cosmetic | "Broadcast to Cohort" and "Export CSV" buttons have no handler at all |
| Admin Connect overview/cohort detail | Mock-only, mostly dead links | 9 linked sub-routes don't exist |
| Sidebar "Sign out" | Broken | Plain link, never calls `supabase.auth.signOut()` — user stays authenticated |

### 4.2 Dead Code & Orphaned Assets
- `components/connect/Header.tsx` is completely orphaned — not imported anywhere in the repo.
- Hardcoded `"JM"` avatar in `ConnectLayout.tsx`, present on all 15 pages that use the layout.
- 9 dead admin sub-routes linked from `admin/connect/index.tsx` / `admin/connect/cohorts/[id]/index.tsx`.
- "Broadcast to Cohort" (`messages.tsx`), "Export CSV" (`graduates.tsx`), "Graduate Now" (`cohorts/[id].tsx`) — all rendered with no `onClick`.
- The real legacy-request submission path (`register.tsx`) and the only review UI (`legacy-requests.tsx`) don't talk to each other at all — a real, functionally orphaned data flow.

### 4.3 Refactoring & Reusability
- Same exam-grading duplication noted in §3.3 (Discipleship) — a single shared `lib/exam-grading.ts` should serve both.
- Warning-modal UI (textarea + Cancel/Send, currently all non-functional) is copy-pasted at least 3 times — extract `<SendWarningModal>`.
- Several pages re-implement `.filter()` logic that already exists as exported helpers in `data/connect.ts` (`getConnectStudentsByCohort`, etc.) — simple win to just use what's already there.
- Two parallel "teacher" surfaces (`connect/cohorts/[id].tsx` and `admin/connect/cohorts/[id]/index.tsx`) render nearly the same student table from the same data — candidate for one shared `<CohortStudentsTable mode="admin"|"teacher">`.
- `register.tsx:32` casts `supabase as any` to work around missing generated types — silently defeats compile-time checking on every insert/update in that file; worth tracking as tech debt.

### 4.4 Security & Authentication
- Confirmed IDOR in `pages/api/connect/exams/submit.ts` (no auth, service role, arbitrary `studentId`) — directly reachable from the module's best-built page, `student/exams/[examId].tsx`.
- Confirmed IDOR in shared `classroom/attendance.ts`, reachable from `connect/classroom/[sessionId].tsx`'s auto-attendance tracker — notable because the *same page*, two calls apart, correctly sends a Bearer token to `classroom/token.ts` and sends nothing at all to `attendance.ts`.
- `pages/api/email/connect-registration.ts` takes a bare `userId` with no auth check — lower severity (spam/notification abuse), still worth fixing.
- 19 of 20 Connect pages have no auth gate; `ConnectLayout`/`AdminLayout` provide none either. Currently masked by mock data, but `register.tsx` confirms self-registration creates `role: 'student'` profiles — the lowest-trust role in the system — and the DB-level `profiles_select` hole (§1.4) means that role can *already* read the entire member directory today, independent of any of these page-level gaps.
- `student/index.tsx`'s hardcoded `CURRENT_USER_ID` sits on an unguarded route, one directory above a sibling page that does session-checking correctly — the inconsistency is within the same student-facing flow.

### 4.5 Actionable Fixes
1. Add Bearer-token auth + ownership check to `exams/submit.ts` and `classroom/attendance.ts` (mirror `graduate-connect-student.ts` / `classroom/token.ts`).
2. Add a minimal caller check to `email/connect-registration.ts`.
3. Fix `ConnectLayout`'s Sign-out link to call `supabase.auth.signOut()`; replace the hardcoded `"JM"` avatar with `useAuth().profile` data; add a real role guard to `ConnectLayout`/`AdminLayout`.
4. Wire `cohorts/new.tsx` to a real insert (the pattern already exists in `exams/new.tsx`).
5. Wire `legacy-requests.tsx` to the real `legacy_member_requests` table so submissions from `register.tsx` become reviewable.
6. Replace the remaining `console.log`/`setTimeout` stand-ins (graduates, warnings, settings, resources, attendance import, exam status toggle, cohort actions) with real persistence.
7. Build or remove the 9 dead admin sub-routes.
8. Delete orphaned `Header.tsx`, or wire it in if intended.
9. Fix or remove the 3 no-handler buttons noted above.
10. Restrict `profiles_select` RLS before removing the mock-data safety net from any of these pages (module-external prerequisite).

---

## 5. Crosspoint Module

### 5.1 State of Features

| Feature | Status | Evidence |
|---|---|---|
| Leader login | **Working** | The one page in the module wired to real Supabase, including a correct `crosspoint_memberships` query |
| **Join a Crosspoint** | **Broken** | Writes to `crosspoint_members` — a table that does not exist anywhere in the schema (the real table is `crosspoint_memberships`); wrong column name too. Even if fixed, no INSERT policy exists on the real table either, so it would still fail |
| Dashboard, attendance, members, module, notices, schedule, settings (8 pages) | Mock-only, 100% local state | No `supabase` import anywhere in these 8 files; every action mutates only `useState` |
| Settings "Save Changes" | Cosmetic no-op | Flips a boolean for 2.5s, nothing persisted |
| "Archive"/"Dissolve Crosspoint" | Dead buttons | No handler |
| Admin "Create Crosspoint" / "Edit Crosspoint" | Fake success | `setTimeout` then redirect; "Delete" has no handler |
| **Transfer between crosspoints** | **Broken at both UI and DB layer** | Approve/Decline buttons have no handler at all; independently, `transfer_requests` has RLS enabled with **zero policies anywhere**, so even a wired-up version would deny everyone including staff |
| Admin modules list: Publish/Duplicate/Delete/Download | Dead buttons | No handlers |
| Several Quick Action links | Dead | Point at `.../attendance/new`, `.../members/new`, `.../food-bank/new`, `.../modules/new` — none exist |

### 5.2 Dead Code & Orphaned Assets
- `CrosspointLayout.tsx:83-89` hardcodes `"CP Leader"`/`"CL"` — never wired to the real user. "Switch Crosspoint" doesn't call `signOut()` despite the logout icon.
- Notification bell has no handler.
- `join.tsx`'s reference to `crosspoint_members` looks like a stale leftover from before the table was renamed to `crosspoint_memberships` — the login page already uses the correct name, `join.tsx` was never updated.
- Multiple dead buttons and dead links enumerated in §5.1.

### 5.3 Refactoring & Reusability
- The `crosspoint`-lookup-plus-not-found-guard boilerplate is repeated in all 8 `[cpId]/*.tsx` pages — candidate for a `useCrosspoint(cpId)` hook, which would also be the natural place to add the currently-missing auth check.
- Member-avatar-initials markup duplicated across ~7 files — extract `<Avatar member={...}>`.
- Stat-card grid duplicated across 4 files — extract `<StatCard>`/`<StatGrid>`.
- Modal chrome (Cancel/Submit footer, same Tailwind classes) duplicated across 3 files — extract `<FormModal>`.
- Route naming is inconsistent: self-service pages live at `/crosspoint/` (singular), admin pages at `/admin/crosspoints/` (plural) — cosmetic, worth normalizing.
- `MOCK_DATA = true` constants scattered across 6 files, essentially never read conditionally — remove or actually wire up.

### 5.4 Security & Authentication
- Zero route protection anywhere in the module — absent from `middleware.ts`'s matcher entirely, and 0 of 10 leader-facing pages plus all 7 admin-facing pages call `useAuth()`.
- The hardcoded `"CP Leader"` identity block compounds this: an unauthenticated visitor sees what looks like a real, logged-in leader session.
- **Weaker isolation than Connect/Discipleship**: `crosspoint_memberships_select` is `USING (auth.uid() IS NOT NULL)` with no per-zone or per-crosspoint restriction — any authenticated user can read every crosspoint's full roster across all zones, unlike the `user_id = auth.uid() OR is_staff()` pattern used for Connect/Discipleship students.
- Any future roster view that joins to `profiles` inherits the churchwide PII exposure from `profiles_select` (§1.4) on top of the above.

### 5.5 Actionable Fixes
1. Fix `join.tsx`: correct table name (`crosspoint_memberships`) and column (`user_id`), and add an `INSERT` policy — currently none exists for that table.
2. Add `/crosspoint/:path*` to `middleware.ts`'s matcher, and add `useAuth()` role checks to all 10 + 7 pages before any real data is wired in.
3. Add write policies for `crosspoint_memberships` and populate `transfer_requests` (currently RLS-enabled with zero policies) before building real transfer approve/decline handlers.
4. Wire the 8 leader-facing and 4 admin-facing pages to Supabase, replacing every `setTimeout`/local-state stand-in with real persistence.
5. Wire up or remove the dead buttons and dead links enumerated in §5.1/§5.2.
6. Replace the hardcoded `"CP Leader"`/`"CL"` block with `useAuth().profile` data; make "Switch Crosspoint" actually call `signOut()`.
7. Tighten `crosspoint_memberships_select` to scope by zone/membership rather than "any authenticated user," once real querying is wired up.

---

## 6. Consolidated Security Findings (all modules, ranked)

| # | Finding | Severity | Where |
|---|---|---|---|
| 1 | Hardcoded admin password committed to git, endpoint still live, recently used per commit history | **Critical** | `pages/api/setup/seed-test-accounts.ts`, `diagnose.ts` |
| 2 | Unauthenticated, service-role-backed IDOR — attendance can be marked for any user | **Critical** | `pages/api/classroom/attendance.ts` |
| 3 | Unauthenticated, service-role-backed IDOR — exam results can be submitted/locked for any student | **Critical** | `pages/api/connect/exams/submit.ts`, `pages/api/discipleship/exams/submit.ts` |
| 4 | Any authenticated user (any role) can read the entire member directory including PII | **High** | `profiles_select` RLS policy, `supabase/schema.sql:1225-1226` |
| 5 | Any authenticated user can read every crosspoint's membership roster across all zones | **Medium** | `crosspoint_memberships_select` RLS policy |
| 6 | Admin dashboard reachable via a one-line devtools `localStorage` bypass, no real session check | **Medium** | `pages/admin/stream/dashboard.tsx` |
| 7 | Near-total absence of route/component-level auth gating across Admin/Connect/Crosspoint/half of Discipleship | **Medium** (currently masked by mock data; becomes High the moment pages go live) | Module layouts + ~48 individual pages |
| 8 | Unauthenticated privilege-adjacent email/notification triggers (arbitrary `userId`) | **Low** | `pages/api/email/{connect-registration,discipleship-enrollment}.ts` |

---

## 7. Consolidated "Genuinely Broken" Core Flows

These aren't cosmetic — they're advertised features that cannot succeed for any user today:

- **Crosspoint: joining a crosspoint** (wrong table name + no write policy)
- **Crosspoint: transferring between crosspoints** (no button handler + no RLS policy on `transfer_requests`)
- **Discipleship: self-enrollment** (RLS requires staff, but the page is for members enrolling themselves)
- **Discipleship: legacy verification request** (RLS enabled, zero policy)
- **Discipleship: exam creation** (RLS enabled, zero policy)
- **Discipleship: attendance marking/reading via the UI** (RLS enabled, zero policy — the API-route path "works" only because it bypasses RLS entirely, which is itself Finding #2 above)
- **Admin `/admin/stream/dashboard`**: real backend, but its own login gate points at a page that doesn't exist

---

## 8. Prioritized Action List

**P0 — do before anything else touches production data**
1. Rotate/delete `test.admin@ruachtabernacle.org`; rotate `SETUP_SECRET`; delete or env-gate the two `setup/*` endpoints.
2. Add auth checks to `classroom/attendance.ts` and both `exams/submit.ts` routes (copy the pattern already used correctly in `classroom/token.ts` and `admin/graduate-connect-student.ts`).
3. Tighten `profiles_select` RLS to `id = auth.uid() OR is_staff()`.

**P1 — fixes the "broken by policy" flows**
4. Write the missing RLS policies on `discipleship_{exams,exam_questions,exam_answers,attendance,resources,warnings,legacy_requests}`, `transfer_requests`, and add an INSERT policy for `crosspoint_memberships`.
5. Fix `join.tsx`'s wrong table/column name.

**P2 — close the auth-gating gap before wiring more pages to live data**
6. Add `useAuth()`-based role guards to the four layout shells (or a shared wrapper), and to the ~48 individual pages currently unguarded — do this *before* converting any more mock-data pages to Supabase, not after.
7. Add `/crosspoint/:path*` and the remaining Connect/Discipleship sub-routes to `middleware.ts`.

**P3 — architectural cleanup**
8. Decide the fate of `pages/admin/stream/dashboard.tsx` vs `pages/control-panel/**` (duplicate systems) and consolidate.
9. Consolidate `AdminLayout` and `CPLayout`.
10. Extract the shared exam-grading logic used by both Connect and Discipleship before their behavior drifts further (it already has once).
11. Decide whether `context/ModeContext.tsx`'s demo/live toggle is being kept — if so, wire it into the ~85% of pages currently ignoring it; if not, remove it and commit to one data source per page as each is migrated off `@/data`.

**P4 — polish**
12. Fix the dead nav links, dead buttons, and orphaned files listed in each module's §Dead Code section.
