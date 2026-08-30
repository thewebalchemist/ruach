-- ============================================================
-- Dynamic, admin-configurable RBAC (Batch 3 — see execution plan
-- Appendix A for full design rationale).
--
-- Layers on top of the existing global profiles.role, does not replace it:
--   profiles.role ('admin'/'pastor') = "can reach /admin at all"
--   these tables                     = "which modules within it"
-- None of the ~30 existing is_staff()/is_admin() call sites are touched.
-- ============================================================

-- uuid-ossp installs into the `extensions` schema on Supabase; this
-- connection's search_path doesn't include it by default.
SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS admin_permissions (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_key   text        NOT NULL,
  action       text        NOT NULL,
  description  text        NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_key, action)
);

CREATE TABLE IF NOT EXISTS admin_roles (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text        NOT NULL UNIQUE,
  description    text,
  is_system_role boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_id       uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- department_id NULL = churchwide grant. Non-null scopes the grant to one
-- department's own data (departments, department_memberships, join requests,
-- and any department-scoped resources) — callers acting on department-shaped
-- resources must additionally check get_permission_departments() below for
-- row-level filtering; has_permission() alone only answers "can they at all."
CREATE TABLE IF NOT EXISTS user_admin_roles (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id        uuid        NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  department_id  text        REFERENCES departments(id) ON DELETE CASCADE,
  granted_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id, department_id)
);

CREATE INDEX IF NOT EXISTS user_admin_roles_user_idx ON user_admin_roles(user_id);
CREATE INDEX IF NOT EXISTS admin_role_permissions_role_idx ON admin_role_permissions(role_id);

ALTER TABLE admin_permissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_admin_roles       ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read the reference permission list and role
-- catalogue (needed to render the matrix UI and for a user's own nav to
-- resolve client-side) — mutation is API-route-only via the service role,
-- gated by has_permission(caller, 'settings', 'manage') at the app layer.
CREATE POLICY admin_permissions_read ON admin_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY admin_roles_read ON admin_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY admin_role_permissions_read ON admin_role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- A user may read their own grants (to resolve their own nav); staff may
-- read all (for the assignment UI's "who holds this role" view).
CREATE POLICY user_admin_roles_read ON user_admin_roles FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

-- ── has_permission() ─────────────────────────────────────────────────────────
-- Two-argument overload for RLS policies (implicit auth.uid()), matching the
-- existing is_staff()/is_admin() zero-arg style. Three-argument overload for
-- API routes that already resolved the caller's id via a Bearer token and
-- are calling through the service-role client (where auth.uid() isn't set).
CREATE OR REPLACE FUNCTION has_permission(p_user_id uuid, p_module text, p_action text)
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT EXISTS (
    SELECT 1 FROM user_admin_roles uar
    JOIN admin_role_permissions arp ON arp.role_id = uar.role_id
    JOIN admin_permissions ap ON ap.id = arp.permission_id
    WHERE uar.user_id = p_user_id AND ap.module_key = p_module AND ap.action = p_action
  )
  -- Pastor keeps the same unconditional trust is_admin() already gives it,
  -- so a misconfigured/empty role table can never lock out that tier.
  OR EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND role = 'pastor')
$$;

CREATE OR REPLACE FUNCTION has_permission(p_module text, p_action text)
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$SELECT has_permission(auth.uid(), p_module, p_action)$$;

CREATE OR REPLACE FUNCTION get_permission_departments(p_user_id uuid, p_module text, p_action text)
  RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT uar.department_id FROM user_admin_roles uar
  JOIN admin_role_permissions arp ON arp.role_id = uar.role_id
  JOIN admin_permissions ap ON ap.id = arp.permission_id
  WHERE uar.user_id = p_user_id AND ap.module_key = p_module AND ap.action = p_action
$$;

-- Flattened permission set for the current session — one RPC call at login
-- instead of three separate RLS-gated table reads (see lib/admin-auth.ts /
-- context/AuthContext.tsx). Client-callable (implicit auth.uid()).
CREATE OR REPLACE FUNCTION get_my_admin_permissions()
  RETURNS TABLE (module_key text, action text, department_id text)
  LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT ap.module_key, ap.action, uar.department_id
  FROM user_admin_roles uar
  JOIN admin_role_permissions arp ON arp.role_id = uar.role_id
  JOIN admin_permissions ap ON ap.id = arp.permission_id
  WHERE uar.user_id = auth.uid()
$$;

-- Same, but for an explicit user id — used server-side (lib/admin-auth.ts)
-- via the service-role client, where auth.uid() isn't set.
CREATE OR REPLACE FUNCTION get_admin_permissions_for_user(p_user_id uuid)
  RETURNS TABLE (module_key text, action text, department_id text)
  LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT ap.module_key, ap.action, uar.department_id
  FROM user_admin_roles uar
  JOIN admin_role_permissions arp ON arp.role_id = uar.role_id
  JOIN admin_permissions ap ON ap.id = arp.permission_id
  WHERE uar.user_id = p_user_id
$$;

-- ── Seed reference permissions ────────────────────────────────────────────────
-- view = can see the module's read-only pages; manage = create/edit routine
-- content. Finer actions are split out where a blanket "manage" would be
-- dangerously broad (e.g. members.delete).
INSERT INTO admin_permissions (module_key, action, description) VALUES
  ('dashboard',     'view',    'View the admin dashboard/overview'),

  ('members',       'view',    'View member directory and profiles'),
  ('members',       'edit',    'Edit member profile fields, including member number'),
  ('members',       'delete',  'Delete or deactivate a member record'),

  ('crosspoints',   'view',    'View crosspoints, transfers, and modules'),
  ('crosspoints',   'manage',  'Create/edit crosspoints, approve transfers'),

  ('connect',       'view',    'View Connect Class cohorts and students'),
  ('connect',       'manage',  'Manage cohorts, exams, and graduate students'),

  ('discipleship',  'view',    'View discipleship overview and cohorts'),
  ('discipleship',  'manage',  'Manage discipleship content and progress'),

  ('departments',   'view',    'View departments and their members'),
  ('departments',   'manage',  'Edit department details, approve join requests'),
  ('departments',   'assign',  'Assign/remove department leaders'),

  ('events',        'view',    'View events and registrations'),
  ('events',        'manage',  'Create/edit/cancel events'),

  ('food-bank',     'view',    'View food bank requests/inventory'),
  ('food-bank',     'manage',  'Manage food bank requests and inventory'),

  ('prayer',        'view',    'View prayer requests'),
  ('prayer',        'manage',  'Respond to / close prayer requests'),

  ('suggestions',   'view',    'View member suggestions'),
  ('suggestions',   'manage',  'Respond to / close suggestions'),

  ('notices',       'view',    'View notices'),
  ('notices',       'manage',  'Create/edit/publish notices'),

  ('broadcast',     'view',    'View broadcast history'),
  ('broadcast',     'send',    'Send a broadcast email/SMS/notification'),

  ('reports',       'view',    'View analytics/reports'),
  ('reports',       'export',  'Export report data'),

  ('stream',        'view',    'View streaming dashboard'),
  ('stream',        'manage',  'Manage sermons, series, and stream settings'),

  ('users',         'view',    'View internal user/staff accounts'),
  ('users',         'manage',  'Edit staff account roles/status'),

  ('settings',      'view',    'View system settings'),
  ('settings',      'manage',  'Edit system settings, including roles & permissions'),

  ('search',        'view',    'Use the global admin search')
ON CONFLICT (module_key, action) DO NOTHING;

-- ── Seed system role: Super Admin (every permission) ──────────────────────────
INSERT INTO admin_roles (name, description, is_system_role)
  VALUES ('Super Admin', 'Full access to every admin module and action.', true)
  ON CONFLICT (name) DO NOTHING;

INSERT INTO admin_role_permissions (role_id, permission_id)
  SELECT (SELECT id FROM admin_roles WHERE name = 'Super Admin'), id FROM admin_permissions
  ON CONFLICT DO NOTHING;

-- Backward-compat: every profile that currently trusts is_admin()
-- unconditionally keeps full access on day one. A super admin can
-- deliberately narrow access afterward through the Roles & Permissions UI.
INSERT INTO user_admin_roles (user_id, role_id, department_id)
  SELECT p.id, (SELECT id FROM admin_roles WHERE name = 'Super Admin'), NULL
  FROM profiles p WHERE p.role IN ('admin', 'pastor')
  ON CONFLICT DO NOTHING;

-- ── Seed example scoped role + the department it references ──────────────────
INSERT INTO departments (id, name, description, icon) VALUES
  ('procurement', 'Procurement', 'Purchasing, vendor relations, and church asset management', 'ShoppingCart')
ON CONFLICT (id) DO NOTHING;

INSERT INTO admin_roles (name, description, is_system_role)
  VALUES ('Procurement Officer', 'Manages procurement-related department operations.', false)
  ON CONFLICT (name) DO NOTHING;

INSERT INTO admin_role_permissions (role_id, permission_id)
  SELECT (SELECT id FROM admin_roles WHERE name = 'Procurement Officer'), id
  FROM admin_permissions WHERE (module_key, action) IN
    (('departments','view'), ('departments','manage'), ('events','view'), ('reports','view'))
  ON CONFLICT DO NOTHING;
