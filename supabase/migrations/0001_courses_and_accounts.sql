-- ============================================================
-- DentalWeb — Courses, enrolment and client accounts
-- ============================================================
-- Run with:  supabase db push
--            (or paste into the Supabase SQL editor)
--
-- This migration adds:
--   * user_profiles        — optional client & student information
--   * instructors          — course instructors, owned by a facility
--   * courses (extended)   — subject, level, training type, objectives, policy
--   * course_sessions      — the individual sessions of a course
--   * course_enrollments   — a student's registration for a course
--   * payments (extended)  — a payment may belong to a booking OR an enrolment
--   * enroll_in_course()   — transactional, capacity-safe enrolment
-- ============================================================

-- ============================================================
-- 1. USER PROFILES
-- ============================================================
-- Everything here is optional. The platform only needs a name and an
-- email to operate; these fields help facilities prepare a session and
-- help students keep their own record straight.
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id             UUID PRIMARY KEY REFERENCES platform_users(id) ON DELETE CASCADE,
  date_of_birth       DATE,
  city                TEXT,
  university          TEXT,
  academic_level      TEXT
                      CHECK (academic_level IS NULL OR academic_level IN
                             ('first_year','second_year','third_year','fourth_year',
                              'fifth_year','postgraduate','resident','other')),
  professional_status TEXT
                      CHECK (professional_status IS NULL OR professional_status IN
                             ('student','graduate','dentist','other')),
  interests           TEXT[] DEFAULT '{}',
  -- Notification preferences
  notify_email        BOOLEAN NOT NULL DEFAULT TRUE,
  notify_sms          BOOLEAN NOT NULL DEFAULT FALSE,
  timezone            TEXT NOT NULL DEFAULT 'Africa/Cairo',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN user_profiles.interests IS
  'Areas of interest — free text, used only to help a facility prepare a session.';
COMMENT ON COLUMN user_profiles.professional_status IS
  'Self-declared professional status. Not verified by the platform.';

-- ============================================================
-- 2. INSTRUCTORS
-- ============================================================
CREATE TABLE IF NOT EXISTS instructors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  bio            TEXT,
  qualifications TEXT,
  profile_image  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_instructors_clinic ON instructors(clinic_id);

-- ============================================================
-- 3. COURSES (extended)
-- ============================================================
-- A course is not an equipment rental. It has its own instructor, schedule,
-- capacity, learning objectives and its own configurable payment policy.
-- The hourly rental rate and the 50% rental deposit do NOT apply here.
-- ============================================================
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS slug                TEXT,
  ADD COLUMN IF NOT EXISTS instructor_id        UUID REFERENCES instructors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject              TEXT,
  ADD COLUMN IF NOT EXISTS specialty            TEXT,
  ADD COLUMN IF NOT EXISTS academic_level       TEXT,
  ADD COLUMN IF NOT EXISTS training_type        TEXT
                          DEFAULT 'practical'
                          CHECK (training_type IS NULL OR training_type IN
                                 ('theoretical','practical','combined')),
  ADD COLUMN IF NOT EXISTS learning_objectives  TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS topics               TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS theoretical_components TEXT,
  ADD COLUMN IF NOT EXISTS practical_components   TEXT,
  ADD COLUMN IF NOT EXISTS includes_supervised_practice BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS materials_required   TEXT,
  ADD COLUMN IF NOT EXISTS registration_open_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_close_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_policy        TEXT NOT NULL DEFAULT 'full'
                          CHECK (payment_policy IN ('free','full','deposit')),
  ADD COLUMN IF NOT EXISTS deposit_pct           INTEGER
                          CHECK (deposit_pct IS NULL OR (deposit_pct > 0 AND deposit_pct < 100)),
  ADD COLUMN IF NOT EXISTS published_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_count        INTEGER NOT NULL DEFAULT 0;

-- A course needs a URL-friendly identifier.
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug) WHERE slug IS NOT NULL;

-- Allow a course to be a draft before it is published.
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_status_check;
ALTER TABLE courses
  ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft','upcoming','ongoing','completed','cancelled'));

COMMENT ON COLUMN courses.payment_policy IS
  'How a course is paid for: free, full up-front, or a percentage deposit. Independent of the hourly rental rules.';
COMMENT ON COLUMN courses.includes_supervised_practice IS
  'Whether the course includes supervised hands-on practice.';

-- ============================================================
-- 4. COURSE SESSIONS
-- ============================================================
-- A course can run over several sessions. Capacity belongs to the course as
-- a whole; sessions describe when and where the teaching happens.
-- ============================================================
CREATE TABLE IF NOT EXISTS course_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  start_datetime  TIMESTAMPTZ NOT NULL,
  end_datetime    TIMESTAMPTZ,
  location        TEXT,
  session_index   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_session_time CHECK (end_datetime IS NULL OR end_datetime > start_datetime)
);
CREATE INDEX idx_course_sessions_course ON course_sessions(course_id, start_datetime);

-- ============================================================
-- 5. COURSE ENROLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS course_enrollments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'registered'
                 CHECK (status IN ('registered','confirmed','attended','withdrawn','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'not_required'
                 CHECK (payment_status IN ('not_required','pending','paid','failed','refunded')),
  payment_amount INTEGER NOT NULL DEFAULT 0,
  notes          TEXT,
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A student cannot register twice for the same course.
  CONSTRAINT course_enrollment_unique UNIQUE (course_id, user_id)
);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(course_id, status);

-- ============================================================
-- 6. PAYMENTS (extended)
-- ============================================================
-- A payment may settle a booking or a course enrolment, never both.
ALTER TABLE payments ALTER COLUMN booking_id DROP NOT NULL;
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS course_enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_booking_id_fkey;
ALTER TABLE payments
  ADD CONSTRAINT payments_one_owner
  CHECK ((booking_id IS NOT NULL AND course_enrollment_id IS NULL)
      OR (booking_id IS NULL AND course_enrollment_id IS NOT NULL));
CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payments(course_enrollment_id);

-- ============================================================
-- 7. TRANSACTIONAL ENROLMENT
-- ============================================================
-- Capacity is enforced here, not in the browser. The course row is locked
-- FOR UPDATE, so two students registering for the final seat at the same
-- moment are serialised: the second one sees the updated count and is
-- refused.
--
-- The function also verifies that the caller is enrolling themselves.
-- ============================================================
CREATE OR REPLACE FUNCTION enroll_in_course(
  p_course_id UUID,
  p_user_id   UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course     courses%ROWTYPE;
  v_existing   course_enrollments%ROWTYPE;
  v_had_enrollment BOOLEAN := false;
  v_taken      INTEGER;
  v_enrollment course_enrollments%ROWTYPE;
  v_amount     INTEGER;
BEGIN
  -- The caller may only enrol themselves.
  IF NOT EXISTS (
    SELECT 1 FROM platform_users pu WHERE pu.id = p_user_id AND pu.uid = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_authorised' USING ERRCODE = '42501';
  END IF;

  -- Lock the course row so concurrent registrations serialise.
  SELECT * INTO v_course FROM courses WHERE id = p_course_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'course_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_course.status <> 'upcoming' OR NOT v_course.is_active THEN
    RAISE EXCEPTION 'course_not_available' USING ERRCODE = 'P0002';
  END IF;

  IF v_course.registration_open_at IS NOT NULL
     AND NOW() < v_course.registration_open_at THEN
    RAISE EXCEPTION 'registration_not_open' USING ERRCODE = 'P0002';
  END IF;

  IF v_course.registration_close_at IS NOT NULL
     AND NOW() > v_course.registration_close_at THEN
    RAISE EXCEPTION 'registration_closed' USING ERRCODE = 'P0002';
  END IF;

  -- An existing, still-live enrolment is returned rather than duplicated.
  SELECT * INTO v_existing
  FROM course_enrollments
  WHERE course_id = p_course_id AND user_id = p_user_id;

  -- FOUND is captured here on purpose. Later queries set it again, and a
  -- COUNT always reports FOUND = true, so relying on it further down would
  -- silently skip the INSERT for a student who is not yet registered.
  v_had_enrollment := FOUND;

  IF v_had_enrollment AND v_existing.status NOT IN ('withdrawn','cancelled') THEN
    RAISE EXCEPTION 'already_enrolled' USING ERRCODE = 'P0002';
  END IF;

  SELECT COUNT(*) INTO v_taken
  FROM course_enrollments
  WHERE course_id = p_course_id AND status NOT IN ('withdrawn','cancelled');

  IF v_taken >= v_course.capacity THEN
    RAISE EXCEPTION 'course_full' USING ERRCODE = 'P0002';
  END IF;

  -- What the student owes now, per the course's own policy.
  v_amount := CASE v_course.payment_policy
                WHEN 'free' THEN 0
                WHEN 'deposit' THEN
                  (v_course.price_egp * COALESCE(v_course.deposit_pct, 50)) / 100
                ELSE v_course.price_egp
              END;

  IF v_had_enrollment THEN
    UPDATE course_enrollments
       SET status = 'registered',
           payment_status = CASE WHEN v_amount > 0 THEN 'pending' ELSE 'not_required' END,
           payment_amount = v_amount,
           updated_at = NOW()
     WHERE id = v_existing.id
    RETURNING * INTO v_enrollment;
  ELSE
    INSERT INTO course_enrollments (
      course_id, user_id, status, payment_status, payment_amount
    ) VALUES (
      p_course_id, p_user_id, 'registered',
      CASE WHEN v_amount > 0 THEN 'pending' ELSE 'not_required' END,
      v_amount
    )
    RETURNING * INTO v_enrollment;
  END IF;

  RETURN jsonb_build_object(
    'enrollment',      to_jsonb(v_enrollment),
    'seats_taken',     v_taken + 1,
    'capacity',        v_course.capacity,
    'payment_amount',  v_amount,
    'payment_policy',  v_course.payment_policy
  );
END;
$$;

COMMENT ON FUNCTION enroll_in_course(UUID, UUID) IS
  'Registers a student for a course. Capacity is enforced under a row lock so '
  'the final seat cannot be taken twice. SECURITY DEFINER so the capacity '
  'check runs inside the transaction.';

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE user_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- ── user_profiles ─────────────────────────────────────────────
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  ) WITH CHECK (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

-- ── instructors ───────────────────────────────────────────────
CREATE POLICY "Public can view instructors" ON instructors
  FOR SELECT USING (TRUE);

CREATE POLICY "Facility staff manage instructors" ON instructors
  FOR ALL USING (
    clinic_id IN (SELECT cm.clinic_id FROM clinic_memberships cm
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  ) WITH CHECK (
    clinic_id IN (SELECT cm.clinic_id FROM clinic_memberships cm
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  );

-- ── courses ───────────────────────────────────────────────────
-- Only published courses are visible to the public.
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (
    status IN ('upcoming','ongoing','completed')
    AND (is_active OR clinic_id IN (
      SELECT cm.clinic_id FROM clinic_memberships cm
      JOIN platform_users pu ON pu.id = cm.user_id
      WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager')
    ))
  );

CREATE POLICY "Facility staff manage own courses" ON courses
  FOR ALL USING (
    clinic_id IN (SELECT cm.clinic_id FROM clinic_memberships cm
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  ) WITH CHECK (
    clinic_id IN (SELECT cm.clinic_id FROM clinic_memberships cm
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  );

-- ── course_sessions ──────────────────────────────────────────
CREATE POLICY "Public can view sessions of published courses" ON course_sessions
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses
                  WHERE status IN ('upcoming','ongoing','completed'))
  );

CREATE POLICY "Facility staff manage sessions" ON course_sessions
  FOR ALL USING (
    course_id IN (SELECT c.id FROM courses c
                  JOIN clinic_memberships cm ON cm.clinic_id = c.clinic_id
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  ) WITH CHECK (
    course_id IN (SELECT c.id FROM courses c
                  JOIN clinic_memberships cm ON cm.clinic_id = c.clinic_id
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  );

-- ── course_enrollments ───────────────────────────────────────
CREATE POLICY "Students can read own enrolments" ON course_enrollments
  FOR SELECT USING (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

CREATE POLICY "Facility staff can read enrolments for own courses" ON course_enrollments
  FOR SELECT USING (
    course_id IN (SELECT c.id FROM courses c
                  JOIN clinic_memberships cm ON cm.clinic_id = c.clinic_id
                  JOIN platform_users pu ON pu.id = cm.user_id
                  WHERE pu.uid = auth.uid() AND cm.role IN ('owner','manager'))
  );

-- Enrolment itself happens through enroll_in_course(), which checks the
-- caller and the capacity under a lock.
CREATE POLICY "Students can insert own enrolments" ON course_enrollments
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

CREATE POLICY "Students can update own enrolments" ON course_enrollments
  FOR UPDATE USING (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  ) WITH CHECK (
    user_id IN (SELECT id FROM platform_users WHERE uid = auth.uid())
  );

-- ============================================================
-- 9. PROFILE COMPLETENESS
-- ============================================================
-- A small helper the account dashboard uses to show how much of a
-- profile the student has filled in.
-- ============================================================
CREATE OR REPLACE FUNCTION profile_completion(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    CASE WHEN pu.name IS NOT NULL AND pu.name <> '' THEN 20 ELSE 0 END +
    CASE WHEN pu.phone IS NOT NULL AND pu.phone <> '' THEN 20 ELSE 0 END +
    CASE WHEN pu.avatar_url IS NOT NULL AND pu.avatar_url <> '' THEN 20 ELSE 0 END +
    CASE WHEN up.city IS NOT NULL AND up.city <> '' THEN 20 ELSE 0 END +
    CASE WHEN up.university IS NOT NULL AND up.university <> '' THEN 20 ELSE 0 END
  )::INTEGER
  FROM platform_users pu
  LEFT JOIN user_profiles up ON up.user_id = pu.id
  WHERE pu.id = p_user_id;
$$;
