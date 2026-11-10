# DentalWeb

**A space to practice.**

DentalWeb is a web platform concept and application project focused on helping dental students and dental professionals find practical training spaces, reserve dental equipment, and discover educational courses offered by dental facilities.

The project brings together three core services:

1. **Dental chair rental** — reserve a dental chair for practical work.
2. **Phantom-head training** — reserve a specific phantom-head station in a training room.
3. **Dental courses and practical training** — discover courses that help students understand dental subjects, learn clinical concepts, and develop practical skills through theoretical and supervised practical sessions where offered.

DentalWeb also includes planned client accounts and facility-owner tools so reservations, course registrations, and facility resources can be managed in one platform.

> **Project status:** This repository is under active development. The product scope and design direction are documented, but not every feature described below should be assumed to be implemented or connected to a production backend yet. Check the current application code and implementation notes before treating a feature as live.

---

## Product vision

DentalWeb should make it easier for dental students to move between learning and practice:

- Find a facility that offers the equipment or training they need.
- Understand the facility's services, equipment, and available resources.
- Reserve a dental chair or a specific phantom-head station.
- Discover courses that support academic understanding and practical development.
- Keep personal reservations and course enrollments organized in one account.

For facilities, DentalWeb is intended to provide a way to present their spaces and services, manage bookable resources, coordinate reservations, and publish/manage courses.

## Core services

### 1. Dental chair rental

Students can discover facilities offering dental chair rental, check availability, choose a date/time and duration, and review the reservation cost.

**Current confirmed business rate:** 150 EGP/hour.

### 2. Phantom-head training

Students can find phantom-head training facilities and select a specific available station.

The room selector is intended to use the actual facility room blueprint. Each station should have an independent identity and availability state:

- Available.
- Selected.
- Reserved/unavailable.
- Maintenance, where supported.

Hovering or focusing a station should highlight it and show its identity/status. Selecting an available station should keep it highlighted. Reserved stations must not be selectable.

**Current confirmed business rate:** 100 EGP/hour.

### 3. Dental courses and practical training

Facilities can offer courses that help dental students understand their subjects, strengthen theoretical knowledge, and improve practical skills.

A course may include theoretical explanations, demonstrations, supervised practical sessions, or a combination, depending on the course.

The intended course experience includes:
- Course discovery and search.
- Subject, specialty, academic-level, training-type, facility, and date filters where data is available.
- Dedicated course detail pages.
- Instructor and facility information.
- Learning objectives and topics.
- Session schedules, location, price, and available seats.
- Student registration and enrollment history.
- Facility-owner course and enrollment management.

Courses are a separate service from hourly equipment rental. Their pricing, capacity, registration, and payment rules must be configured independently.

---

## Main product experiences

### Public website
- Homepage introducing the three core services.
- Dedicated dental chair and phantom-head service pages.
- Facility discovery and individual facility profiles.
- Course discovery and individual course pages.
- A focused booking and registration experience.

### Client account
The intended client area includes:
- Personal dashboard.
- Editable profile and optional dental education details.
- Reservation history, including upcoming and past reservations.
- Booking details and payment status where supported.
- Course enrollments and upcoming course sessions.
- Account settings and security.

### Facility-owner area
The intended facility management experience includes:
- Facility profile and media management.
- Rooms and bookable station/resource configuration.
- Services, prices, and operating hours.
- Reservation management.
- Course creation and management.
- Instructor, session, capacity, and enrollment management.

Facility owners should only be able to access information and records associated with facilities they are authorized to manage.

---

## Booking and payment rules

The following rental rules have been confirmed for the product:

| Item | Rule |
|---|---:|
| Dental chair | 150 EGP/hour |
| Phantom head | 100 EGP/hour |
| Rental deposit | 50% of total booking amount |

**Example:** A two-hour dental chair reservation costs 300 EGP. The deposit is 150 EGP, leaving 150 EGP remaining.

Important implementation rules:
- Availability, pricing, station occupancy, and reservation integrity must be validated by the backend.
- The backend must recheck availability when a reservation is confirmed to prevent double booking.
- A reservation must not be marked confirmed until payment is verified server-side.
- The method for collecting the remaining rental balance has not yet been specified.
- The rental deposit rule must not automatically be applied to course registrations.
- Cancellation, refund, and rescheduling policies must not be invented.

---

## Interactive dental planning

Two interactive experiences are part of the intended product direction:

### Phantom-head room selector
The real room blueprint is the source of truth for station placement. The interface should preserve its proportions and map each selectable station to a stable resource ID. A 3D room view may be added later if it accurately represents the facility and maps to the same resources.

### Optional tooth selector
An interactive dental arch/typodont may allow clients to hover over and select individual teeth, preferably using FDI numbering. Multiple teeth can be selected, and selected teeth remain highlighted. Tooth selection is optional practical-work information, separate from station selection and booking availability. It must not be treated as diagnosis or clinical advice.

---

## Design direction

DentalWeb follows an architectural, premium, calm, precise, human, and editorial visual direction.

The design system uses:
- Porcelain and warm off-white surfaces.
- Graphite typography and dark environments.
- Mineral teal as the main action color.
- Sage and warm stone as supporting tones.
- Restrained clay accents.
- Manrope for display typography and Inter for interface/body typography.

The website should not look like a sequence of generic cards or disconnected boxes. Page layouts, backgrounds, section transitions, typography, and motion should have a clear purpose. Some experiences belong on dedicated pages rather than being compressed into the homepage.

3D is used where it improves discovery, understanding, or selection. Booking forms, calendars, payment, account pages, and management interfaces should remain fast, accessible, and easy to use.

Final Blender models are still being created. The implementation should use clearly identified placeholders and replaceable GLB/GLTF assets without coupling model meshes to business logic.

See:
- [Creative Direction & Design System](docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md)
- [High-Fidelity Visual Design Specification](docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md)
- [Software Requirements & Product Specification](docs/SOFTWARE_REQUIREMENTS_AND_PRODUCT_SPEC.md)

---

## Technology

The repository currently contains a **Next.js** application. Check the package manifest and source code for the exact installed versions, libraries, backend integrations, and available scripts before making implementation or deployment assumptions.

The design documentation recommends the following technologies for relevant parts of the experience, subject to compatibility with the existing codebase:

- Next.js and TypeScript for the web application.
- React Three Fiber / Three.js and Drei for interactive 3D.
- GSAP ScrollTrigger for selected scroll-driven storytelling.
- Framer Motion for interface transitions.
- Tailwind CSS and CSS variables for shared design tokens.
- Blender with optimized GLB/GLTF exports for 3D assets.

Do not assume every recommended library is already installed.

---

## Getting started

Install dependencies using the package manager and lockfile already present in the repository.

For an npm-based setup:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Check `package.json` for the exact available scripts. If the repository uses pnpm, yarn, or bun, use the corresponding package manager and lockfile rather than mixing package managers.

## Configuration

Before running integrations, inspect the application's environment variable example files and configuration modules.

- Do not commit secrets, API keys, database credentials, or payment credentials.
- Keep server-only secrets on the server.
- Document required environment variables in an example file with placeholder values only.
- Do not assume a database, payment provider, or external service is configured unless the code and deployment configuration confirm it.

---

## Documentation

| Document | Purpose |
|---|---|
| [Software Requirements & Product Specification](docs/SOFTWARE_REQUIREMENTS_AND_PRODUCT_SPEC.md) | Product scope, roles, workflows, business rules, data requirements, security, and open decisions |
| [Creative Direction & Design System](docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md) | Brand identity, visual language, motion, and design principles |
| [High-Fidelity Visual Design Specification](docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md) | Page compositions, responsive behavior, room selector, 3D standards, and implementation milestones |

## Important product decisions still to confirm

- How the remaining rental balance is collected.
- Rental cancellation, refund, and rescheduling policy.
- Whether facilities can require manual booking approval.
- Course-specific payment/deposit, cancellation, refund, and attendance rules.
- Whether course capacity applies to the entire course or individual sessions.
- Whether tooth selection or other practical-work details are required by any facility.

Until these decisions are confirmed, keep the related behavior configurable and do not invent policies.

---

## Contribution and implementation guidance

Before adding a feature:
1. Inspect the current routes, components, data model, authentication, and integrations.
2. Read the relevant product and design documentation.
3. Reuse existing entities and services instead of creating duplicate systems.
4. Keep backend validation authoritative for bookings, availability, capacity, pricing, and payment.
5. Test responsive layouts, keyboard interaction, permissions, and failure/empty states.
6. Update the documentation when product behavior or business rules change.

**North star:** Make the space memorable, make the equipment tangible, and make learning and reservations straightforward.
