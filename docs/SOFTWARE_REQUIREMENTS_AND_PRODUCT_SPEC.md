# DentalWeb — Software Requirements & Product Specification

Version: 2.0  
Date: 10 November 2026  
Status: Product requirements baseline for implementation  
Repository: `BasantAwad/DentalWeb`

## 1. Product overview

DentalWeb is a platform connecting dental students and dental professionals with facilities that provide practical training spaces, equipment rental, and educational courses. It also gives participating facilities tools to present their services, manage resources, coordinate reservations, and manage course registrations.

**Product promise:** Find a place to practice, reserve the equipment you need, and discover courses that help you understand dentistry and develop practical skills.

DentalWeb has three core offerings:
1. Dental chair rental.
2. Phantom-head training station rental.
3. Dental courses and practical training.

The product includes public discovery pages, client accounts, booking and enrollment journeys, and facility-owner management experiences.

This document describes intended product behavior. It does not claim that every feature is already implemented. Implementation status must be verified against the codebase.

## 2. Goals and scope

### 2.1 Goals
- Make it easy to discover dental training facilities and compare their offerings.
- Allow clients to reserve dental chairs and phantom-head stations for available time slots.
- Allow users to select a specific phantom-head station using an accurate room plan.
- Provide optional interactive tooth selection for describing intended practical work.
- Help students discover and register for theoretical and practical dental courses.
- Give clients a personal account containing their profile, reservation history, and course enrollments.
- Give facility owners tools to manage their facilities, resources, bookings, and courses.
- Provide a distinctive, accessible, responsive, high-quality web experience.

### 2.2 Out of scope unless separately approved
- A full learning management system with lessons, video hosting, quizzes, assignments, and grading.
- Clinical diagnosis, treatment recommendations, or replacement of professional supervision.
- Automatic clinical workflow decisions based on tooth selection.
- Unspecified cancellation, refund, rescheduling, or remaining-balance collection policies.
- Fabricated facilities, instructors, reviews, availability, or payment confirmations.

## 3. User roles

### 3.1 Visitor
- Browse public pages, facilities, services, and published courses.
- View facility and course details.
- Register or sign in to make bookings or enroll where authentication is required.

### 3.2 Client / student
- Manage their own profile.
- Browse and reserve services.
- Select a phantom-head station when applicable.
- Optionally identify teeth relevant to a planned practical session.
- View their reservations, payment statuses, and booking history.
- Discover courses and manage their own enrollments.
- View upcoming sessions and relevant booking details.

### 3.3 Facility owner / manager
- Manage only facilities they are authorized to manage.
- Configure facility information, rooms, resources, services, rates, and operating hours.
- Review and manage reservations for their facilities.
- Create and manage courses, schedules, instructors, capacity, and registrations.
- View only the client information needed to fulfil a reservation or course enrollment.

### 3.4 Platform administrator
Administrative capabilities may include account, facility, content, and platform oversight. Exact permissions and workflows should follow the existing authorization architecture and be explicitly defined before implementation.

A user may have more than one role if supported by the authentication and authorization model. Role switching must not require duplicate accounts.

## 4. Core service requirements

### 4.1 Dental chair rental
- Current confirmed rate: **150 EGP per hour**.
- Client selects a facility, service, date, available start time, and duration.
- Availability and valid durations are determined by the backend.
- The client reviews the price and deposit before payment.
- The interface must clearly show facility, date, time, duration, hourly rate, total, deposit, and any tracked balance.

### 4.2 Phantom-head training
- Current confirmed rate: **100 EGP per hour**.
- Client selects a facility, date, time, duration, and a specific bookable station when station selection is configured.
- Each station has a stable resource identifier independent of its visual mesh or blueprint position.
- Station states include available, selected, reserved/unavailable, and maintenance where supported.
- A reserved or unavailable station cannot be selected.
- The backend must revalidate station availability at reservation confirmation to prevent double booking.

### 4.3 Dental courses and practical training
Courses are a third core service, distinct from hourly equipment rental.

Facilities may offer educational courses that help dental students:
- Understand academic subjects and dental concepts.
- Strengthen theoretical knowledge.
- Learn demonstrations and practical techniques.
- Develop practical skills through supervised sessions where offered.

Course content and format are defined by each facility. A course may include theory, demonstrations, practical training, or a combination.

Course discovery:
- Browse published courses.
- Search by title, topic, or instructor.
- Filter by subject/specialty, academic level, training type, facility/location, and date where data exists.
- See registration status and available capacity.
- View course details and schedule.

Course detail:
- Title, description, cover media, subject/specialty, academic level, training type.
- Learning objectives and topics.
- Instructor information when provided.
- Organizing facility.
- Theoretical/practical components.
- Required materials/equipment when provided.
- Schedule, sessions, duration, location, capacity, price, and registration dates.
- Registration CTA and current status.

Course registration:
- Prevent duplicate active enrollment for the same client and course unless the business rules explicitly allow it.
- Enforce capacity and registration windows on the backend.
- Handle full, closed, unpublished, and cancelled courses.
- Support multiple sessions per course.
- Course payment policy is configurable and must not automatically inherit the rental deposit policy.
- Do not invent refund, cancellation, or attendance rules.

Course owner management:
- Create, edit, publish, unpublish, archive, or cancel courses according to permissions.
- Manage instructors, course content, sessions, price, capacity, registration windows, and enrollment lists.
- View payment status only where payment integration supports it.

Student course area:
- View upcoming, ongoing, completed, and cancelled/withdrawn enrollments when those statuses exist.
- View course details, session schedules, location, registration status, and payment status where applicable.

A full LMS is not part of the current scope.

## 5. Pricing, deposits, and payments

Confirmed rental business rules:
- Dental chair: 150 EGP/hour.
- Phantom head: 100 EGP/hour.
- Rental deposit: 50% of the total booking amount.

Example:
- Dental chair for 2 hours: 2 × 150 = 300 EGP total.
- Deposit due: 150 EGP.
- Remaining amount: 150 EGP.

Requirements:
- Calculate prices using trusted backend configuration and validation.
- Display the exact amount due before payment.
- Booking is not confirmed until the payment provider result is verified server-side.
- Do not trust client-side payment success callbacks as proof of payment.
- Do not assume how the remaining balance is collected; that policy remains unspecified.
- Do not apply the 50% rental deposit rule to courses unless a separate course policy is configured.
- Payment credentials and secrets must never be exposed to the browser.

## 6. Booking workflow

1. Choose a facility.
2. Choose a service.
3. For phantom-head rental, select a station if required by that facility.
4. Select a date.
5. Load current availability from the backend.
6. Select an available start time and duration.
7. Optionally provide additional practical-work information if the facility enables it.
8. Review the reservation details and price.
9. Pay the required rental deposit.
10. Confirm only after server-side payment verification.
11. Show the reservation in the client's account and the facility owner's booking management area.

The server must revalidate availability, pricing, station occupancy, and booking constraints at the final reservation step. Use database transactions/constraints or equivalent concurrency controls to prevent overlapping reservations and double booking.

The exact cancellation, rescheduling, refund, and balance-collection policies are not yet specified and must not be invented.

## 7. Interactive room and station selector

The room blueprint supplied to the project is the source of truth for station placement and room proportions.

Requirements:
- Preserve blueprint aspect ratio and geometry; do not stretch or invent room layout.
- Map each visible station to a stable backend resource ID.
- Hover/focus highlights the corresponding station and reveals its label and status.
- Selecting an available station creates a persistent selected state.
- Selected state remains after pointer leaves.
- Selecting a reserved/maintenance station is prevented and the reason/status is communicated.
- Provide a synchronized accessible station list.
- Support touch, zoom, pan, reset, and mobile-friendly selection.
- An optional 3D room view may be added when an accurate model exists, but it must map to the same resource IDs and never replace the accurate 2D blueprint.

Visual states must not rely on color alone; combine labels, icons, outlines, and accessible text.

## 8. Optional tooth selection / practical-work details

Provide an optional interactive dental arch/typodont interface when the relevant booking or facility workflow enables it.

Requirements:
- Each tooth is independently addressable with a stable tooth ID.
- Prefer FDI tooth numbering and make the numbering system clear.
- Hover/focus highlights one tooth and displays its number.
- Clicking toggles selection.
- Multiple teeth may be selected.
- Selected teeth remain highlighted after pointer leaves.
- Display selected tooth numbers in a contextual panel.
- Tooth selection state is separate from station selection and booking availability.
- Use individual 3D tooth meshes when available; otherwise use a genuinely individually interactive SVG or procedural representation.
- Do not make tooth selection mandatory for ordinary equipment rental unless a confirmed business requirement says otherwise.
- This feature records user-provided planning information; it must not be presented as diagnosis or clinical advice.

Other optional practical-work fields, such as whether an assistant or another dentist is needed, may be introduced only after the facility workflow and data requirements are confirmed.

## 9. Client account and profile

Suggested routes (adapt to the existing router):
- `/account` — client dashboard.
- `/account/profile` — personal profile.
- `/account/bookings` — reservation history and management.
- `/account/courses` — course enrollments.
- `/account/settings` — preferences and account security.

Profile information:
- Full name.
- Email.
- Phone number.
- Profile image (optional).
- City/general location (optional).
- Date of birth (optional, only if justified).
- Account creation date.
- Optional dental education details: university/institution, academic level, professional status (student/graduate/dentist/other), and areas of interest.

Collect only information necessary for the product. Optional profile fields must remain optional unless a specific service requires them. Sensitive clinical or personal data should not be collected without a clear need and appropriate safeguards.

Client dashboard:
- Welcome/profile summary.
- Real counts of total, upcoming, completed reservations and active course enrollments.
- Upcoming reservations and course sessions.
- Links to explore facilities, services, and courses.
- Useful empty, loading, and error states.

Reservation history:
- Booking reference.
- Facility and location.
- Service type.
- Station identifier when applicable.
- Date, start/end time, and duration.
- Hourly rate, total, deposit, amount paid, and remaining balance only where the system actually tracks it.
- Payment and reservation status.
- Booking creation date.
- Detail view and supported actions.

Course history:
- Course, facility, instructor when provided.
- Schedule and location.
- Registration date.
- Enrollment and payment status where supported.
- Upcoming/ongoing/completed/cancelled groupings based on actual states.

A unified activity timeline may show actual recorded events such as booking creation, payment verification, booking completion, and course enrollment. Do not fabricate historical events.

Account security:
- Clients can only read/update their own profile and access their own bookings/enrollments.
- Backend authorization must derive identity from the authenticated session/token, not trust a user ID supplied by the browser.
- Password and email changes must use the existing authentication provider's secure workflows.
- Validate profile image type and size.
- Never expose password hashes, tokens, secrets, or payment credentials.

## 10. Facility owner experience

Provide owner-facing management pages for:
- Facility profile and media.
- Rooms and resource/station inventory.
- Service configuration and pricing.
- Operating hours and availability.
- Reservation calendar/list and reservation details.
- Courses, instructors, schedules, capacity, and enrollments.
- Relevant client contact details for the owner's own facility bookings/enrollments.

Owners must only access facilities and records they are authorized to manage. Do not expose a client's unrelated booking history, full profile, or account settings.

## 11. Public page and route architecture

Suggested routes; adapt to the existing routing conventions:
- `/` — homepage and product introduction.
- `/services/dental-chair` — dedicated chair rental page.
- `/services/phantom-head` — dedicated phantom-head page.
- `/facilities` — facility discovery.
- `/facilities/[slug]` — facility profile.
- `/courses` — course discovery.
- `/courses/[slug]` — course details and registration.
- `/booking/...` — booking journey.
- `/account/*` — client account.
- Owner dashboard routes — facility management.

Homepage introduces the three pillars: chair rental, phantom-head training, and courses. It should link to dedicated service/discovery pages rather than attempting to contain every workflow.

Facility profiles should show a Courses area only when the facility offers published courses.

## 12. Visual and interaction requirements

The visual direction is defined in:
- `docs/CREATIVE_DIRECTION_AND_DESIGN_SYSTEM.md`
- `docs/HIGH_FIDELITY_VISUAL_DESIGN_SPEC.md`

Core direction:
- Architectural, premium, calm, precise, human, modern, tactile, editorial.
- Warm porcelain, white, graphite, mineral teal, sage, warm stone, restrained clay accents.
- Manrope display typography and Inter interface/body typography.
- Meaningful page-specific composition, backgrounds, section transitions, and layouts.
- Avoid repetitive generic cards, harsh disconnected boxes, excessive glassmorphism, generic SaaS templates, and decorative 3D without purpose.

The homepage is a coherent visual story. Service pages, facility discovery, course discovery, booking, and account pages have their own information architecture and layout.

Use 3D where it improves discovery, understanding, or selection. Keep forms, calendars, payment, tables, and management pages fast and accessible. All interactive controls need default, hover, focus, selected, disabled, loading, and error states as applicable.

Respect reduced motion and provide static fallbacks for missing models, failed WebGL, and lower-powered devices.

## 13. 3D asset strategy

Final 3D models are still being created. Implementation must proceed without waiting for all models.

- Use clearly labelled temporary placeholders, procedural geometry, SVGs, or static renders where needed.
- Do not represent placeholders as final assets.
- Create reusable scene components and a centralized asset registry.
- Make model replacement possible without rewriting page or business logic.
- Use semantic node names and explicit mapping to backend IDs; never rely on fragile mesh indices.
- Preserve scale, orientation, proportions, and material intent.
- Prefer optimized GLB/GLTF, compressed geometry/textures, lazy loading, and static poster fallbacks.
- Document Blender export, scale, orientation, naming, materials, compression, and integration in `ASSET_GUIDE.md`.

## 14. Non-functional requirements

### Performance
- Lazy-load 3D scenes and large media.
- Avoid multiple heavy canvases on one page.
- Pause rendering when offscreen where practical.
- Provide mobile quality tiers and poster fallbacks.
- Measure Core Web Vitals and test representative devices.

### Accessibility
- Keyboard and touch operation for all essential actions.
- Semantic landmarks and headings.
- Visible focus states.
- Accessible labels and status text.
- Sufficient contrast (target WCAG 2.2 AA).
- Reduced-motion support.
- No essential action available only through 3D or color.

### Security and privacy
- Server-side authorization for every private operation.
- Validate and sanitize user input.
- Protect authentication and payment secrets.
- Restrict owner access by facility relationship.
- Minimize personal data collection and exposure.
- Use secure upload validation and storage.

### Reliability and consistency
- Backend is authoritative for availability, capacity, pricing, reservation states, and payment verification.
- Enforce concurrency constraints for station reservations and course seats.
- Use clear error/recovery states.
- Never display mock availability as real availability.

## 15. Conceptual data model

Adapt to existing entities and avoid duplication.

Potential entities:
- User / Account.
- ClientProfile (only if separate profile data is justified).
- Facility.
- FacilityMembership or OwnerFacility relationship.
- Service.
- Room.
- Resource/Station.
- OperatingHours / Availability.
- Booking / Reservation.
- Payment / PaymentAttempt.
- Course.
- Instructor.
- CourseSession.
- CourseEnrollment.
- ActivityEvent (optional, for real audit/activity history).

Potential relationships:
- A facility offers one or more services.
- A facility contains rooms and bookable resources.
- A phantom-head station is a bookable resource with stable identity.
- A booking belongs to a client, facility, service, and optionally a specific resource.
- A facility may publish multiple courses.
- A course may have one or more instructors and multiple sessions.
- A course enrollment links a client to a course.
- A client owns their profile, bookings, and enrollments.
- Owners are associated with facilities through explicit authorization relationships.

Use transactions, unique constraints, indexes, and foreign keys appropriate to the actual database.

## 16. Suggested implementation milestones

1. Audit repository, current routes, backend, authentication, database, and existing docs.
2. Establish design tokens, navigation, shared page shell, and responsive primitives.
3. Redesign homepage and implement placeholder-ready 3D architecture.
4. Build dedicated chair and phantom-head service pages.
5. Build facility discovery and facility profiles.
6. Implement blueprint station selector and optional tooth selection.
7. Implement booking workflow with server-side availability, pricing, and payment verification.
8. Build course discovery, course detail, registration, and enrollment management.
9. Build client profile, dashboard, reservation history, and course history.
10. Build facility-owner management for facilities, resources, reservations, and courses.
11. Test permissions, concurrency, payments, accessibility, mobile behavior, and 3D fallbacks.

Prioritize working end-to-end flows over decorative screens. Do not attempt to build every route in one uncontrolled pass.

## 17. Open business decisions

The following are not confirmed and must remain configurable or be clarified:
- How the remaining rental balance is collected.
- Rental cancellation, refund, and rescheduling policy.
- Whether any facilities require manual reservation approval.
- Course-specific payment/deposit rules.
- Course cancellation, refund, attendance, and certificate policies.
- Whether course capacity applies to the course as a whole or individual sessions.
- Whether practical-work details (selected teeth, assistant/doctor request) are required by any facility.
- Which client profile fields are mandatory for specific workflows.

## 18. Acceptance criteria

The product requirements are satisfied when:
- DentalWeb clearly offers three core services.
- Clients can discover facilities and courses.
- Chair and phantom-head reservations use backend availability and confirmed rates.
- Phantom-head stations can be selected and their availability is accurate.
- Optional tooth selection supports independent hover and multi-selection.
- Rental deposit is calculated as 50% of total.
- Booking confirmation depends on server-side payment verification.
- Courses support discovery, detail, schedules, capacity, enrollment, and owner management.
- Clients have a profile, dashboard, reservation history, and course enrollment history.
- Facility owners can manage only their own facilities and related records.
- The experience is responsive, accessible, and resilient when 3D assets are missing.
- No unspecified business policy is invented.
- Documentation and README distinguish planned requirements from verified implemented functionality.

**Product north star:** DentalWeb helps dental students find places to practice, equipment to train with, and courses that help them learn and improve.
