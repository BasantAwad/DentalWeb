# DentalWeb — High-Fidelity Visual Design Specification
## Architectural direction · Dynamic light/dark experience

Version: 1.0  
Date: 10 November 2026  
Status: Approved visual direction for design exploration and frontend implementation  
Repository: `BasantAwad/DentalWeb`

---

## 1. Design intent

DentalWeb is an editorial, architectural 3D showroom for dental training facilities and hourly equipment rental. It must feel carefully art-directed and tactile, not like a generic clinic template or booking SaaS.

The approved direction is **architectural** with a **dynamic background system**:
- Architectural: real spaces, proportion, materials, daylight, shadow, quiet confidence, precise grids, and restrained typography.
- Dynamic backgrounds: the experience may move between warm light scenes and deep dark scenes as the story changes. This is a deliberate narrative device, not random theme switching.
- 3D-first homepage: dental equipment and real training spaces are the visual protagonists.
- Practical booking: the reservation path remains clear, fast, accessible, and independent of 3D rendering.

Brand idea: **DentalWeb — A space to practice.**

Primary emotional response: “This feels like a thoughtfully designed place I can trust, and I can reserve what I need without friction.”

Do not copy Apple's layouts, Dribbble shots, or any other reference literally. Borrow interaction principles such as product storytelling, precise transitions, and spatial presentation, then create DentalWeb's own visual language.

## 2. Brand personality and design principles

### Personality
- Architectural, not clinical.
- Premium, not flashy.
- Modern, not futuristic-for-the-sake-of-it.
- Human, not sterile.
- Precise, not complicated.
- Expressive in discovery; restrained in checkout and management.

### Five design principles
1. **Space before decoration:** use composition, lighting, scale, and negative space instead of decorative gradients and floating cards.
2. **Objects have presence:** use correct dental equipment models, realistic proportions, and purposeful camera framing.
3. **Motion explains:** animation reveals relationships, scale, and choices; it must not exist only to impress.
4. **Clarity wins at decision points:** availability, duration, cost, deposit, and payment state must always be obvious.
5. **One coherent system:** the homepage can be cinematic, but typography, color, controls, and interaction states remain consistent throughout the product.

## 3. Color system

The primary system is warm architectural neutrals with mineral teal. Dark scenes use graphite and warm near-black rather than pure black.

### 3.1 Core tokens

| Token | Hex | Role |
|---|---|---|
| Porcelain 50 | #F8F7F3 | Brightest page background |
| Porcelain 100 | #F2F0E9 | Main light background |
| Chalk | #FFFFFF | Surface and form panels |
| Graphite 900 | #202522 | Primary text and dark scene |
| Graphite 800 | #2B322F | Dark surface |
| Graphite 700 | #3B4540 | Secondary dark surface |
| Slate 600 | #68716C | Secondary text on light |
| Slate 400 | #929A94 | Muted text and icons |
| Mineral Teal 700 | #245E59 | Accessible primary action / hover |
| Mineral Teal 600 | #2F7772 | Brand accent |
| Mineral Teal 100 | #DDEBE6 | Selected light surface |
| Sage 200 | #C8D9CF | Decorative/environmental accent |
| Sage 100 | #E7EEE8 | Subtle supporting surface |
| Warm Stone 300 | #D8D1C5 | Borders and dividers |
| Warm Stone 200 | #E6E0D6 | Light borders |
| Clay 500 | #C87963 | Restrained editorial accent |
| Success | #287A55 | Confirmed / paid |
| Warning | #98601C | Pending / temporary hold |
| Danger | #B44747 | Reserved conflict / failed / destructive |
| Info | #386B91 | Informational state |

### 3.2 Dynamic background sequence

The light/dark transitions are attached to the homepage narrative:

| Section | Background | Text | Purpose |
|---|---|---|---|
| Hero: dental chair | Graphite 900 or Porcelain 100 | High contrast | Dramatic object reveal |
| Service showcase | Porcelain 100 | Graphite 900 | Product comparison and prices |
| Room reveal | Graphite 900 | Porcelain 50 | Spatial immersion |
| Booking explanation | Porcelain 100 | Graphite 900 | Clarity and reassurance |
| Facility discovery | Chalk / Porcelain 100 | Graphite 900 | Browsing and conversion |
| Facility-owner section | Graphite 800 | Porcelain 50 | Separate B2B narrative |
| Footer | Graphite 900 | Porcelain 50 | Strong close |

The hero may use a dark stage if the actual model and lighting look stronger against graphite. The default fallback should be Porcelain 100 with a static hero render. The selected scene must be validated using the actual asset before the dark hero is locked.

Do not abruptly flip the entire site theme while the user is reading. Use section-level background changes with smooth, restrained transitions. Navigation should remain legible across both modes; it may use a light/dark variant based on the current section.

### 3.3 Color behavior rules
- Primary CTA: Mineral Teal 700 fill with white text.
- Secondary CTA on light: transparent/Porcelain surface, Graphite text, Warm Stone border.
- Secondary CTA on dark: transparent or Graphite 800 surface, Porcelain text, subtle light border.
- Teal selection: outline plus pale teal surface on light; brightened teal outline on dark.
- Clay is decorative only; never use it for the main booking action or success/error state.
- Reserved, unavailable, pending, and confirmed states must include labels/icons, not color alone.
- Maintain WCAG 2.2 AA contrast for all essential text and controls. Large decorative display text is not a substitute for readable body copy.

## 4. Typography system

Use two type families only.

### Display: Manrope
Use for hero headlines, section titles, service names, large prices, and editorial callouts. Weights 500, 600, and 700.

### Interface: Inter
Use for navigation, body copy, form labels, calendars, buttons, prices in dense layouts, dashboards, and tables. Weights 400, 500, 600.

If Manrope is unavailable, use Plus Jakarta Sans as the display fallback. Do not mix several display fonts.

### Type scale

| Token | Desktop | Mobile | Line height | Usage |
|---|---:|---:|---:|---|
| Display XL | 96px | 52px | 0.98–1.05 | Main hero |
| Display L | 72px | 44px | 1.02 | Product story |
| H1 | 52px | 36px | 1.08 | Page/section hero |
| H2 | 40px | 30px | 1.12 | Section heading |
| H3 | 28px | 23px | 1.2 | Panel/feature heading |
| H4 | 21px | 19px | 1.25 | Card/resource heading |
| Body L | 18px | 17px | 1.55 | Lead copy |
| Body | 16px | 15px | 1.55 | Default copy |
| Small | 14px | 13px | 1.45 | Supporting text |
| Label | 12px | 12px | 1.3 | Metadata and controls |

Rules:
- Use tight tracking for large display type only; body text remains comfortably spaced.
- Use tabular numerals for time, duration, prices, and booking references.
- Avoid long all-caps labels.
- Avoid overly thin font weights over photography or 3D.
- Headlines should be short and intentional; do not center every section.

## 5. Layout, grid, and spacing

### Desktop
- Max content width: 1440px.
- Main page gutters: 6vw, capped at 96px.
- 12-column grid.
- Standard section vertical spacing: 120–160px.
- Hero height: 100svh with sensible minimum and maximum constraints.
- Sticky 3D canvas may occupy 50–60% of the viewport while narrative content scrolls alongside it.

### Tablet
- 8-column grid.
- Gutters: 32–48px.
- Reduce model scale and simplify sticky/camera choreography.

### Mobile
- 4-column grid.
- Gutters: 20–24px.
- Hero min-height: 760px where practical, but avoid forcing excessive height on short devices.
- No essential text or booking CTA may be hidden behind the 3D canvas.
- Use static poster or simplified 3D scene on low-power devices.

### Spacing scale
Use a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120, 160px.

### Shape language
- Buttons: 10–12px radius.
- Inputs: 10px radius.
- Cards/panels: 14–18px radius.
- Large media frames: 18–24px radius only when the composition needs containment.
- Avoid making every element a pill or rounded card.
- Use thin borders and shadows sparingly. Spatial separation should come primarily from layout and background contrast.

## 6. Button and control specification

### Primary CTA
- Height: 52px desktop, 48px mobile.
- Horizontal padding: 22–26px.
- Background: Mineral Teal 700.
- Text: Chalk, Inter 600, 14–15px.
- Radius: 12px.
- Optional right arrow, 16px.
- Hover: shift toward Deep Teal, translateY(-1px), restrained shadow.
- Pressed: translateY(0), slightly darker surface.
- Focus: 2px visible outer ring with sufficient contrast.
- Disabled: neutral surface and explicit disabled state.

Primary labels should be verbs: “Explore spaces”, “Check availability”, “Continue”, “Pay 225 EGP deposit”.

### Secondary CTA
- Same height as primary.
- Transparent or surface fill with 1px border.
- Graphite text on light; Porcelain text on dark.
- Hover background: Sage 100 on light / Graphite 700 on dark.

### Tertiary link
- Text-only with arrow or underline treatment.
- Use for “View facility”, “See details”, “Explore courses”.

### Icon buttons
- 40–44px hit area minimum.
- Use simple line icons with consistent stroke.
- Tooltip/accessible label required for icon-only actions.

### Inputs
- Height: 48–52px.
- Always visible label; placeholder is an example, not the label.
- 1px Warm Stone border, white/Porcelain surface.
- Focus border Mineral Teal and clear focus ring.
- Error includes a text message and icon.
- Avoid excessive shadows and floating-label-only forms.

### Calendar and time controls
- Dates: compact cells with clear selected, today, disabled, and booked states.
- Time slots: rectangular controls with 8–10px radius.
- Available: neutral border and clear “Available” semantics.
- Selected: teal fill or pale teal surface with strong outline.
- Reserved: disabled, labelled “Reserved”.
- Temporary hold: labelled “On hold” only when the user is authorized to see their own hold; public UI should avoid revealing private booking data.
- Maintenance: labelled “Unavailable”.
- Never show a slot as confirmed available without a current backend availability response.

## 7. Navigation system

### Public desktop navigation
- Wordmark left.
- Explore, How it works, Courses (if enabled), For facilities.
- Right side: Sign in and primary “Explore spaces” CTA.
- Transparent over the hero only if contrast is verified; transitions to a solid/blurred surface after the hero.
- Keep navigation height around 76–88px.

### Mobile navigation
- Wordmark and menu control.
- Full-screen or large overlay menu with simple links.
- Sticky bottom CTA only where it does not overlap booking controls.
- Do not hide essential service discovery behind a complicated animated menu.

### Dynamic navigation
The nav adapts to the current scene:
- On dark sections, use Porcelain text and a subtle dark translucent surface.
- On light sections, use Graphite text and Chalk/Porcelain surface.
- Transition between variants with opacity/color over 200–300ms.
- Do not let a theme transition cause a flash or unreadable intermediate state.

## 8. Homepage high-fidelity storyboard

The homepage is a scroll-led product film with six scenes. The 3D object is the protagonist, but all text and controls remain normal accessible DOM content.

### Scene 1 — The dental chair / hero
**Purpose:** establish brand and make the visitor curious.

Composition:
- Full-viewport stage.
- Realistic dental chair GLB occupying roughly 45–58% of the desktop composition.
- Camera at a three-quarter angle, slightly below or level with the chair's visual center.
- Large heading on the opposite side: “A better space to practice.”
- Supporting copy: “Discover and reserve dental training equipment by the hour.”
- Main CTA: “Explore spaces”.
- Secondary CTA: “See how it works”.
- Small eyebrow: “DENTAL TRAINING SPACES”.
- Discreet scroll cue.

Motion:
- Camera begins at a composed wide angle; model settles into frame.
- Scroll gradually changes camera position and target, revealing the chair's structure.
- A subtle material/light shift may reveal details.
- No uncontrolled spinning, bounce, or model wobble.
- The hero CTA remains available until the visitor leaves the hero scene.

### Scene 2 — Two ways to practice
**Purpose:** explain the two rentable services and prices.

Composition:
- Background changes to Porcelain 100.
- Large heading: “Choose what you need.”
- Two separate product compositions, not generic equal cards.
- Dental chair: “Dental chair” / “150 EGP per hour”.
- Phantom head: “Phantom head” / “100 EGP per hour”.
- Each object gets a distinct camera and lighting setup.
- Each has “Explore availability” action.

Interaction:
- Scroll reveals the chair, then transitions to phantom head.
- A visible selector allows users to jump between the two.
- Selecting either service opens its facility/service availability path.
- Prices come from backend-configured service data; these displayed figures are the current confirmed business rates, not decorative text embedded in the model.

### Scene 3 — A room with real choices
**Purpose:** demonstrate the differentiating room/resource selector.

Composition:
- Background transitions to Graphite 900.
- Show the real supplied room blueprint, correctly proportioned and legible.
- If a 3D room model exists, use it as an alternate perspective, not a replacement for the accurate blueprint.
- Text: “Choose your place in the room.”
- Show only configured bookable stations.
- Highlight a selected station and a small details panel.

Interaction:
- Click/tap a station to inspect its status.
- Available stations can be selected.
- Reserved or maintenance stations are disabled with explicit labels.
- Blueprint selection maps to stable backend resource IDs.
- A list-based alternative is always available for keyboard and screen-reader users.

### Scene 4 — Booking without the back-and-forth
**Purpose:** make the process feel simple and transparent.

Composition:
- Background returns to Porcelain 100.
- Four editorial steps appear in sequence:
  1. Choose a service.
  2. Select a date, start time, and duration.
  3. Review the total and 50% deposit.
  4. Pay the deposit to confirm.
- Use typography, a thin progress line, and subtle motion rather than four generic cards.

Show one accurate example:
- Dental chair, 2 hours = 300 EGP total.
- Deposit due = 150 EGP.
- Remaining balance = 150 EGP.
Do not imply that the remaining balance is necessarily collected online; its payment method is still a business decision.

### Scene 5 — Explore facilities
**Purpose:** move from brand storytelling into actual discovery.

Composition:
- Chalk/Porcelain background.
- Strong heading: “Find your practice space.”
- Search/filter controls remain visible and usable.
- Facility previews use authentic facility photography and equipment imagery.
- Each preview includes facility name, location, available service types, and useful details.
- Use asymmetrical editorial layout rather than identical card grids.
- Clear “View facility” and “Check availability” actions.

Do not invent facility ratings, verified badges, opening hours, or availability.

### Scene 6 — For facility owners
**Purpose:** communicate the B2B value proposition.

Composition:
- Graphite 800 background.
- Heading: “Your space. Better managed.”
- Show an elegant room/resource management preview and calendar fragment.
- Explain that facilities can present their space, configure equipment, and manage reservations.
- CTA: “List your facility”.

Footer returns to Graphite 900 with restrained link groups.

## 9. Facility profile visual specification

The facility page should feel like an architectural tour of a real location.

### Above the fold
- Large panoramic facility photo or real 3D room render.
- Facility name and location.
- Short description.
- Service availability summary.
- Primary “Check availability” action.
- A small verified label only if verification has actually happened.

### Main layout
Desktop:
- Main content around 8 columns.
- Booking panel around 4 columns, sticky while appropriate.
- Avoid letting the panel cover room imagery or important details.

Mobile:
- Full-width hero media.
- Facility name, location, and service summary.
- Sticky bottom “Check availability” action.
- Booking details appear in a normal flow or bottom sheet.

### Sections
1. Overview.
2. Equipment and services.
3. Room layout / phantom-head stations, if configured.
4. Availability preview.
5. Facility details and policies.
6. Location and contact.
7. Courses, if the facility offers them.

### Media behavior
- Use real facility images first.
- Use GLB viewer only when the facility provides a suitable model.
- Never show a generic 3D room as if it were the real facility.
- Provide static image fallback and descriptive alt text.

## 10. Booking flow high-fidelity specification

The booking flow is intentionally calmer than the homepage.

### Step 1 — Choose service
- Large but compact service visual.
- Dental chair — 150 EGP/hour.
- Phantom head — 100 EGP/hour.
- If individual phantom-head stations are configured, the room selector may appear after service choice or as part of resource selection.
- Do not require tooth selection or clinical details.

### Step 2 — Select date and time
- Calendar shows bookable dates.
- Selecting a date loads availability for that facility and service/resource.
- Customer chooses a start time and duration in hours.
- The backend determines which durations are valid based on continuous availability and facility opening hours.
- If a selected duration becomes unavailable, explain the conflict and ask the user to choose another slot.
- Do not allow client-side-only availability decisions.

### Step 3 — Review
Show:
- Facility.
- Service and resource/station if applicable.
- Date.
- Start and end time.
- Number of hours.
- Hourly rate.
- Total booking amount.
- Deposit required (50%).
- Remaining balance.

Example:
- Dental chair.
- 2 hours × 150 EGP = 300 EGP.
- Deposit = 150 EGP.
- Remaining balance = 150 EGP.

### Step 4 — Deposit payment
- CTA names the exact amount due now.
- Show payment provider and supported payment methods only when configured.
- Do not claim the booking is confirmed while payment is pending.
- Confirmation appears only after trusted server-side payment verification.
- Payment failure/expiry has a clear recovery path.

## 11. Room blueprint and 3D resource selection

The uploaded blueprint is the source of truth for the room's spatial arrangement.

### Blueprint display
- Preserve original aspect ratio and legibility.
- Do not stretch, skew, redraw, or rearrange the floor plan.
- Overlay interactive hit areas on the actual resource locations.
- Keep hit areas large enough for touch without visually distorting the plan.
- Use zoom, pan, reset, and fullscreen controls.
- Show a synchronized accessible list of resources.

### Resource states
- Available: subtle teal marker + “Available”.
- Selected: Mineral Teal outline + checkmark + resource label.
- Reserved: disabled marker + lock icon + “Reserved”.
- Maintenance: neutral marker + tool icon + “Maintenance”.
- Temporarily held: only show private hold details to the customer who owns the hold or authorized facility staff.

### 3D room view
- Optional alternate view when a real room GLB is available.
- Match actual geometry, station count, station placement, and resource IDs.
- Clicking a model node and clicking the blueprint marker must select the same resource.
- Do not invent stations or imply a station is rentable unless it exists in backend configuration.
- 2D blueprint remains available at all times.

## 12. 3D asset preparation and rendering standards

### Preferred delivery
- GLB/GLTF for web runtime.
- Blender for cleanup, scale, origin, materials, naming, and export.
- Draco/Meshopt geometry compression when suitable.
- KTX2/Basis texture compression where supported.
- PBR materials with controlled roughness and realistic reflections.

### Asset naming
Use stable, semantic names:
- `DentalChair_Main`
- `PhantomHead_01`
- `Room_Station_01`
- `Room_Station_02`

Do not rely on generated mesh indices as business identifiers. Maintain an explicit mapping from model node names to backend resource IDs.

### Per-model handoff checklist
- Source file and exported GLB.
- Real-world dimensions and unit scale.
- Forward/up axes and origin.
- Camera framing and target.
- Material/texture inventory.
- Polygon and texture budgets.
- Interactive node names.
- Static poster render.
- Mobile quality fallback.
- License/ownership confirmation.

### Visual quality
- Preserve proportions and orientation.
- Use consistent studio/environment lighting.
- Avoid overexposed whites and plastic-looking materials.
- Keep shadow grounding believable.
- Use contact shadows carefully.
- Do not use heavy bloom, neon outlines, or excessive depth of field.
- Make sure the model looks intentional against both light and dark backgrounds.

## 13. Motion design specification

### Motion principles
- Calm, deliberate, physical.
- Use easing that feels like camera equipment moving, not UI bouncing.
- Motion should have a beginning, middle, and end.
- Avoid long delays before interaction becomes possible.

### Timing guide
| Interaction | Duration |
|---|---:|
| Button hover/press | 120–180ms |
| Small UI transition | 180–260ms |
| Navigation theme change | 200–300ms |
| Section text reveal | 400–650ms |
| Hero camera settle | 900–1400ms |
| Scroll-driven camera movement | Tied to scroll progress |
| Dialog/bottom sheet | 220–320ms |

### Scroll choreography
- Use GSAP ScrollTrigger for camera timelines.
- Use Framer Motion for UI-level transitions.
- Keep scroll reversible.
- Use a sticky canvas and normal document scrolling.
- Do not hijack wheel/touch events.
- Do not force scroll snapping.
- Do not hide navigation or booking CTA during the 3D sequence.
- Limit major camera transitions to the six defined homepage scenes.

### Reduced motion
When `prefers-reduced-motion: reduce` is enabled:
- Disable scroll-linked camera movement and parallax.
- Show static model renders or a non-animated model viewer.
- Keep section transitions immediate or use simple fades.
- Preserve all content and functionality.

## 14. Responsive and performance tiers

### Desktop high quality
- Full interactive 3D hero.
- Scroll-driven camera timeline.
- High-resolution environment and textures within budget.
- Pointer parallax limited to subtle movement.

### Tablet balanced
- Lower render resolution and shadow complexity.
- Fewer animated details.
- Simplified camera transitions.
- Keep all booking controls fully functional.

### Mobile performance
- Static hero render or lightweight model.
- No complex scroll choreography by default.
- Tap-based service switching.
- Blueprint uses touch pan/zoom and accessible station list.
- Booking flow prioritizes speed and readable controls.

### Failure fallbacks
If WebGL is unavailable, a model fails to load, or the device cannot sustain rendering:
- Show the poster image.
- Keep heading, CTA, pricing, and navigation visible.
- Never block access to facilities or booking.
- Log technical errors without exposing stack traces to customers.

## 15. Frontend implementation architecture

Recommended stack:
- Next.js + TypeScript.
- React Three Fiber + Three.js.
- Drei.
- GSAP + ScrollTrigger.
- Framer Motion.
- Tailwind CSS with CSS variables for design tokens.
- Blender for model preparation.

### Component boundaries
- `<HeroScene />`: 3D canvas and camera choreography.
- `<SceneFallback />`: static poster and accessible content.
- `<ServiceShowcase />`: service selection and price presentation.
- `<FacilityRoomPlan />`: blueprint and resource hit areas.
- `<FacilityRoomViewer3D />`: optional 3D room view.
- `<BookingPanel />`: booking UI.
- `<AvailabilityCalendar />`: date and time availability.
- `<BookingPriceSummary />`: server-validated pricing display.
- `<DepositCheckout />`: deposit payment flow.
- `<ThemeSection />`: section background and navigation theme context.

### Separation of responsibilities
3D scene:
- Rendering, camera, lights, materials, model animation, selection visualization.
- Never stores authoritative price, booking status, or payment state.

Application layer:
- Service selection, date/time selection, booking draft, resource selection, price summary.
- Calls backend APIs and reflects server state.

Backend:
- Resource inventory, operating hours, availability, reservation integrity, pricing configuration, payment verification, booking states.

### Loading strategy
- Lazy-load 3D scene code and assets.
- Use one main canvas for the homepage where possible.
- Do not load the room model and hero model simultaneously unless necessary.
- Preload only the next scene's small assets when beneficial.
- Pause rendering when offscreen or document is hidden.
- Use compressed textures and geometry.
- Track LCP, CLS, INP, and actual frame rate on representative devices.

## 16. Design tokens and CSS implementation

Implement colors, typography, spacing, radii, and shadows as CSS custom properties. Avoid scattering literal hex values throughout components.

Suggested token names:
- `--color-bg-light`
- `--color-bg-dark`
- `--color-surface`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-brand`
- `--color-brand-hover`
- `--color-border`
- `--font-display`
- `--font-interface`
- `--radius-control`
- `--radius-panel`
- `--space-section`

The section theme should be explicit (for example, `data-theme="light"` or `data-theme="dark"`) rather than inferred from scroll position inside every individual component. Navigation may subscribe to the active section theme.

## 17. Accessibility and usability requirements

- All actions work with keyboard and touch.
- Visible focus indicators.
- Semantic headings and landmarks.
- Alt text for meaningful facility and equipment images.
- 3D content has descriptive fallback text.
- Resource selection is available without 3D.
- Availability states do not rely on color alone.
- Contrast meets WCAG 2.2 AA for essential content.
- Respect reduced motion.
- Ensure buttons and touch targets are comfortably usable.
- Avoid auto-playing audio.
- Do not let sticky elements obscure focused controls or mobile content.

## 18. Design deliverables before full implementation

The design phase is complete only when these artifacts are reviewed:

1. Desktop homepage high-fidelity storyboard, six scenes.
2. Mobile homepage storyboard with simplified 3D.
3. Light and dark scene variants.
4. Typography, palette, spacing, radii, and button token sheet.
5. Hero composition using the actual dental chair asset or clearly marked placeholder.
6. Service showcase for chair and phantom head with actual rates.
7. Facility profile high-fidelity page.
8. Booking flow high-fidelity screens, including deposit summary.
9. Interactive blueprint prototype using the real supplied floor plan.
10. Motion storyboard with camera targets and scroll ranges.
11. Asset manifest and model optimization checklist.
12. Loading, error, WebGL-unavailable, and reduced-motion states.

Do not proceed directly from this document to building every page in one pass. First validate the hero scene and blueprint selector because they carry the most visual and technical risk.

## 19. Implementation milestones

### Milestone 1 — Visual foundation
- Add fonts and CSS variables.
- Implement navigation variants and button/input primitives.
- Establish desktop/mobile grid and section theme behavior.
- Build static homepage layout.

### Milestone 2 — Hero proof of concept
- Prepare actual dental chair GLB.
- Validate scale, orientation, materials, camera, and lighting.
- Build hero scene and static fallback.
- Add one scroll-driven camera transition.
- Test performance on desktop and mobile.

### Milestone 3 — Product story
- Add phantom head scene.
- Implement service switching and pricing.
- Add room reveal section.
- Validate section theme transitions.

### Milestone 4 — Room selector
- Load actual blueprint.
- Map interactive areas to real resource IDs.
- Implement available/reserved/maintenance states.
- Add accessible list and mobile controls.

### Milestone 5 — Facility and booking
- Build facility profile.
- Implement availability calendar and duration selection.
- Implement review and 50% deposit summary.
- Connect backend and verified payment state.

### Milestone 6 — Polish and QA
- Test responsive layouts.
- Test reduced motion and WebGL fallback.
- Test keyboard and screen readers.
- Optimize model/texture payload.
- Validate contrast, loading, and booking reliability.

## 20. Acceptance criteria

The visual design is accepted when:
- The homepage opens with a distinctive, realistic dental equipment scene.
- The experience feels architectural and premium, not like a generic dental template.
- Light/dark transitions are deliberate and tied to the narrative.
- Scroll interactions are smooth, reversible, and never block navigation or booking.
- Both services and their hourly prices are presented accurately.
- The supplied blueprint remains geometrically faithful and maps to real resources.
- 3D models maintain correct proportions, orientation, materials, and lighting.
- The website remains usable with reduced motion, no WebGL, and on mobile.
- Facility profiles feel like real spaces rather than generic listing cards.
- Booking clearly communicates total, 50% deposit, and remaining balance.
- No payment or booking is marked confirmed before backend verification.
- No reference website or Dribbble design is copied.

**North star:** make the space memorable, make the equipment tangible, and make the reservation effortless.
