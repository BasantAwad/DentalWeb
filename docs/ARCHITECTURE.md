# DentalWeb — Architecture & Implementation Notes

Records the decisions behind the current implementation, the reasoning for
them, and the assumptions that still need the product owner's confirmation.

---

## 1. Repository assessment

### What already existed

| Area | State |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 |
| 3D | React Three Fiber 9, Drei 10, three 0.185 — installed but used only for a single molar model |
| Backend | Supabase (Postgres + RLS) with a complete schema in `supabase/schema.sql`: 13 tables, 20+ policies |
| Payments | Paymob integration (`src/lib/paymob.ts`), checkout session + webhook routes |
| Availability | `GET /api/availability` — hourly slot generation against operating hours |
| Booking | `POST /api/booking` — conflict detection, hold creation, checkout handoff |
| Pages | Home, about, clinics (+ detail), courses, services (+ detail), chair rental (+ 2), tooth assistance, auth, admin (5 screens) |
| Assets | `public/models/molar/` (a real glTF with textures); a supplied room blueprint HTML; a supplied raw dental chair GLB |

### What was incomplete

- **No 3D infrastructure.** No asset registry, no scene components, no camera
  rig, no lighting presets, no fallbacks.
- **The homepage did not match the approved design spec.** It was a generic
  landing page: a molar model in a bordered box, a hover-expand accordion of
  six services, three numbered cards.
- **The design system was a different palette.** `globals.css` defined navy
  `#1a1a2e` / aqua `#0ea5a0` / gold `#c9a96e` rather than the approved
  Porcelain / Graphite / Mineral Teal / Sage / Warm Stone / Clay system.
- **No light/dark narrative.** Every page was a single flat background.
- **Typography was not loaded.** The spec requires Manrope and Inter; the app
  relied on system fonts.
- **No room selector.** The supplied blueprint was never integrated.
- **Rates contradicted the confirmed business rules.** Chair rental was
  120 EGP/hour and phantom head 180 EGP/hour in `services-data.ts`,
  `/chair-rental` and both detail pages. The confirmed rates are 150 and 100.
- **Availability was faked.** The rental booking page hard-coded Friday as
  closed and generated its own slot grid; it never called the availability API.
- **Facility and course data was invented.** Hard-coded demo clinics with
  fabricated 4.8/124 ratings, and six courses with invented instructors.
- **A fake confirmation state.** The rental page set `confirmed` on a button
  click, with no backend, no payment and no hold.

### Architectural problems found and fixed

| Problem | Impact | Fix |
|---|---|---|
| `POST /api/booking` accepted `depositDue`/`balanceDue` from the client | A customer could request any price. | Price is computed server-side from the service's configured rate × duration, in integer piastres. The client value is ignored. |
| Availability and booking queries combined `.eq('resource_id', id)` with `.or('resource_id.is.null')` | PostgREST ANDs the two, so the filter always matched zero rows. Availability could never be read. | Split into two queries — facility-wide and resource-specific — with the resource-specific set taking precedence. Same fix for availability blocks. |
| The booking route validated only that the **start** time fell inside opening hours | A booking could start at 17:00 and run until 23:00 on an 18:00 close. | The whole requested range must now fit inside one operating-hours window. |
| Hold expiry was `bookingStart + 15 minutes` | A booking next month was held indefinitely, blocking the resource. | Expiry is now `now + holdMinutes`. |
| `GET /api/booking` extracted the ID from the URL path, always `/api/booking` | The handler never worked. | Moved to `GET /api/booking/[id]`, a proper dynamic route. |
| The checkout success page declared "Booking Confirmed!" from the client redirect | A bookmarked URL showed a confirmed booking with no payment. The spec explicitly forbids trusting a redirect as proof of payment. | The page reads the booking from the backend and only shows "confirmed" when the status is `confirmed` — which the webhook only sets after verifying the deposit. |
| The rental booking page had a local `confirmed` state set by a button click | Simulated a successful purchase with no backend, no payment and no hold. | Replaced with a clearly-labelled payment-integration placeholder that routes into the facility booking flow. |
| Facility and course data was fabricated, including ratings | Invented trust signals on a marketplace. | Both now read from the database. When the backend is not configured the pages say so instead of showing placeholders. |
| The booking route had no idempotency | A double-click or retry could create two reservations. | An idempotency key is derived deterministically from the request, and an existing matching booking is returned instead of creating a duplicate. |
| The availability endpoint reported a clinic-wide summary for a single resource | Consumers could not tell a facility closure from a busy resource. | The response is now resource-scoped and reports the resource's own status. |

---

## 2. Page architecture

The homepage introduces the platform. Everything that needs room to breathe
lives on its own page.

```
/                              Eight-scene homepage
/services                      Service index
/services/dental-chair         Product page — dental chair
/services/phantom-head         Product page — phantom head
/courses                       Course discovery — the third core service
/courses/[slug]                Course detail, schedule and registration
/facilities                    Facility discovery
/facilities/[slug]             Facility profile
/facilities/[slug]/room        Interactive room plan + station selection
/facilities/[slug]/book        Booking flow
/tooth-planner                 Interactive tooth selection (optional)
/manage                        Facility owner workspace
/manage/[slug]                 A single facility's catalogue and resources
/manage/courses                Owner course management
/account                       Client dashboard
/account/profile               Personal information
/account/bookings              Reservation history
/account/courses               Course registration history
/account/settings              Account and session
/auth/login                    Sign in
/auth/register                 Create an account
/checkout/success              Post-payment return, verified server-side
```

Legacy URLs redirect permanently (`next.config.ts`):

| Old | New |
|---|---|
| `/chair-rental` | `/services` |
| `/chair-rental/dental-chair` | `/services/dental-chair` |
| `/chair-rental/dummy-head` | `/services/phantom-head` |
| `/clinics` | `/facilities` |
| `/tooth-assistance` | `/tooth-planner` |

### Homepage scenes

| # | Scene | Theme | Layout |
|---|---|---|---|
| 1 | Hero | Graphite | Full-bleed 3D stage, editorial type left, rate strip along the base |
| 2 | Platform | Chalk | Narrow statement column, four facts hung off a vertical rule, giant bleed word |
| 3 | Two rentals | Porcelain | Split composition: object half, copy half, with an always-visible switcher |
| 4 | Courses | Graphite | Editorial statement, "Explore Courses" CTA, live schedule of upcoming courses |
| 5 | The room | Graphite | Full-width blueprint with interactive markers, side notes in a narrow column |
| 6 | How it works | Porcelain | Horizontal timeline on a single rail, worked example beneath |
| 7 | Facilities | Chalk | Editorial rows rather than a card grid |
| 8 | For owners | Graphite | Proposition left, designed workspace preview right |

Each section declares its theme explicitly through `data-section-theme`, and the
navigation reads it to switch between its light and dark variants.

### The three core services

The platform communicates three distinct offerings, and they are never merged
into one list:

| Service | Price | Where |
|---|---|---|
| Dental chair rental | 150 EGP / hour | `/services/dental-chair` |
| Phantom-head training | 100 EGP / hour | `/services/phantom-head` |
| Courses & practical training | The course's own price | `/courses` |

The first two are hourly rentals with a 50% deposit. **A course is not a
rental.** It has its own instructor, schedule, capacity, learning objectives,
deadline and payment policy (`payment_policy` of `free`, `full` or `deposit`
with its own percentage). The rental rate and the 50% rental deposit are never
applied to a course — see `src/lib/course-utils.ts` and the `enroll_in_course()`
function, which computes the amount owed from the course's own terms.

The header exposes all three through a `Services` panel, and the mobile menu
repeats them as a labelled group so none of them is hidden behind a hover.

---

## 3. Layering

```
┌─────────────────────────────────────────────────────────────┐
│ 3D PRESENTATION LAYER                          src/components/3d/
│   StageCanvas.tsx        canvas shell, WebGL + tier guards   │
│   cameras/CameraRig.tsx  scroll-driven camera choreography  │
│   lighting/              studio lighting presets            │
│   models/                asset loading + repair             │
│   fallbacks/             static poster                      │
├─────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER                          src/components/
│   home/       homepage scenes                                │
│   service/    product pages                                  │
│   courses/    discovery + course detail                      │
│   account/    client dashboard, profile, history             │
│   facilities/ discovery + profile                            │
│   booking/    the reservation flow                           │
│   room/       blueprint + station selection                  │
│   teeth/      FDI tooth selection                            │
│   manage/     owner workspace + course management            │
│   site/       header, services menu, account menu, footer    │
│   lib/pricing.ts      rates and the 50% deposit rule         │
│   lib/course-utils.ts course registration state and terms    │
├─────────────────────────────────────────────────────────────┤
│ SESSION & AUTHORISATION                       src/lib/auth.ts
│   getSessionUser()          the signed-in platform user      │
│   getFacilityMemberships()  facilities the user may manage   │
│   canManageFacility()       owner/manager check              │
├─────────────────────────────────────────────────────────────┤
│ BACKEND                                      src/app/api/
│   auth/         register, sign-in, sign-out, session         │
│   facilities/   list, detail, station availability           │
│   availability/ slot generation per resource                 │
│   booking/      create, quote, read                          │
│   courses/      discovery, detail, transactional enrolment  │
│   account/      profile, bookings, courses, overview         │
│   manage/       owner course management, owned facilities    │
│   checkout/     Paymob session + webhook                     │
└─────────────────────────────────────────────────────────────┘
```

**The 3D layer never holds business state.** The service scene receives an
asset key; it never learns a price. The room plan receives a
`Record<stationId, StationState>`; it never decides a status.

**The application layer never invents availability.** `RoomPlan` renders
whatever status map it is given, including an empty one, and the caller
labels the difference between live data and a preview.

**Pricing has exactly one source of truth on the server.** The frontend shows
a preview computed from the same rule for responsiveness, but the amount that
is charged is always recomputed by `POST /api/booking` and `POST
/api/booking/quote` from the service's configured rate.

**Authorisation never trusts the browser.** Every route handler resolves the
caller from the session cookie. No handler reads a user id, a clinic id or a
role from a request body to decide what the caller may see or change. A body
may name *which* of the caller's own facilities to act on; it may never name
*whose* data the caller is.

---

## 3a. Authentication

The platform previously had **no session layer at all** — the login and
registration pages were a frontend simulation with a timeout. The account area
needed a real identity, so one was built:

| Piece | File | Role |
|---|---|---|
| Cookie-aware server client | `src/lib/supabase/server.ts` | Server-side Supabase client that carries the visitor's session |
| Session resolution | `src/lib/auth.ts` | `getSessionUser()`, `getFacilityMemberships()`, `canManageFacility()` |
| Registration | `POST /api/auth/register` | Creates the auth identity, mirrors it into `platform_users`, seeds `user_profiles` |
| Sign in | `POST /api/auth/sign-in` | Verifies credentials, sets the session cookie |
| Sign out | `POST /api/auth/sign-out` | Ends the session, clears the cookies |
| Session probe | `GET /api/auth/session` | Returns the signed-in identity, or `null` |

`platform_users.id` is the identifier that bookings and enrolments reference;
`platform_users.uid` links that business record to the authentication
provider's user id. The two are deliberately separate so the auth provider can
be replaced without a data migration.

The sign-in and registration pages are real forms. The header's account menu
shows the signed-in identity with initials, or a sign-in/register pair, and
resolves the session client-side so the header does not flash.

---

## 3b. Courses and enrolment

### Schema — `supabase/migrations/0001_courses_and_accounts.sql`

| Object | Purpose |
|---|---|
| `user_profiles` | Optional client and dental-student information, kept out of `platform_users` |
| `instructors` | Course instructors, owned by a facility |
| `courses` (extended) | slug, subject, specialty, academic level, training type, objectives, topics, theory/practice components, supervised-practice flag, materials, registration window, `payment_policy`, `deposit_pct`, `published_at`, `session_count`, and a `draft` status |
| `course_sessions` | The individual sessions of a course |
| `course_enrollments` | A student's registration; unique on `(course_id, user_id)` |
| `payments` (extended) | `booking_id` becomes nullable; `course_enrollment_id` added; a CHECK allows exactly one owner |
| `enroll_in_course()` | `SECURITY DEFINER` enrolment function |
| `profile_completion()` | 0–100 completion score for the profile meter |

**Capacity belongs to the course, not to the session.** Sessions describe when
and where the teaching happens; the seat count is the course's `capacity`.
That is the model the registration rules actually describe, and it avoids
per-session capacity questions that the business has not answered.

### The enrolment function

`enroll_in_course(p_course_id, p_user_id)` does the whole job inside one
transaction:

1. Confirms the caller is enrolling **themselves** (`platform_users.uid =
   auth.uid()`), so a user id in the request body is never trusted.
2. Locks the course row `FOR UPDATE`, which serialises simultaneous
   registrations for the last seat.
3. Checks the course is published, active and inside its registration window.
4. Refuses a duplicate registration for a live enrolment.
5. Counts the live enrolments and refuses when the course is full.
6. Computes the amount owed from the **course's own** payment policy.
7. Writes the enrolment and returns the new seat count.

The route handler (`POST /api/courses/[slug]/enroll`) only translates the
function's refusal reasons into HTTP status codes. It does not re-implement
any of the rules.

### Verified against a real database

`scripts/verify-enrollment.mjs` runs the schema, the migration and the
function against an in-process Postgres (PGlite), and asserts 21 behaviours:
registration succeeds, the enrolment row is written, a duplicate is refused
and writes nothing, the last seat goes to exactly one of two concurrent
callers, a third student is refused as full, a caller cannot register
somebody else, the registration window and course status are enforced, a
withdrawn enrolment releases its seat, a deposit course charges its own
percentage rather than the rental rule, a free course requires no payment,
the unique constraint holds independently of the function, and the profile
completion score is correct.

`npm run verify:db`

This suite caught three real defects:

| Defect | Effect | Fix |
|---|---|---|
| `IF FOUND` was tested after a `COUNT(*)` query | A `COUNT` always sets `FOUND` to true, so the `INSERT` branch was never taken and **no enrolment was ever created**. The function returned success with an empty enrolment. | `FOUND` is captured into `v_had_enrollment` immediately after the lookup that sets it. |
| `get_resource_availability()` referenced `clinics.timezone` without joining `clinics` | The function failed to parse, so `supabase db push` aborted. | The `hours` CTE now joins `clinics`. |
| The availability function cast `TIME` to `TIMESTAMPTZ`, and the demo seeds inserted text into `TIME` and `TIMESTAMPTZ` columns | The schema could not be applied at all, so neither the base schema nor the courses migration could reach a real database. | The times are combined with the date and cast explicitly: `(p_date + start_time) AT TIME ZONE timezone`. |

### Course discovery and detail

`GET /api/courses` supports search across title, description, instructor and
subject; filters by subject, academic level, training type, facility and
location; a date range; and sorting by date or price. It returns the courses
with their live seat counts, and derives the facets from the result set so the
filter lists cannot disagree with the listing.

`GET /api/courses/[slug]` returns one course with its sessions, its instructor
and the visitor's own enrolment. Only published courses (`upcoming`,
`ongoing`, `completed`) are served; drafts never are.

### Owner course management

`/api/manage/courses` is scoped to the facilities the signed-in user owns or
manages, through `clinic_memberships` — never through a clinic id in the
request body. `GET /api/manage/facilities` returns that same list so a course
is created against a facility the account actually owns.

`GET /api/manage/courses/[id]/enrollments` returns the students registered
for one course, with only what a facility needs to prepare a session: name,
email, phone and the academic information the student chose to publish. It
never returns the student's full profile, their unrelated reservations or
their account settings.

---

## 3c. The client account area

The account area is a quieter, more functional space than the public pages:
a persistent sidebar on desktop, a scrollable tab strip on mobile.

| Page | Contents |
|---|---|
| `/account` | Greeting, four activity counts, the next activities in chronological order, a unified activity timeline, quick actions |
| `/account/profile` | Contact details, optional dental-student information, notification preferences, completion meter |
| `/account/bookings` | Every reservation, grouped into upcoming / pending / completed / cancelled, with an expandable detail panel |
| `/account/courses` | Every registration, grouped into upcoming / ongoing / completed / cancelled, with the session schedule |
| `/account/settings` | Account details, password, and sign-out |

Every figure is derived from the signed-in user's own records. The activity
timeline is built from real booking and enrolment rows rather than from a
separate event table, so it cannot drift from the history it describes.

**The activity timeline is derived, not fabricated.** A reservation appears
because it exists; a registration appears because it exists. There is no
separate `activity_events` table to drift out of step.

**Payment status comes from the payments table.** A reservation that has a
paid row reports `paid` even if an earlier pending row exists, so a payment
that later settled is never shown as outstanding.

**The optional fields are genuinely optional.** The platform needs a name and
an email to operate; university, academic year, professional status, date of
birth, city and interests are only collected because a facility may ask for
them to prepare a session.

---

## 4. The asset registry

`src/lib/3d/assets.ts` is the single place that knows where a model lives.

```ts
dentalChair: {
  src: '/models/dental-chair/dental-chair.glb',
  fallback: '/images/placeholders/dental-chair.svg',
  status: 'placeholder',
  renderMode: 'procedural',   // flip to 'gltf' when the model is ready
  scale: 1,
  rotation: [0, 0, 0],
  position: [0, 0, 0],
  normalizeToSize: null,
  focus: [0, 0.55, 0],
  camera: { position: [...], target: [...], fov: 34 },
  lighting: 'studio',
  description: '…',
}
```

Swapping in the real model is a three-line change with no scene, component or
page code touched. `ASSET_GUIDE.md` documents the full Blender export process.

| `tooth` | `public/models/teeth/tooth.glb` | `placeholder` | 528 KB | Supplied raw mesh: one connected component, 30,000 triangles, no materials, no normals, no UVs. Registered for a future 3D tooth viewer. The tooth selector uses a procedural 2D typodont because a single mesh cannot represent 32 independently selectable teeth. |

### Why the supplied chair GLB is not the default rendering

`scripts/inspect-glb.mjs` reports:

```
generator:       https://github.com/mikedh/trimesh
materials:       0
images:          0
attributes:      POSITION          ← no normals, no UVs
vertices:        9626
triangles:       20000
dimensions:      1.961 x 1.548 x 1.234
components:      6                 ← chair body + stool-like body + 4 parts
```

It is a raw mesh export: no materials, no normals, no UVs, and six
disconnected components. The loader repairs what can be repaired — computing
normals, supplying zeroed UVs, applying a placeholder PBR material, centring
the bounding box, grounding it on the floor — but the silhouette remains a
rough scan rather than a product render.

The registry therefore renders a **deliberately composed procedural scene**
today while keeping the file registered at its final path. `renderMode` makes
that explicit and reversible.

The same applies to `tooth.glb` and to the not-yet-delivered phantom head.

---

## 5. Design tokens

`src/app/globals.css` holds two layers.

**Primitives** — the approved palette as fixed values (`--color-porcelain-50`
… `--color-info`).

**Semantics** — role values that flip with `data-theme` on a section:

```css
[data-theme="dark"] {
  --bg: var(--color-graphite-900);
  --fg: var(--color-porcelain-50);
  --brand: #4a9a94;
}
```

Tailwind's `@theme inline` bridge maps both to utilities, so `bg-bg`,
`text-fg`, `border-line` and `text-brand` follow the section theme
automatically while `bg-graphite-900` stays fixed.

**Legacy aliases are preserved.** `--color-navy`, `--color-aqua`,
`--color-cream` and the rest still exist, remapped onto the approved palette,
so nothing that referenced them breaks.

Fonts are self-hosted via `@fontsource-variable/manrope` and
`@fontsource-variable/inter` — no runtime request to a third-party CDN.

---

## 6. Performance and resilience

| Concern | Handling |
|---|---|
| 3D must never delay the CTA | Headlines, CTAs and prices are plain DOM. Canvases load with `next/dynamic` and `ssr: false`. |
| WebGL unavailable | `isWebGLAvailable()` detects it and `StageCanvas` renders the static poster. |
| Model fails to load | `AssetErrorBoundary` catches the loader error and the procedural scene takes over. |
| Reduced motion | `usePrefersReducedMotion()` disables scroll choreography and renders the static poster. |
| Low-power devices | `resolveDeviceProfile()` caps DPR, disables shadows and drops the scroll choreography on the mobile tier. |
| Viewport framing | `useViewportBand()` re-frames the camera per band — a portrait phone gets a centred, higher framing rather than a cropped desktop one. |
| Room plan performance | The blueprint is a single inline SVG with a marker overlay — no 3D cost at all. |
| Composition regressions | `scripts/check-composition.mjs` projects each asset through its camera and reports coverage, grounding and cropping. |

---

## 7. Assumptions requiring owner confirmation

1. **Platform-wide vs facility-set rates.** The two rates are treated as
   platform-wide defaults (`src/lib/pricing.ts`) and the API reads the rate
   from the service record, so a facility *can* override. Open decision #5 in
   `docs/BOOKING_BUSINESS_RULES.md` is implemented in the override-friendly
   direction rather than hard-locked.
2. **Hold duration.** Left configurable at 15 minutes via the request body,
   with the value surfaced in the API response. Open decision #1 is not
   silently decided.
3. **Remaining balance collection.** Not implemented, and not implied
   anywhere in the UI. The copy says the balance is "settled with the
   facility", which does not commit to a method. Open decision #2 stays open.
4. **Slot increments.** Whole hours only, matching the hourly rental model.
   Open decision #4 is implemented in the conservative direction.
5. **Station selection.** The room plan supports selecting a specific
   station; the booking API takes a `resourceId`. Whether every phantom-head
   booking must name a station, or whether the facility may allocate one,
   remains the owner's decision — the plumbing supports both.
6. **Room station ↔ resource mapping.** The station API maps the blueprint's
   14 stations onto the facility's phantom-head resources in order. When a
   facility's resource list does not align with the plan, the mapping must be
   replaced with an explicit per-resource station column.
7. **Payment provider.** Paymob is configured in `.env.local`, so the payment
   path is live. The customer-facing booking flow is not yet wired end-to-end
   — that is the next milestone, and it is not claimed to be complete.

---

## 8. Known limitations

- Facility, course, station and account data require
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Until then
  the pages show an explicit "not connected" state rather than placeholder
  content, and the API answers `503 backend_not_configured`.
- The homepage room scene is a labelled preview. Live station availability is
  wired into the `RoomPlan` component and the station API, and arrives with
  the facility booking flow.
- The 3D scenes use the procedural placeholders. The supplied GLB is
  registered but not the default rendering.
- `public/models/molar/` and the old molar loader still exist; the
  `/tooth-planner` page uses a procedural FDI typodont instead.
- **Course payments are recorded, not collected.** The `payments` table now
  carries a `course_enrollment_id`, and an enrolment records what is owed and
  whether it is paid, but there is no checkout flow for a course yet. The
  rental checkout remains the only live payment path.
- **Course cancellation and refunds are not implemented.** The enrolment
  status vocabulary supports `withdrawn` and `cancelled`, but no workflow
  creates them. The platform does not invent a cancellation or refund policy.
- The owner workspace still shows the facility catalogue, the resources and
  the course links. A booking-management screen for owners is not built.
- The admin screens under `src/app/admin` are the original demo screens and
  have not been restyled. They are not linked from the public navigation.

---

## 9. Scripts

| Script | Purpose |
|---|---|
| `npm run verify:db` | Applies the schema and the courses migration to an in-process Postgres and asserts the enrolment rules. |
| `npm run verify:audit` | Accessibility and layout audit across every public route at three viewport widths. |
| `npm run verify:interactions` | Verifies the tooth arch, the room plan, the services menu, the course discovery filters and the account navigation. |
| `npm run verify:resilience` | Checks the 3D fallbacks under reduced motion and without WebGL. |
| `node scripts/extract-blueprint.mjs` | Re-extract the supplied blueprint into the reference SVG and the React component. |
| `node scripts/inspect-glb.mjs <file.glb>` | Report a GLB's generator, attributes, materials, components, bounds and an ASCII silhouette per axis pair. |
| `node scripts/check-composition.mjs` | Project each asset through its camera to verify screen coverage, grounding and cropping. |
| `node scripts/cdp.mjs eval\|shot <url> <w> <h> …` | Headless Chrome over the DevTools protocol: evaluate a script or capture a screenshot at an arbitrary viewport size. |

---

## 10. Dependency changes

Added:

- `gsap` — ScrollTrigger for scroll-linked camera choreography.
- `framer-motion` — interface transitions and scroll reveals.
- `@fontsource-variable/manrope`, `@fontsource-variable/inter` — self-hosted
  typography.
- `@electric-sql/pglite` (dev) — an in-process Postgres, so the schema, the
  migration and the enrolment rules are verified against a real database
  rather than described.

Not added: any 3D library beyond what was already installed. No
Draco/Meshopt decoder was added — three's loader handles Draco-compressed GLB
natively, so an extra dependency would be unjustified.
