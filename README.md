# DentalWeb — A space to practice

An interactive platform for dental training with three core services:

- **Dental chair rental** — **150 EGP/hour**
- **Phantom-head training** — **100 EGP/hour**
- **Courses and practical training** — each course carries its own price,
  schedule, capacity and payment terms

Equipment reservations are confirmed with a **50% deposit**. Courses are not
equipment rentals: they are programmes with their own instructor, sessions,
learning objectives and registration rules.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
React Three Fiber and Supabase (Postgres + RLS).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | for live data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for live data | Supabase anon key |
| `NEXT_PUBLIC_BASE_URL` | yes | Public base URL (payment redirects) |
| `PAYMOB_PRIVATE_KEY` / `PAYMOB_PUBLIC_KEY` / `PAYMOB_HMAC_SECRET` | for payments | Paymob credentials |
| `PAYMOB_INTEGRATION_ID` | for payments | Paymob integration id |

Without the Supabase keys the site still runs: listings, courses, station
availability and the account area show an explicit "not connected yet" state
rather than inventing data.

### Database

```bash
supabase db push      # or paste the files into the Supabase SQL editor
```

| File | Contents |
|---|---|
| `supabase/schema.sql` | The base platform schema — users, facilities, services, resources, bookings, holds, payments, courses |
| `supabase/migrations/0001_courses_and_accounts.sql` | Courses, sessions, instructors, enrolments, profiles, the transactional enrolment function and the new RLS policies |

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Eight-scene homepage |
| `/services` | Service index |
| `/services/dental-chair` | Dental chair product page |
| `/services/phantom-head` | Phantom head product page |
| `/courses` | Course discovery — search, filters, sort |
| `/courses/[slug]` | Course detail, schedule and registration |
| `/facilities` | Facility discovery — search and filters |
| `/facilities/[slug]` | Facility profile, including the courses it teaches |
| `/facilities/[slug]/room` | Interactive room plan and station selection |
| `/facilities/[slug]/book` | The booking flow |
| `/tooth-planner` | Interactive tooth selection (optional, FDI) |
| `/manage` · `/manage/[slug]` | Facility owner workspace |
| `/manage/courses` | Owner course management |
| `/account` | Client dashboard |
| `/account/profile` | Personal information and preferences |
| `/account/bookings` | Reservation history |
| `/account/courses` | Course registration history |
| `/account/settings` | Account details, password and session |
| `/auth/login` · `/auth/register` | Sign in and create an account |
| `/checkout/success` | Post-payment return, verified server-side |

Legacy URLs redirect permanently — see `next.config.ts`.

---

## Project layout

```
src/
  app/                 routes and API handlers
  components/
    3d/                canvas, cameras, lighting, model loading, fallbacks
    account/           client dashboard, profile, history, settings
    booking/           the reservation flow
    courses/           course discovery and course detail
    facilities/        discovery and profile
    home/              homepage scenes
    manage/            owner workspace and course management
    room/              blueprint and station selection
    service/           product pages
    site/              header, services menu, account menu, footer
    teeth/             FDI tooth selection
    ui/                buttons, sections, reveals, breadcrumb
  lib/
    3d/                asset registry, device tiers, scroll drivers
    auth.ts            session and facility membership
    account-types.ts   account-area contracts and status labels
    account-utils.ts   booking and enrolment grouping
    course-utils.ts    course registration state
    platform-api.ts    typed client for the platform API
    pricing.ts         confirmed rates and the deposit rule
supabase/
  schema.sql           base platform schema
  migrations/          courses, enrolments and accounts
scripts/               extraction, inspection and verification tools
```

---

## Documentation

| Document | Contents |
|---|---|
| [`ASSET_GUIDE.md`](./ASSET_GUIDE.md) | How to export and register your Blender models |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Decisions, layering, fixes and open questions |
| [`docs/ASSET_MANIFEST.md`](./docs/ASSET_MANIFEST.md) | Every asset, its status and its owner |
| [`docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md`](./docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md) | The approved design direction |
| [`docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md`](./docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md) | The approved visual specification |
| [`docs/BOOKING_BUSINESS_RULES.md`](./docs/BOOKING_BUSINESS_RULES.md) | The confirmed booking rules |
| [`docs/SOFTWARE_SPECIFICATION.md`](./docs/SOFTWARE_SPECIFICATION.md) | Product and architecture specification |
| [`docs/UI_UX_WIREFRAMES.md`](./docs/UI_UX_WIREFRAMES.md) | Page-by-page wireframes |

---

## Scripts

```bash
npm run verify:db            # apply the schema + migration to a real Postgres and assert the enrolment rules
npm run verify:audit         # accessibility and layout audit across every route
npm run verify:interactions  # tooth, room plan, services menu, course filters, account navigation
npm run verify:resilience    # reduced-motion and no-WebGL checks

node scripts/extract-blueprint.mjs      # re-extract the room blueprint
node scripts/inspect-glb.mjs <file.glb> # report a GLB's structure and silhouette
node scripts/check-composition.mjs       # verify each asset's camera framing
node scripts/cdp.mjs eval|shot <url> <w> <h> …   # headless Chrome driver
node scripts/cdp-full.mjs <url> <w> <h> <out>    # full-page screenshot
```

---

## Business rules

These are enforced server-side and must not change without the product
owner's approval:

- Dental chair — **150 EGP per hour**
- Phantom head — **100 EGP per hour**
- Deposit — **50% of the total booking amount**
- A reservation is confirmed **only after the deposit is verified**
- Availability, station occupancy and pricing come from the backend, never
  from the browser
- A course has **its own** price, capacity, deadline and payment policy. The
  hourly rental rate and the 50% rental deposit do **not** apply to courses
- Course capacity is enforced **transactionally** by `enroll_in_course()`, so
  the final seat cannot be taken twice

`src/lib/pricing.ts` holds the rental rates; `POST /api/booking` recomputes
them from the service's configured rate before any hold or charge is created.
`supabase/migrations/0001_courses_and_accounts.sql` holds the course rules,
which `scripts/verify-enrollment.mjs` checks against a real database.
