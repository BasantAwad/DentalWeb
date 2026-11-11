-- DentalWeb - Course slug generation repair
--
-- 0002 generated slugs by replacing disallowed characters BEFORE lowercasing
-- the title. Because the pattern only allows lowercase a-z, every capital at
-- a word start was eaten as a separator:
--
--   'Sterilization & Infection Control Intensive'
--     -> 'terilization-nfection-ontrol-ntensive'   (wrong)
--     -> 'sterilization-infection-control-intensive' (correct)
--
-- This migration replaces the trigger functions with a corrected shared
-- implementation and regenerates every existing slug from its title.

-- 1. One shared, correct slug derivation.
CREATE OR REPLACE FUNCTION dental_course_slug_base(p_title text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base text;
BEGIN
  -- Lowercase FIRST, then strip what the slug alphabet does not allow.
  base := regexp_replace(lower(coalesce(p_title, '')), '[^a-z0-9]+', '-', 'g');
  base := trim(BOTH '-' FROM base);
  IF base = '' THEN
    base := 'course';
  END IF;
  RETURN left(base, 80);
END $$;

-- 2. The insert trigger now uses the shared derivation.
CREATE OR REPLACE FUNCTION dental_courses_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  n int;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    candidate := dental_course_slug_base(NEW.title);
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM courses c WHERE c.slug = candidate AND c.id <> NEW.id
    ) LOOP
      n := n + 1;
      candidate := dental_course_slug_base(NEW.title) || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

-- 3. The rename trigger now uses the shared derivation.
CREATE OR REPLACE FUNCTION dental_courses_regenerate_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  n int;
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title THEN
    candidate := dental_course_slug_base(NEW.title);
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM courses c WHERE c.slug = candidate AND c.id <> NEW.id
    ) LOOP
      n := n + 1;
      candidate := dental_course_slug_base(NEW.title) || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

-- 4. Regenerate existing slugs from their titles with the corrected rules.
--    Slugs in this platform are always generated (the management API and the
--    triggers share the rules and no custom slug input exists), so every
--    course is re-derived in creation order, keeping dedupe suffixes stable.
DO $$
DECLARE
  r record;
  base_slug text;
  candidate text;
  n int;
BEGIN
  FOR r IN
    SELECT id, title FROM courses ORDER BY created_at, id
  LOOP
    base_slug := dental_course_slug_base(r.title);
    candidate := base_slug;
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM courses c WHERE c.slug = candidate AND c.id <> r.id
    ) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    END LOOP;
    UPDATE courses SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;
