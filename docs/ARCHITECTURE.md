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
/                              Seven-scene homepage
/services                      Service index
/services/dental-chair         Product page — dental chair
/services/phantom-head         Product page — phantom head
/facilities                    Facility discovery
/facilities/[slug]             Facility profile
/facilities/[slug]/room        Interactive room plan + station selection
/facilities/[slug]/book        Booking flow
/tooth-planner                 Interactive tooth selection (optional)
/manage                        Facility owner workspace
/manage/[slug]                 A single facility's catalogue and resources
/courses                       Courses published by facilities
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
| 3 | Two services | Porcelain | Split composition: object half, copy half, with an always-visible switcher |
| 4 | The room | Graphite | Full-width blueprint with interactive markers, side notes in a narrow column |
| 5 | How it works | Porcelain | Horizontal timeline on a single rail, worked example beneath |
| 6 | Facilities | Chalk | Editorial rows rather than a card grid |
| 7 | For owners | Graphite | Proposition left, designed workspace preview right |

Each section declares its theme explicitly through `data-section-theme`, and the
navigation reads it to switch between its light and dark variants.

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
│   facilities/ discovery + profile                            │
│   booking/    the reservation flow                           │
│   room/       blueprint + station selection                  │
│   teeth/      FDI tooth selection                            │
│   manage/     owner workspace                                │
│   lib/pricing.ts   rates and the 50% deposit rule             │
├─────────────────────────────────────────────────────────────┤
│ BACKEND                                      src/app/api/
│   facilities/        list, detail, station availability       │
│   availability/      slot generation per resource              │
│   booking/           create, quote, read                       │
│   courses/           published courses                         │
│   checkout/          Paymob session + webhook                  │
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

- Facility, course and station listings require `NEXT_PUBLIC_SUPABASE_URL`
  and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Until then the pages show an explicit
  empty state rather than placeholder content.
- The homepage room scene is a labelled preview. Live station availability is
  wired into the `RoomPlan` component and the station API, and arrives with
  the facility booking flow.
- The 3D scenes use the procedural placeholders. The supplied GLB is
  registered but not the default rendering.
- `public/models/molar/` and the old molar loader still exist; the
  `/tooth-planner` page uses a procedural FDI typodont instead.
- Authentication is not implemented. `platform_users` and
  `clinic_memberships` exist in the schema with RLS policies, but no session
  layer is wired up, so facility-scoped dashboards are not yet reachable.
- The admin screens under `src/app/admin` are the original demo screens and
  have not been restyled. They are not linked from the public navigation.

---

## 9. Scripts

| Script | Purpose |
|---|---|
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

Not added: any 3D library beyond what was already installed. No
Draco/Meshopt decoder was added — three's loader handles Draco-compressed GLB
natively, so an extra dependency would be unjustified.
