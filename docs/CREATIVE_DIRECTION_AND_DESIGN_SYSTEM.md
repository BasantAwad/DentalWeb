# DentalWeb — Creative Direction & Visual Design System

Version: 1.0  
Date: 10 November 2026  
Status: Proposed visual direction for design and frontend implementation

## 1. Creative brief

DentalWeb should not resemble a conventional dental clinic website, a generic booking SaaS dashboard, or a template marketplace. It should feel like an editorial, premium, interactive 3D showroom for dental training spaces and equipment.

The experience combines product-storytelling interactions, a restrained premium visual system, and a genuinely usable booking product. The 3D experience attracts the user; the booking system does the actual work.

Working concept: **DentalWeb — A space to practice.**

Brand attributes: precise, tactile, confident, contemporary, calm, architectural, human.

Avoid generic purple SaaS gradients, floating glass cards everywhere, cartoon teeth, medical stock imagery, glowing neon sci-fi interfaces, excessive rounded pills, overanimated scroll effects, and 3D that hides the booking CTA.

Reference direction: Apple-style product storytelling and the broad 3D web/UI exploration represented by the supplied Dribbble search page. These are interaction and craft references only. Do not copy any specific composition, visual identity, animation, or asset.

## 2. Art direction

### Visual world
Use a warm architectural studio rather than a hospital aesthetic:
- Warm porcelain/off-white backgrounds.
- Deep graphite typography.
- Mineral teal as the primary brand accent.
- Muted sage and brushed-metal neutrals.
- A restrained coral/orange accent for small moments of emphasis.
- Realistic, carefully lit dental equipment with soft shadows and tactile material response.

The 3D scene should feel like a premium industrial-design product film: controlled studio lighting, realistic proportions, clean surfaces, subtle reflections, and deliberate camera framing.

### Proposed palette

| Token | Hex | Usage |
|---|---|---|
| Porcelain | #F5F3EE | Main page background |
| Pure white | #FFFFFF | Cards, panels, forms |
| Graphite | #202522 | Main text and dark sections |
| Slate | #68716C | Secondary text |
| Mineral teal | #2F7772 | Brand action, links, selected controls |
| Deep teal | #174C49 | Hover/pressed and dark accent |
| Pale sage | #DCE8E1 | Soft selection and supporting surfaces |
| Warm stone | #D8D1C5 | Neutral borders, dividers, secondary surfaces |
| Soft coral | #D77F68 | Tiny highlight moments, not primary CTA |
| Success | #287A55 | Available/paid/confirmed |
| Warning | #A96A20 | Pending/temporary hold |
| Danger | #B44747 | Reserved conflict, failed, destructive |

Default to Porcelain, Graphite, Slate, and Mineral teal. Coral is a rare editorial accent, not a status color. Availability must use text/icon/pattern as well as color. Validate contrast to WCAG 2.2 AA.

### Typography

Use a two-family system:
- **Display:** Manrope (or Plus Jakarta Sans) for expressive large headings.
- **Interface/body:** Inter for forms, calendars, prices, navigation, and dense operational data.

Optional alternative: DM Sans for body if it fits the display face better. Do not load three or more font families.

| Style | Desktop | Mobile | Weight |
|---|---:|---:|---|
| Display hero | 76–104px | 42–56px | 600 |
| Section title | 48–64px | 34–42px | 600 |
| Page title | 36–44px | 28–34px | 600 |
| Card title | 20–24px | 18–22px | 600 |
| Body large | 18px | 17px | 400 |
| Body | 16px | 15px | 400 |
| UI label | 13–14px | 13–14px | 500 |
| Micro label | 11–12px | 11–12px | 600 |

Use tabular numerals for prices, durations, and booking times. Avoid all-caps paragraphs.

## 3. Buttons and controls

**Primary button:** Mineral teal fill (#2F7772), white text, 12px radius, 48–54px height. Hover to Deep teal with a subtle 1–2px lift; pressed state compresses briefly. Use a visible high-contrast focus ring.

**Secondary button:** Transparent/Porcelain surface, Graphite text, 1px Warm stone border. Hover uses Pale sage.

**Tertiary action:** Text with a small directional arrow; use for Explore, View details, and secondary navigation.

**Dark-scene button:** Porcelain fill with Graphite text on dark 3D sections. Avoid low-contrast translucent controls over complex geometry.

**Inputs:** White or Porcelain surface, clear 1px border, 10–12px radius. Labels remain visible; never rely only on placeholders. Focus uses Mineral teal and an accessible ring. Errors include text and icon.

**Selection controls:** Service cards and resource choices have strong selected outlines and concise descriptions. Time slots are compact rectangular controls, not decorative chips. Selected date/time remains obvious. Disabled/reserved slots include a reason or status label.

## 4. Homepage — a scroll-driven 3D product story

The homepage opens directly into a full-viewport 3D scene. It should not begin with a conventional search form or a row of cards.

### Scene 01 — The object reveal
- Full-screen warm porcelain or dark graphite stage.
- High-quality 3D dental chair as hero object, placed slightly off-center.
- Large editorial heading: “A better space to practice.”
- Supporting line: “Find and reserve dental training equipment by the hour.”
- Main CTA: “Explore spaces”. Secondary action: “How it works”.
- Small scroll indicator and restrained DentalWeb wordmark/navigation.

On load, the chair fades/assembles into the scene with a slow camera settle. Pointer movement creates subtle parallax; do not spin aggressively. As the user scrolls, camera moves around the chair and reveals details. Text exits cleanly without overlapping the object.

### Scene 02 — Choose your practice
Scroll transitions from the dental chair to two distinct product vignettes:
- Dental chair rental — 150 EGP/hour.
- Phantom head rental — 100 EGP/hour.

Each object gets its own lighting, camera framing, short description, rate, and “Explore availability” CTA. Users can also switch with an explicit control; do not require scrolling to discover the other service.

### Scene 03 — Your space, your choice
Transition into the actual facility room. Use the supplied room blueprint as the accurate 2D selection view. If a real 3D room asset is available, it may be an enhanced view, but it must preserve real station positions and resource IDs. Show labelled stations and an “Explore a room” interaction. Do not imply every visible chair/stool is rentable.

### Scene 04 — Booking made simple
A scroll section with four typographic steps:
1. Choose a service.
2. Pick an available time and duration.
3. Review the total and 50% deposit.
4. Pay the deposit to confirm.

Use motion to connect steps, not generic feature cards. Show actual rates where relevant.

### Scene 05 — Explore real facilities
Transition into a practical discovery section with facility photography/profile previews, search/filter controls, real facilities and available services, and clear View facility/Book actions. The homepage remains useful if 3D fails: provide a static hero poster and normal HTML content.

### Scene 06 — For facility owners
A concise editorial section showing how facilities manage resources, room layouts, and reservations. Use a small UI preview or room-plan detail, not a generic dashboard collage.

Footer: minimal and spacious. Include Explore, Courses if enabled, List a facility, Help, Terms, Privacy, and contact details.

## 5. Scroll and interaction language

Use scroll-linked animation for a few high-value narrative transitions, not every section.

Allowed patterns:
- Camera orbit or dolly around hero equipment.
- Object scale/position changes tied to scroll progress.
- Section background transitions from Porcelain to Graphite.
- Text reveal with opacity and small vertical movement.
- Equipment close-up with subtle annotation callouts.
- Sticky scene canvas with normal document sections scrolling beside/over it.

Use GSAP ScrollTrigger for controlled scroll timelines. Use Framer Motion for interface transitions and microinteractions. Scroll progress must be reversible. Avoid hijacking scroll, forced snap scrolling, long intro gates, and animation that delays booking access. Honor reduced-motion preferences. Mobile gets simpler camera transitions or static imagery. Keep CTA and navigation available while the 3D canvas is active.

## 6. Facility profile — premium editorial showroom

The facility profile should feel like entering a real place:
- Large immersive facility photo/3D room preview.
- Facility name and location in a clear editorial overlay.
- Short facts: available services, opening hours, address, and verified status only if actually verified.
- Sticky booking panel on desktop, compact bottom booking action on mobile.
- Resource section with real equipment photography/model previews.
- Room plan preview for phantom-head stations where configured.
- Practical details, policies, location, and FAQs below.

The booking panel remains a clean HTML interface, not embedded inside the 3D scene.

## 7. Booking experience — functional contrast

The booking flow should become visually quieter than the homepage. Do not force 3D animation into checkout.

Use a Porcelain background, white booking surface, Graphite text, compact step indicator, service selector with product imagery, availability calendar, duration selector based on actual consecutive available hours, and price summary visible on desktop and expandable on mobile.

Review screen explicitly displays hourly rate, duration, total, deposit (50%), and remaining balance. Payment CTA displays the exact amount due now. Confirmation appears only after server-side payment verification.

Confirmed core prices:
- Dental chair: 150 EGP/hour.
- Phantom head: 100 EGP/hour.
- Deposit: 50% of total booking amount.

The basic rental journey must not require 3D tooth selection, clinical details, assistant requests, or manual approval unless separately confirmed.

## 8. Room selector visual language

The supplied blueprint remains authoritative for station placement. Use a clean, precise technical overlay:
- Original blueprint rendered at correct aspect ratio.
- Interactive hit targets mapped to stable resource IDs.
- Selected station: Mineral teal outline, checkmark, and visible label.
- Reserved: muted red/lock and “Reserved”.
- Maintenance: grey/tool icon and “Maintenance”.
- Available: subtle teal marker and “Available”.
- Right-side detail panel on desktop; bottom sheet on mobile.
- Zoom, pan, reset, and fullscreen.
- Synchronized accessible list fallback.

Do not replace the blueprint with a fictional 3D room. A later GLB room viewer can be an alternate view if it accurately maps to the same resources.

## 9. 3D model quality requirements

The experience succeeds or fails on model quality and framing.

Prefer GLB/GLTF for web delivery. Inspect/clean models in Blender. Use geometry compression where appropriate and optimized KTX2/Basis textures. Keep materials PBR and physically plausible. Name selectable nodes consistently and map them to stable application IDs.

For each hero asset, define real-world scale/orientation, camera position/target/FOV, lighting rig/environment, material roughness/metalness, texture resolution, polygon budget/mobile fallback, poster image/loading behavior, and accessibility description.

Do not stretch, squash, crop, or arbitrarily rotate equipment to fit a layout. Change camera and composition instead.

## 10. Recommended frontend implementation

Recommended stack:
- Next.js + TypeScript for application and routing.
- React Three Fiber for declarative Three.js scenes.
- Drei for loaders, controls, environment helpers, and common 3D utilities.
- Three.js for lower-level rendering and model control.
- GSAP + ScrollTrigger for scroll-driven camera timelines.
- Framer Motion for UI transitions and microinteractions.
- Tailwind CSS for layout and design tokens, with CSS variables as the single source of truth.
- GLB/GLTF assets prepared in Blender.

3D canvas is an enhancement layer, not the source of booking truth. Booking calendar, price calculation, payment, and resource status remain normal React/HTML components connected to backend APIs. Lazy-load scenes and split each scene into its own component. Avoid rendering large 3D scenes on admin/data-heavy pages. Provide poster/static fallback for low-power devices, failed WebGL, and reduced-motion users. Measure Core Web Vitals and test real mobile devices.

## 11. Performance and accessibility

- First contentful view shows useful text and a CTA before the 3D asset fully loads.
- Use compressed GLB, optimized textures, lazy loading, and progressive enhancement.
- Avoid multiple simultaneous canvases.
- Pause/reduce rendering when canvas is offscreen or tab is inactive.
- Provide mobile quality tier and static fallback.
- Keyboard access to all booking controls.
- Do not make 3D the only way to select a resource.
- Respect reduced motion.
- Ensure text contrast and focus states.
- Do not use color alone for availability.

## 12. Design delivery requirements

Before implementing the whole website, produce:
1. Brand moodboard and color/type/button tokens.
2. Desktop homepage storyboard with all six scroll scenes.
3. Mobile homepage storyboard with simplified motion.
4. High-fidelity hero composition using actual dental chair GLB or clearly labelled temporary asset.
5. Facility profile visual design.
6. Booking flow visual design with actual hourly prices and 50% deposit.
7. Interactive room blueprint proof-of-concept using the real supplied plan.
8. Motion specification: scroll ranges, camera targets, timing, easing, reduced-motion behavior.
9. Component inventory and responsive behavior.
10. Asset manifest with model owner, format, size, node names, and fallback poster.

## 13. Build order

1. Establish tokens, typography, button system, and page shell.
2. Build a static but polished homepage composition with real content.
3. Add one high-quality hero 3D asset and loading/fallback behavior.
4. Add scroll-driven chair-to-phantom-head product story.
5. Build facility profile and room blueprint interactions.
6. Build clean booking flow and deposit calculation.
7. Add facility dashboards and remaining public pages.
8. Optimize performance and accessibility before adding more 3D scenes.

Do not build every page as a 3D scene. Use 3D where it creates discovery, understanding, or meaningful selection. Keep forms, calendars, payment, tables, and management interfaces fast and readable.

## 14. Acceptance criteria

- Homepage opens with a compelling, high-quality dental equipment 3D scene.
- Scrolling produces deliberate product storytelling and reversible transitions.
- Main CTA is accessible immediately and throughout the experience.
- Dental chair and phantom head are presented with confirmed hourly prices.
- 3D assets preserve proportions, materials, orientation, and camera framing.
- Mobile and reduced-motion users receive a complete, usable experience.
- Facility profile feels like a place/showroom, not a generic listing card.
- Booking is clear, quick, and not obstructed by animation.
- Actual blueprint geometry and station mappings are preserved.
- No booking status or price is hardcoded in the 3D scene.
- No reference design is copied; visual identity is original to DentalWeb.

**North star:** the homepage should make someone want to explore the space; the booking flow should make it effortless to reserve it.
