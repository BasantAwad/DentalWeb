-- DentalWeb - Course slugs
--   * a course slug is required and unique across the platform
--   * a slug is generated from the course title when a course is created
--   * duplicate titles get a numeric suffix
--   * changing a course title regenerates its slug

-- 1. Backfill: every course without a slug (for example the seeded demo
--    courses) gets one derived from its title, de-duplicated.
DO $$
DECLARE
  r record;
  base_slug text;
  candidate text;
  n int;
BEGIN
  FOR r IN
    SELECT id, title FROM courses WHERE slug IS NULL OR slug = ''
  LOOP
    base_slug := lower(regexp_replace(coalesce(r.title, ''), '[^a-z0-9]+', '-', 'g'));
    base_slug := trim(BOTH '-' FROM base_slug);
    IF base_slug = '' THEN
      base_slug := 'course';
    END IF;
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

-- 2. The slug is now required and unique for the whole table.
ALTER TABLE courses ALTER COLUMN slug SET NOT NULL;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS idx_courses_slug;
ALTER TABLE courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);

-- 3. Generate a slug from the title on insert when none was supplied.
CREATE OR REPLACE FUNCTION dental_courses_set_slug() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate text;
  n int;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(coalesce(NEW.title, ''), '[^a-z0-9]+', '-', 'g'));
    base_slug := trim(BOTH '-' FROM base_slug);
    IF base_slug = '' THEN
      base_slug := 'course';
    END IF;
    candidate := base_slug;
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM courses c WHERE c.slug = candidate AND c.id <> NEW.id
    ) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER courses_slug_before_insert
BEFORE INSERT ON courses
FOR EACH ROW EXECUTE FUNCTION dental_courses_set_slug();

-- 4. Regenerate the slug whenever the title changes so the slug never
--    drifts away from a course that was renamed.
CREATE OR REPLACE FUNCTION dental_courses_regenerate_slug() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate text;
  n int;
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title THEN
    base_slug := lower(regexp_replace(coalesce(NEW.title, ''), '[^a-z0-9]+', '-', 'g'));
    base_slug := trim(BOTH '-' FROM base_slug);
    IF base_slug = '' THEN
      base_slug := 'course';
    END IF;
    candidate := base_slug;
    n := 1;
    WHILE EXISTS (
      SELECT 1 FROM courses c WHERE c.slug = candidate AND c.id <> NEW.id
    ) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER courses_slug_before_title_update
BEFORE UPDATE OF title ON courses
FOR EACH ROW EXECUTE FUNCTION dental_courses_regenerate_slug();
