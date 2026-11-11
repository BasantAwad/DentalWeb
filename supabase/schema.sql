-- ============================================================
-- Dental Platform — Supabase Schema
-- Multi-tenant clinic booking & education platform
-- PostgreSQL (Africa/Cairo timezone default)
-- Run via: supabase db push  OR  paste into Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Default timezone for the clinic platform
SET timezone = 'Africa/Cairo';

-- ============================================================
-- 1. PLATFORM USERS / AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid             UUID NOT NULL UNIQUE,              -- Supabase auth uid
  email           TEXT NOT NULL,
  phone           TEXT,
  name            TEXT NOT NULL,
  platform_role   TEXT NOT NULL DEFAULT 'user'
                  CHECK (platform_role IN ('platform_owner','clinic_owner','manager','staff','user')),
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_platform_users_email ON platform_users(email);

-- ============================================================
-- 2. CLINICS (tenants)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinics (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  slug                     TEXT NOT NULL UNIQUE,
  logo_url                 TEXT,
  cover_image_url          TEXT,
  description              TEXT,
  address                  TEXT,
  city                     TEXT,
  phone                    TEXT,
  email                    TEXT,
  timezone                 TEXT NOT NULL DEFAULT 'Africa/Cairo',
  brand_color              TEXT,
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  deposit_pct              INTEGER NOT NULL DEFAULT 50,          -- % of total due as deposit
  cancellation_cutoff_hours INTEGER NOT NULL DEFAULT 24,        -- hours before appointment
  paymob_config_id         UUID,                                  -- FK to paymob_configs
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_active ON clinics(is_active);

-- ============================================================
-- 3. CLINIC MEMBERSHIPS (multi-tenant access)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_memberships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'staff'
              CHECK (role IN ('owner','manager','staff')),
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','pending','invited')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, clinic_id)
);
CREATE INDEX idx_cm_user ON clinic_memberships(user_id);
CREATE INDEX idx_cm_clinic ON clinic_memberships(clinic_id);

-- ============================================================
-- 4. PAYMOB CONFIGS (per-clinic or platform-level)
-- ============================================================
CREATE TABLE IF NOT EXISTS paymob_configs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id            UUID REFERENCES clinics(id) ON DELETE SET NULL,  -- null = platform-level
  integration_id       TEXT NOT NULL,                                     -- Paymob integration ID
  webhook_key          TEXT NOT NULL,                                     -- for webhook verification
  api_key              TEXT NOT NULL,                                     -- server-side only
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  environment          TEXT NOT NULL DEFAULT 'sandbox'
                       CHECK (environment IN ('sandbox','production')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. OPERATING HOURS (recurring)
-- ============================================================
CREATE TABLE IF NOT EXISTS operating_hours (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  resource_id    UUID,                                     -- optional: per-resource hours
  weekday        INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),  -- 0=Sunday (Egypt)
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  effective_from DATE,
  effective_to   DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_hours CHECK (start_time < end_time)
);
CREATE INDEX idx_oh_clinic ON operating_hours(clinic_id);
CREATE INDEX idx_oh_resource ON operating_hours(resource_id);

-- ============================================================
-- 6. SERVICES (catalog per clinic)
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id        UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL
                   CHECK (category IN ('general','radiography','sterilization','chair_rental','dummy_head','course','assistance','other')),
  description      TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_egp        INTEGER NOT NULL,                             -- integer minor units (EGP)
  deposit_egp      INTEGER,                                       -- fixed deposit override
  deposit_pct      INTEGER,                                       -- % of price (used if deposit_egp is null)
  buffer_minutes   INTEGER NOT NULL DEFAULT 0,                   -- extra buffer after booking
  resource_type    TEXT CHECK (resource_type IN ('chair','dummy_head','xray','sterilization','course','assistance')),
  image_url        TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  is_bookable      BOOLEAN NOT NULL DEFAULT TRUE,
  booking_mode     TEXT NOT NULL DEFAULT 'hourly'
                   CHECK (booking_mode IN ('hourly','session','all_day')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_clinic ON services(clinic_id);
CREATE INDEX idx_services_active ON services(clinic_id, is_active);

-- ============================================================
-- 7. RESOURCES (chairs, dummy heads, x-ray, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('chair','dummy_head','xray','sterilization','course')),
  location    TEXT,
  description TEXT,
  capacity    INTEGER NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_resources_clinic ON resources(clinic_id);

-- ============================================================
-- 8. AVAILABILITY BLOCKS (closures, maintenance, phone-call blocks)
-- ============================================================
CREATE TABLE IF NOT EXISTS availability_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  start_dt    TIMESTAMPTZ NOT NULL,
  end_dt      TIMESTAMPTZ NOT NULL,
  reason      TEXT NOT NULL
              CHECK (reason IN ('holiday','closure','maintenance','phone_call','blackout','other')),
  created_by  UUID NOT NULL REFERENCES platform_users(id),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT block_time CHECK (start_dt < end_dt)
);
CREATE INDEX idx_blocks_clinic ON availability_blocks(clinic_id);
CREATE INDEX idx_blocks_resource ON availability_blocks(resource_id);

-- ============================================================
-- 9. BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         TEXT NOT NULL UNIQUE DEFAULT 'BK-' || to_char(NOW(), 'YYMMDD') || '-' || substring(md5(random()::text), 1, 6),
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES platform_users(id),
  service_id        UUID REFERENCES services(id) ON DELETE SET NULL,
  resource_id       UUID REFERENCES resources(id) ON DELETE SET NULL,
  start_dt          TIMESTAMPTZ NOT NULL,
  end_dt            TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','held','confirmed','completed','cancelled','no_show')),
  notes             TEXT,
  deposit_due_egp   INTEGER NOT NULL DEFAULT 0,
  balance_due_egp   INTEGER NOT NULL DEFAULT 0,
  deposit_paid_egp  INTEGER NOT NULL DEFAULT 0,
  source            TEXT NOT NULL DEFAULT 'web'
                    CHECK (source IN ('web','phone','walk_in','admin')),
  created_by        UUID NOT NULL REFERENCES platform_users(id),
  cancelled_by      UUID REFERENCES platform_users(id),
  cancelled_at      TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_time CHECK (start_dt < end_dt)
);
CREATE INDEX idx_bookings_clinic ON bookings(clinic_id);
CREATE INDEX idx_bookings_resource ON bookings(resource_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time ON bookings(start_dt, end_dt);

-- ============================================================
-- 10. BOOKING HOLDS (short-lived slot reservation during checkout)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_holds (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  resource_id        UUID NOT NULL REFERENCES resources(id),
  start_dt           TIMESTAMPTZ NOT NULL,
  end_dt             TIMESTAMPTZ NOT NULL,
  expiration_dt      TIMESTAMPTZ NOT NULL,                       -- when hold expires
  checkout_session_id TEXT,
  status             TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','expired','converted','released')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_holds_resource ON booking_holds(resource_id);
CREATE INDEX idx_holds_expiration ON booking_holds(expiration_dt);

-- ============================================================
-- 11. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  clinic_id          UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  provider           TEXT NOT NULL CHECK (provider IN ('paymob','offline','cash')),
  provider_tx_id     TEXT,                                        -- Paymob transaction reference
  amount_egp         INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'EGP',
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','initiated','paid','failed','refunded','offline_recorded')),
  verified_at        TIMESTAMPTZ,                                -- when server verified the callback
  idempotency_key    TEXT UNIQUE,                                 -- prevent duplicate processing
  raw_metadata       JSONB,                                       -- safe storage of Paymob callback payload
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_provider_tx ON payments(provider_tx_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- 12. COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id     UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  instructor    TEXT,
  description   TEXT,
  start_dt      TIMESTAMPTZ NOT NULL,
  end_dt        TIMESTAMPTZ NOT NULL,
  capacity      INTEGER NOT NULL DEFAULT 20,
  price_egp     INTEGER NOT NULL,
  deposit_egp   INTEGER,
  image_url     TEXT,
  syllabus      TEXT,
  status        TEXT NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_time CHECK (start_dt < end_dt)
);
CREATE INDEX idx_courses_clinic ON courses(clinic_id);

-- ============================================================
-- 13. TOOTH ASSISTANCE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tooth_assistance_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL REFERENCES platform_users(id),
  clinic_id                 UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  booking_id                UUID REFERENCES bookings(id) ON DELETE SET NULL,
  arch_choice               TEXT NOT NULL CHECK (arch_choice IN ('upper','lower','both')),
  selected_teeth            TEXT[] NOT NULL DEFAULT '{}',       -- FDI notation e.g. {16,17,26}
  notes                     TEXT,
  preferred_appointment_type TEXT,
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','reviewed','scheduled','completed','cancelled')),
  assigned_staff_id         UUID REFERENCES platform_users(id),
  reviewed_at               TIMESTAMPTZ,
  reviewed_notes            TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tar_clinic ON tooth_assistance_requests(clinic_id);
CREATE INDEX idx_tar_status ON tooth_assistance_requests(status);

-- ============================================================
-- 14. TOOTH MODEL ASSETS (3D / 2D)
-- ============================================================
CREATE TABLE IF NOT EXISTS tooth_model_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  arch            TEXT NOT NULL CHECK (arch IN ('upper','lower','full')),
  asset_url       TEXT NOT NULL,
  version         TEXT NOT NULL DEFAULT '1.0',
  interaction_mode TEXT NOT NULL DEFAULT '3d' CHECK (interaction_mode IN ('3d','2d','both')),
  attribution     TEXT,
  license         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tma_active ON tooth_model_assets(is_active);

-- ============================================================
-- 15. STERILIZATION / REPROCESSING JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS sterilization_jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id          UUID NOT NULL REFERENCES services(id),
  clinic_id           UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  start_dt            TIMESTAMPTZ NOT NULL,
  end_dt              TIMESTAMPTZ NOT NULL,
  turnaround_minutes INTEGER NOT NULL DEFAULT 60,
  status              TEXT NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled','in_progress','completed','overdue')),
  assigned_staff_id   UUID REFERENCES platform_users(id),
  completed_at        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sj_time CHECK (start_dt < end_dt)
);
CREATE INDEX idx_sj_clinic ON sterilization_jobs(clinic_id);
CREATE INDEX idx_sj_status ON sterilization_jobs(status);

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES platform_users(id),
  recipient      TEXT,                              -- email or phone when user_id not set
  event_type     TEXT NOT NULL,
  channel        TEXT NOT NULL CHECK (channel IN ('email','sms','in_app')),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed')),
  sent_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_clinic ON notifications(clinic_id);
CREATE INDEX idx_notifications_status ON notifications(delivery_status);

-- ============================================================
-- 17. AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   UUID REFERENCES clinics(id) ON DELETE SET NULL,
  actor_id    UUID NOT NULL REFERENCES platform_users(id),
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   UUID,
  before      JSONB,
  after       JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_clinic ON audit_logs(clinic_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- 18. RLS POLICIES (Row-Level Security)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE platform_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics                ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE paymob_configs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services               ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holds          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooth_model_assets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- Platform users: users can read their own row; admins can read all
CREATE POLICY "Users can view own profile" ON platform_users
  FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update own profile" ON platform_users
  FOR UPDATE USING (auth.uid() = uid);

-- Clinics: public can read active clinics; clinic staff can manage their own
CREATE POLICY "Public can view active clinics" ON clinics
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clinic staff manage own clinic" ON clinics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = clinics.id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.status = 'active'
    )
  );

-- Clinic memberships
CREATE POLICY "Memberships visible to clinic members" ON clinic_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships cm
      WHERE cm.clinic_id = clinic_memberships.clinic_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );
CREATE POLICY "Users manage own memberships" ON clinic_memberships
  FOR ALL USING (user_id = auth.uid());

-- Services: public can read active; clinic staff manage own
CREATE POLICY "Public view active services" ON services
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clinic staff manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = services.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
  );

-- Resources: public view active; clinic staff manage
CREATE POLICY "Public view active resources" ON resources
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clinic staff manage resources" ON resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = resources.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
  );

-- Operating hours: clinic staff manage
CREATE POLICY "Clinic staff manage hours" ON operating_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = operating_hours.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
  );

-- Availability blocks: clinic staff manage; public can view for availability calc
CREATE POLICY "Staff manage blocks" ON availability_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = availability_blocks.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Bookings: user can view own; clinic staff can view clinic bookings; public read minimal
CREATE POLICY "Users view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Clinic staff view clinic bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = bookings.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );
CREATE POLICY "Clinic staff manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = bookings.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Booking holds: clinic staff manage; users view own holds via booking
CREATE POLICY "Clinic staff view holds" ON booking_holds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = (
        SELECT clinic_id FROM bookings WHERE bookings.id = booking_holds.booking_id
      )
        AND clinic_memberships.user_id = auth.uid()
    )
  );
CREATE POLICY "Clinic staff manage holds" ON booking_holds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = (
        SELECT clinic_id FROM bookings WHERE bookings.id = booking_holds.booking_id
      )
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Payments: clinic staff view/manage; user view own via booking
CREATE POLICY "Clinic staff view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = payments.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );
CREATE POLICY "Clinic staff manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = payments.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Courses: public view active; clinic staff manage
CREATE POLICY "Public view active courses" ON courses
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clinic staff manage courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = courses.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
  );

-- Tooth assistance requests: user view own; clinic staff view clinic; staff manage
CREATE POLICY "Users view own tooth requests" ON tooth_assistance_requests
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Clinic staff view clinic requests" ON tooth_assistance_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = tooth_assistance_requests.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );
CREATE POLICY "Clinic staff manage requests" ON tooth_assistance_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = tooth_assistance_requests.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Tooth model assets: public view active; clinic staff manage
CREATE POLICY "Public view active tooth assets" ON tooth_model_assets
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Clinic staff manage tooth assets" ON tooth_model_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = tooth_model_assets.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
    OR tooth_model_assets.clinic_id IS NULL
  );

-- Sterilization jobs: clinic staff view/manage
CREATE POLICY "Clinic staff view sterilization" ON sterilization_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = sterilization_jobs.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );
CREATE POLICY "Clinic staff manage sterilization" ON sterilization_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = sterilization_jobs.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager','staff')
    )
  );

-- Notifications: clinic staff view/manage
CREATE POLICY "Clinic staff view notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = notifications.clinic_id
        AND clinic_memberships.user_id = auth.uid()
    )
  );

-- Audit logs: clinic staff view (for their clinic)
CREATE POLICY "Clinic staff view audit logs" ON audit_logs
  FOR SELECT USING (
    clinic_id IS NULL OR EXISTS (
      SELECT 1 FROM clinic_memberships
      WHERE clinic_memberships.clinic_id = audit_logs.clinic_id
        AND clinic_memberships.user_id = auth.uid()
        AND clinic_memberships.role IN ('owner','manager')
    )
  );

-- ============================================================
-- 19. FUNCTIONS
-- ============================================================

-- Get available slots for a resource on a given date
-- Returns time ranges that are available given holds, bookings, and blocks
CREATE OR REPLACE FUNCTION get_resource_availability(
  p_clinic_id   UUID,
  p_resource_id UUID,
  p_date        DATE,
  p_service_id  UUID DEFAULT NULL
)
RETURNS TABLE (
  slot_start  TIMESTAMPTZ,
  slot_end    TIMESTAMPTZ,
  is_available BOOLEAN,
  reason       TEXT
)
LANGUAGE sql STABLE AS $$
  WITH
  -- Operating hours for the weekday of p_date in clinic timezone
  hours AS (
    SELECT oh.start_time, oh.end_time
    FROM operating_hours oh
    JOIN clinics c ON c.id = oh.clinic_id
    WHERE oh.clinic_id = p_clinic_id
      AND oh.weekday = EXTRACT(ISODOW FROM p_date::timestamptz AT TIME ZONE c.timezone) - 1
      AND (oh.effective_from IS NULL OR oh.effective_from <= p_date)
      AND (oh.effective_to IS NULL OR oh.effective_to >= p_date)
  ),
  clinic_tz AS (
    SELECT timezone FROM clinics WHERE id = p_clinic_id
  ),
  -- Existing confirmed/pending/held bookings and holds for the resource
  occupied AS (
    SELECT start_dt, end_dt FROM bookings
    WHERE resource_id = p_resource_id
      AND clinic_id = p_clinic_id
      AND status IN ('confirmed','held','pending')
      AND start_dt < p_date + INTERVAL '1 day'
      AND end_dt > p_date
    UNION ALL
    SELECT start_dt, end_dt FROM booking_holds
    WHERE resource_id = p_resource_id
      AND status = 'active'
      AND start_dt < p_date + INTERVAL '1 day'
      AND end_dt > p_date
  ),
  -- Availability blocks
  blocks AS (
    SELECT start_dt, end_dt FROM availability_blocks
    WHERE clinic_id = p_clinic_id
      AND (resource_id IS NULL OR resource_id = p_resource_id)
      AND start_dt < p_date + INTERVAL '1 day'
      AND end_dt > p_date
  )
  SELECT
    (p_date + h.start_time) AT TIME ZONE clinic_tz.timezone,
    (p_date + h.end_time) AT TIME ZONE clinic_tz.timezone,
    TRUE AS is_available,
    NULL::TEXT AS reason
  FROM hours h, clinic_tz
  WHERE (p_date + h.start_time) AT TIME ZONE clinic_tz.timezone >= (p_date)::timestamptz AT TIME ZONE clinic_tz.timezone
  AND (p_date + h.end_time) AT TIME ZONE clinic_tz.timezone <= ((p_date + INTERVAL '1 day')::timestamp AT TIME ZONE clinic_tz.timezone)
  AND NOT EXISTS (
    SELECT 1 FROM occupied o
    WHERE o.start_dt < (p_date + h.end_time) AT TIME ZONE clinic_tz.timezone
      AND o.end_dt > (p_date + h.start_time) AT TIME ZONE clinic_tz.timezone
  )
  AND NOT EXISTS (
    SELECT 1 FROM blocks b
    WHERE b.start_dt < (p_date + h.end_time) AT TIME ZONE clinic_tz.timezone
      AND b.end_dt > (p_date + h.start_time) AT TIME ZONE clinic_tz.timezone
  );
$$;

-- Safe booking creation: checks conflicts and creates booking + hold atomically
-- Returns the booking ID or throws on conflict
CREATE OR REPLACE FUNCTION create_booking_safe(
  p_user_id        UUID,
  p_clinic_id      UUID,
  p_service_id     UUID,
  p_resource_id    UUID,
  p_start_dt       TIMESTAMPTZ,
  p_end_dt         TIMESTAMPTZ,
  p_source         TEXT DEFAULT 'web',
  p_notes          TEXT DEFAULT NULL,
  p_deposit_due    INTEGER DEFAULT 0,
  p_balance_due    INTEGER DEFAULT 0,
  p_hold_minutes   INTEGER DEFAULT 15,
  p_created_by     UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  v_booking_id  UUID;
  v_hold_id     UUID;
  v_clinic      RECORD;
  v_conflict    TEXT;
BEGIN
  -- Default created_by to user if not provided
  IF p_created_by IS NULL THEN
    p_created_by := p_user_id;
  END IF;

  -- Get clinic for timezone
  SELECT * INTO v_clinic FROM clinics WHERE id = p_clinic_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clinic not found';
  END IF;

  -- Validate the slot is within operating hours and not blocked
  -- (simplified: in production, call get_resource_availability)
  PERFORM 1 FROM operating_hours
    WHERE clinic_id = p_clinic_id
      AND (EXTRACT(ISODOW FROM p_start_dt) - 1) = weekday
      AND start_time <= p_start_dt::time
      AND end_time >= p_end_dt::time
    LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot outside operating hours or no operating hours configured';
  END IF;

  -- Check for conflicts: existing bookings/holds overlapping this slot
  SELECT 'conflict' INTO v_conflict
  FROM bookings
  WHERE clinic_id = p_clinic_id
    AND resource_id = p_resource_id
    AND status IN ('confirmed','held','pending')
    AND start_dt < p_end_dt
    AND end_dt > p_start_dt
  UNION ALL
  SELECT 'conflict' FROM booking_holds
  WHERE resource_id = p_resource_id
    AND status = 'active'
    AND start_dt < p_end_dt
    AND end_dt > p_start_dt
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'Slot is already reserved or blocked';
  END IF;

  -- Create the booking
  INSERT INTO bookings (clinic_id, user_id, service_id, resource_id, start_dt, end_dt, status, source, notes, deposit_due_egp, balance_due_egp, deposit_paid_egp, created_by)
  VALUES (p_clinic_id, p_user_id, p_service_id, p_resource_id, p_start_dt, p_end_dt, 'held', p_source, p_notes, p_deposit_due, p_balance_due, 0, p_created_by)
  RETURNING id INTO v_booking_id;

  -- Create a hold with expiration
  INSERT INTO booking_holds (booking_id, resource_id, start_dt, end_dt, expiration_dt, status)
  VALUES (v_booking_id, p_resource_id, p_start_dt, p_end_dt, p_start_dt + (p_hold_minutes || ' minutes')::interval, 'active')
  RETURNING id INTO v_hold_id;

  RETURN v_booking_id;
END;
$$;

-- Release expired holds (call via cron / scheduled function)
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE bookings b
  SET status = 'pending', updated_at = NOW()
  FROM booking_holds h
  WHERE h.status = 'active'
    AND h.expiration_dt < NOW()
    AND h.booking_id = b.id
    AND b.status = 'held';

  UPDATE booking_holds
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active'
    AND expiration_dt < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================
-- 20. SEED DATA (demo clinic)
-- ============================================================

-- Seed a demo clinic if none exists
INSERT INTO clinics (id, name, slug, logo_url, cover_image_url, description, address, city, phone, email, brand_color, deposit_pct, cancellation_cutoff_hours)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Alexandria Dental Center',
  'alexandria-dental-center',
  'https://images.unsplash.com/photo-1629283440839-c12108cf86f9?w=120&h=120&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1559981272-8218-fbd16d21a71f?w=1200&h=400&fit=crop',
  'Full-service dental clinic offering general dentistry, radiography, sterilization services, chair and dummy head rental for students, and dental education courses.',
  '8 Ahmed Orabi Street',
  'Alexandria, Egypt',
  '+20 3 480 1234',
  'info@alexdental.example.com',
  '#0ea5a0',
  50,
  24
WHERE NOT EXISTS (SELECT 1 FROM clinics LIMIT 1);

-- Seed demo services
INSERT INTO services (clinic_id, name, category, description, duration_minutes, price_egp, deposit_egp, buffer_minutes, resource_type, booking_mode)
SELECT c.id, name, category, description, duration, price, deposit, buffer, resource_type, booking_mode
FROM (VALUES
  ('General Dentistry Consultation', 'general', 'Comprehensive oral examination, diagnosis, and treatment planning by licensed dentists.', 45, 300, 150, 0, NULL, 'session'),
  ('Dental Radiography (X-Ray)', 'radiography', 'Digital intraoral and panoramic X-ray imaging for diagnosis and treatment planning.', 30, 150, 75, 0, 'xray', 'session'),
  ('Instrument Sterilization & Reprocessing', 'sterilization', 'Professional cleaning, disinfection, and sterilization of dental instruments following standard reprocessing protocols.', 60, 200, 100, 30, 'sterilization', 'session'),
  ('Chair Rental (Hourly)', 'chair_rental', 'Rent a dental chair by the hour for practice, shadowing, or clinical sessions.', 60, 120, 60, 0, 'chair', 'hourly'),
  ('Dummy Head Practice Session', 'dummy_head', 'Hands-on practice on a dental dummy head with full setup.', 60, 180, 90, 0, 'dummy_head', 'hourly'),
  ('Tooth Selection Assistance', 'assistance', 'Submit an assistance request by selecting teeth on an interactive 3D model.', 30, 100, 50, 0, 'assistance', 'session')
) AS v(name, category, description, duration, price, deposit, buffer, resource_type, booking_mode)
CROSS JOIN (SELECT id FROM clinics LIMIT 1) c
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- Seed demo resources
INSERT INTO resources (clinic_id, name, type, location, description, capacity)
SELECT c.id, name, type, location, description, capacity
FROM (VALUES
  ('Chair 1 — Main Operatory', 'chair', 'Main Operatory', 'Modern dental chair with operating light and side assistant', 1),
  ('Chair 2 — Sterilization Wing', 'chair', 'Sterilization Wing', 'Chair adjacent to sterilization room', 1),
  ('Dummy Head Alpha', 'dummy_head', 'Practice Lab', 'Typodont dummy head for student practice', 1),
  ('Digital X-Ray Room', 'xray', 'Radiography Suite', 'Digital panoramic and intraoral X-ray machine', 1)
) AS v(name, type, location, description, capacity)
CROSS JOIN (SELECT id FROM clinics LIMIT 1) c
WHERE NOT EXISTS (SELECT 1 FROM resources LIMIT 1);

-- Seed demo operating hours (Sun-Thu 9am-9pm, Sat 9am-5pm, Fri closed)
INSERT INTO operating_hours (clinic_id, weekday, start_time, end_time)
SELECT c.id, weekday, start_time::time, end_time::time
FROM (VALUES
  (0, '09:00', '21:00'),  -- Sunday
  (1, '09:00', '21:00'),  -- Monday
  (2, '09:00', '21:00'),  -- Tuesday
  (3, '09:00', '21:00'),  -- Wednesday
  (4, '09:00', '21:00'),  -- Thursday
  (5, '09:00', '17:00'),  -- Friday (half day)
  (6, '09:00', '17:00')   -- Saturday
) AS v(weekday, start_time, end_time)
CROSS JOIN (SELECT id FROM clinics LIMIT 1) c
WHERE NOT EXISTS (SELECT 1 FROM operating_hours LIMIT 1);
-- Seed demo courses
INSERT INTO courses (clinic_id, title, instructor, description, start_dt, end_dt, capacity, price_egp, deposit_egp, syllabus, status)
SELECT c.id, title, instructor, description, start_dt::timestamptz, end_dt::timestamptz, capacity, price, deposit, syllabus, status
FROM (VALUES
  ('Introduction to Dental Radiography', 'Dr. Sarah Mahmoud', 'Fundamentals of digital intraoral and panoramic radiography, radiation safety, and image interpretation.', '2026-10-12 09:00', '2026-10-16 17:00', 20, 2500, 1250, 'Day 1: Radiation physics and safety. Day 2: Intraoral techniques. Day 3: Panoramic imaging. Day 4: Image interpretation. Day 5: Practical exam.', 'upcoming'),
  ('Operative Dentistry Hands-On Workshop', 'Prof. Ahmed Hassan', 'Practical workshop covering cavity preparation and composite placement on dummy heads.', '2026-11-04 09:00', '2026-11-08 17:00', 12, 4800, 2400, 'Hands-on sessions with typodont models.', 'upcoming'),
  ('Sterilization & Infection Control Intensive', 'Eng. Youssef Kamal', 'Comprehensive course on instrument reprocessing cycles and autoclave validation.', '2026-09-28 09:00', '2026-09-30 17:00', 25, 1800, 900, 'Day 1: Reprocessing cycle overview. Day 2: Autoclave validation. Day 3: Documentation and compliance.', 'upcoming')
) AS v(title, instructor, description, start_dt, end_dt, capacity, price, deposit, syllabus, status)
CROSS JOIN (SELECT id FROM clinics LIMIT 1) c
WHERE NOT EXISTS (SELECT 1 FROM courses LIMIT 1);

-- ============================================================
-- 21. STORAGE BUCKETS (run via supabase CLI)
-- NOTE: These require the Supabase dashboard or CLI:
--   supabase storage create dental-models
--   supabase storage create clinic-logos
--   supabase storage create clinic-covers
--   supabase storage create tooth-assets
-- Give public read access on dental-models and tooth-assets.
-- ============================================================
