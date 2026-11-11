/**
 * Verifies the course enrolment rules against a real Postgres.
 *
 * PGlite runs Postgres in-process, so the migration and the enrolment
 * function are exercised as written rather than as described. The Supabase
 * specifics (`auth.uid()`) are stubbed so the database logic can be tested
 * on its own.
 *
 * Usage: node scripts/verify-enrollment.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const root = path.resolve(process.cwd())
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8')
const migration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '0001_courses_and_accounts.sql'),
  'utf8',
)
const slugMigration = fs.readFileSync(
  path.join(root, 'supabase', 'migrations', '0002_course_slug_rules.sql'),
  'utf8',
)

const db = await new PGlite()

// ── Stubs for the Supabase environment ─────────────────────────────────────
// `auth.uid()` returns the value stored in the session setting, which is how
// the tests impersonate a signed-in user.
await db.exec(`
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;

  CREATE OR REPLACE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE AS $$ SELECT 'authenticated' $$;
`)

// The extensions are not needed for the test and are unavailable in PGlite.
await db.exec(schema.replace(/CREATE EXTENSION[^;]+;/g, ''))
await db.exec(migration)
await db.exec(slugMigration)

let failures = 0
function check(label, condition, detail) {
  if (condition) {
    console.log(`ok    ${label}`)
  } else {
    failures += 1
    console.log(`FAIL  ${label}`)
    if (detail !== undefined) console.log(`        ${JSON.stringify(detail)}`)
  }
}

const CLINIC = '11111111-1111-1111-1111-111111111111'
const COURSE = '22222222-2222-2222-2222-222222222222'

const U = {
  one: 'aaaaaaaa-0000-0000-0000-000000000001',
  two: 'aaaaaaaa-0000-0000-0000-000000000002',
  three: 'aaaaaaaa-0000-0000-0000-000000000003',
  four: 'aaaaaaaa-0000-0000-0000-000000000004',
  five: 'aaaaaaaa-0000-0000-0000-000000000005',
  six: 'aaaaaaaa-0000-0000-0000-000000000006',
  seven: 'aaaaaaaa-0000-0000-0000-000000000007',
  eight: 'aaaaaaaa-0000-0000-0000-000000000008',
}

async function seed({ capacity = 2, price = 1000, policy = 'full', status = 'upcoming' } = {}) {
  await db.exec(`
    INSERT INTO clinics (id, name, slug, city, address, timezone, is_active)
    VALUES ('${CLINIC}', 'Test Dental', 'test-dental', 'Cairo', '1 Test Street', 'Africa/Cairo', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO courses (
      id, clinic_id, title, slug, description, start_dt, end_dt, capacity,
      price_egp, payment_policy, status, is_active
    ) VALUES (
      '${COURSE}', '${CLINIC}', 'Test Course', 'test-course', 'A course for the test.',
      NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days', ${capacity},
      ${price}, '${policy}', '${status}', true
    )
    ON CONFLICT (id) DO NOTHING;
  `)
}

async function addUser(id, name) {
  await db.exec(`
    INSERT INTO platform_users (id, uid, email, name, platform_role)
    VALUES ('${id}', '${id}', '${id}@example.com', '${name}', 'user')
    ON CONFLICT (id) DO NOTHING;
  `)
}

/** Registers as a user and tries to enrol, reporting the refusal reason. */
async function tryEnroll(asUserId, forUserId) {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '${asUserId}', false)`)
  try {
    const result = await db.query(
      `SELECT enroll_in_course('${COURSE}', '${forUserId}') AS result`,
    )
    return { ok: true, ...result.rows[0].result }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

await seed({ capacity: 2, price: 1000 })
for (const [key, name] of Object.entries({
  one: 'Student One',
  two: 'Student Two',
  three: 'Student Three',
  four: 'Racer One',
  five: 'Racer Two',
  six: 'Student Six',
  seven: 'Student Seven',
  eight: 'Student Eight',
})) {
  await addUser(U[key], name)
}

// ── 0. Course slugs are required, unique and backfilled ─────────────────────
const slugRows = await db.query(`SELECT COUNT(*)::int AS n, COUNT(slug) AS with_slug FROM courses`)
check(
  'every course has a unique slug',
  slugRows.rows[0].with_slug === slugRows.rows[0].n,
  slugRows.rows,
)
const clashRows = await db.query(
  `SELECT slug, COUNT(*)::int AS n FROM courses GROUP BY slug HAVING COUNT(*) > 1`,
)
check('no course slug is duplicated', clashRows.rows.length === 0, clashRows.rows)

// ── 1. A student can register ──────────────────────────────────────────────
const first = await tryEnroll(U.one, U.one)
check(
  'a student can register for a course',
  first.ok && first.enrollment?.status === 'registered',
  first,
)
check(
  'the full price is charged for a full-payment course',
  first.payment_amount === 1000,
  first.payment_amount,
)
check(
  'the seats taken are reported back',
  first.seats_taken === 1 && first.capacity === 2,
  first,
)

const stored = await db.query(
  `SELECT status, payment_status, payment_amount FROM course_enrollments WHERE course_id = '${COURSE}'`,
)
check(
  'the enrolment is written to the database',
  stored.rows.length === 1 && stored.rows[0].status === 'registered',
  stored.rows,
)

// ── 2. A duplicate registration is refused ──────────────────────────────────
const duplicate = await tryEnroll(U.one, U.one)
check(
  'registering twice is refused',
  !duplicate.ok && duplicate.message.includes('already_enrolled'),
  duplicate,
)

const afterDuplicate = await db.query(
  `SELECT COUNT(*)::int AS n FROM course_enrollments WHERE course_id = '${COURSE}'`,
)
check(
  'a refused duplicate does not create a second enrolment',
  afterDuplicate.rows[0].n === 1,
  afterDuplicate.rows[0],
)

// ── 3. The last seat goes to exactly one student ───────────────────────────
const second = await tryEnroll(U.two, U.two)
check(
  'the second student takes the last seat',
  second.ok && second.seats_taken === 2,
  second,
)

const third = await tryEnroll(U.three, U.three)
check(
  'a third student is refused because the course is full',
  !third.ok && third.message.includes('course_full'),
  third,
)

const finalCount = await db.query(
  `SELECT COUNT(*)::int AS n FROM course_enrollments WHERE course_id = '${COURSE}'`,
)
check(
  'the course never holds more than its capacity',
  finalCount.rows[0].n === 2,
  finalCount.rows[0],
)

// ── 4. Concurrent registration for the last seat ───────────────────────────
// Both students run at the same moment. Exactly one may succeed.
await db.exec(`DELETE FROM course_enrollments WHERE course_id = '${COURSE}'`)
await db.exec(`UPDATE courses SET capacity = 1 WHERE id = '${COURSE}'`)

const race = await Promise.all([tryEnroll(U.four, U.four), tryEnroll(U.five, U.five)])
const successes = race.filter((result) => result.ok).length
check(
  'exactly one of two concurrent registrations for the last seat succeeds',
  successes === 1,
  race.map((result) => result.ok ? 'ok' : result.message),
)

const raceCount = await db.query(
  `SELECT COUNT(*)::int AS n FROM course_enrollments WHERE course_id = '${COURSE}'`,
)
check(
  'the course holds exactly one enrolment after the race',
  raceCount.rows[0].n === 1,
  raceCount.rows[0],
)

// ── 5. A student may only register themselves ──────────────────────────────
await db.exec(`DELETE FROM course_enrollments WHERE course_id = '${COURSE}'`)
await db.exec(`UPDATE courses SET capacity = 5 WHERE id = '${COURSE}'`)

const impersonation = await tryEnroll(U.one, U.two)
check(
  'a caller cannot register somebody else',
  !impersonation.ok && impersonation.message.includes('not_authorised'),
  impersonation,
)

const impersonated = await db.query(
  `SELECT COUNT(*)::int AS n FROM course_enrollments WHERE course_id = '${COURSE}'`,
)
check(
  'the refused impersonation wrote nothing',
  impersonated.rows[0].n === 0,
  impersonated.rows[0],
)

// ── 6. Registration windows and course status ──────────────────────────────
await db.exec(`DELETE FROM course_enrollments WHERE course_id = '${COURSE}'`)

await db.exec(
  `UPDATE courses SET registration_open_at = NOW() + INTERVAL '2 days' WHERE id = '${COURSE}'`,
)
const notOpen = await tryEnroll(U.one, U.one)
check(
  'registration before the opening date is refused',
  !notOpen.ok && notOpen.message.includes('registration_not_open'),
  notOpen,
)

await db.exec(
  `UPDATE courses SET registration_open_at = NULL, registration_close_at = NOW() - INTERVAL '1 day' WHERE id = '${COURSE}'`,
)
const closed = await tryEnroll(U.one, U.one)
check(
  'registration after the closing date is refused',
  !closed.ok && closed.message.includes('registration_closed'),
  closed,
)

await db.exec(
  `UPDATE courses SET registration_close_at = NULL, status = 'draft' WHERE id = '${COURSE}'`,
)
const draft = await tryEnroll(U.one, U.one)
check(
  'a draft course cannot be registered for',
  !draft.ok && draft.message.includes('course_not_available'),
  draft,
)

// ── 7. A withdrawn enrolment frees the seat ────────────────────────────────
await db.exec(`UPDATE courses SET status = 'upcoming' WHERE id = '${COURSE}'`)
await tryEnroll(U.one, U.one)
await db.exec(
  `UPDATE course_enrollments SET status = 'withdrawn' WHERE course_id = '${COURSE}'`,
)
const afterWithdrawal = await tryEnroll(U.six, U.six)
check(
  'a withdrawn enrolment releases its seat',
  afterWithdrawal.ok,
  afterWithdrawal,
)

// ── 8. A deposit course charges its own percentage ─────────────────────────
await db.exec(`DELETE FROM course_enrollments WHERE course_id = '${COURSE}'`)
await db.exec(
  `UPDATE courses SET payment_policy = 'deposit', deposit_pct = 50, price_egp = 1000 WHERE id = '${COURSE}'`,
)
const deposit = await tryEnroll(U.seven, U.seven)
check(
  'a deposit course charges its own percentage, not the rental rule',
  deposit.payment_amount === 500,
  deposit.payment_amount,
)

await db.exec(
  `UPDATE courses SET payment_policy = 'free', price_egp = 1000 WHERE id = '${COURSE}'`,
)
const free = await tryEnroll(U.eight, U.eight)
check(
  'a free course requires no payment',
  free.payment_amount === 0 &&
    free.enrollment?.payment_status === 'not_required',
  free,
)

// ── 9. The unique constraint holds even without the function ──────────────
await db.exec(`DELETE FROM course_enrollments WHERE course_id = '${COURSE}'`)
await db.exec(
  `INSERT INTO course_enrollments (course_id, user_id) VALUES ('${COURSE}', '${U.one}')`,
)
const constraint = await db
  .exec(
    `INSERT INTO course_enrollments (course_id, user_id) VALUES ('${COURSE}', '${U.one}')`,
  )
  .then(
    () => null,
    (error) => error.message,
  )
check(
  'the database itself refuses a duplicate enrolment row',
  typeof constraint === 'string' && constraint.includes('course_enrollment_unique'),
  constraint,
)

// ── 10. Profile completion ─────────────────────────────────────────────────
await db.exec(`
  UPDATE platform_users SET name = 'Student One', phone = '+201000000000', avatar_url = 'https://example.com/a.png'
  WHERE id = '${U.one}';
  INSERT INTO user_profiles (user_id, city, university)
  VALUES ('${U.one}', 'Cairo', 'Cairo University')
  ON CONFLICT (user_id) DO UPDATE SET city = 'Cairo', university = 'Cairo University';
`)
const completion = await db.query(
  `SELECT profile_completion('${U.one}') AS n`,
)
check(
  'profile completion reflects the fields that are filled in',
  completion.rows[0].n === 100,
  completion.rows[0],
)

console.log(`\n${failures === 0 ? 'PASS' : failures + ' issue(s) found'}`)
await db.close()
process.exit(failures === 0 ? 0 : 1)
