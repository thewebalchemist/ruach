-- Found via QA schema audit: three member-facing upsert call sites
-- (pages/member/onboarding.tsx's connect_students and crosspoint_memberships
-- upserts, and pages/crosspoint/join.tsx's crosspoint_memberships upsert)
-- use .upsert(..., {onConflict: '...'}) as an ordinary member. The INSERT
-- arm is correctly self-service-permitted, but Postgres requires the UPDATE
-- policy to also pass for the ON CONFLICT DO UPDATE arm, and these tables'
-- UPDATE policies are staff-only (is_staff()) — so re-declaring an already-
-- existing enrollment (re-running onboarding) or re-joining a crosspoint
-- after having left it (existing inactive row) silently fails.
--
-- The tempting fix — a broad self-update RLS policy — would let a member
-- PATCH their own row directly via the REST API, including fields RLS can't
-- selectively protect: connect_students/discipleship_students.status
-- (self-declare 'completed' without ever passing an exam), can_graduate,
-- total_attendance_percent, or crosspoint_memberships.role (self-promote to
-- 'leader', which gates real admin-console access elsewhere). That's a
-- genuine grade-forgery / privilege-escalation hole, not a hypothetical.
--
-- Instead: narrow SECURITY DEFINER RPCs, mirroring the is_department_leader()
-- pattern already used for department_memberships. Each function only ever
-- touches the calling user's own row (auth.uid()), and hard-codes every
-- security-sensitive field itself rather than accepting it as a parameter.

CREATE OR REPLACE FUNCTION connect_students_self_upsert(p_cohort_id uuid)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS
$$
DECLARE
  v_admission_number text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT generate_connect_admission_number(date_part('year', now())::int) INTO v_admission_number;

  INSERT INTO connect_students (user_id, cohort_id, admission_number, status)
  VALUES (auth.uid(), p_cohort_id, coalesce(v_admission_number, 'CC-' || date_part('year', now())::text || '-000'), 'completed')
  ON CONFLICT (user_id, cohort_id) DO UPDATE SET status = 'completed';
END;
$$;

CREATE OR REPLACE FUNCTION discipleship_students_self_upsert(p_cohort_id uuid, p_level int)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS
$$
DECLARE
  v_admission_number text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT generate_discipleship_admission_number(date_part('year', now())::int) INTO v_admission_number;

  INSERT INTO discipleship_students (user_id, cohort_id, level, admission_number, status)
  VALUES (auth.uid(), p_cohort_id, p_level, coalesce(v_admission_number, 'KDC-' || date_part('year', now())::text || '-000'), 'completed')
  ON CONFLICT (user_id, cohort_id) DO UPDATE SET status = 'completed', level = p_level;
END;
$$;

CREATE OR REPLACE FUNCTION crosspoint_memberships_self_upsert(p_crosspoint_id uuid)
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS
$$BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- role is deliberately never parameterized: this function can only ever
  -- (re)join the caller as a plain 'member', never a leader/assistant/treasurer.
  INSERT INTO crosspoint_memberships (user_id, crosspoint_id, role, status, joined_date)
  VALUES (auth.uid(), p_crosspoint_id, 'member', 'active', current_date)
  ON CONFLICT (user_id, crosspoint_id) DO UPDATE SET status = 'active';
END;$$;

GRANT EXECUTE ON FUNCTION connect_students_self_upsert(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION discipleship_students_self_upsert(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION crosspoint_memberships_self_upsert(uuid) TO authenticated;
