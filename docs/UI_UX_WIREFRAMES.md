# DentalWeb — UI/UX Wireframe & Interaction Specification

Version: 1.0  
Date: 10 November 2026  
Companion: [SOFTWARE_SPECIFICATION.md](./SOFTWARE_SPECIFICATION.md)

Purpose: page-by-page layout, hierarchy, components, interactions, responsive behavior, and states for the implementation agent. These are structural wireframes, not final pixel-perfect designs. The supplied dummy-head room blueprint is the source of truth for the station selector. Preserve its geometry and station placement.

---

## 1. Experience principles

DentalWeb should feel like a premium dental training and facility-booking platform: professional, calm, precise, clean, and technology-forward. Avoid generic booking templates, generic admin dashboards, childish dental graphics, excessive medical-blue styling, and decorative 3D that does not help users complete a task.

1. Visual discovery: customers understand a facility through photography, services, and actual equipment.
2. Booking clarity: availability, price, duration, selected resource, and status are always explicit.
3. Progressive detail: show the room plan and tooth selector only when relevant to the selected service.
4. Visual confidence: selected resources and teeth remain visibly selected and summarized.
5. Operational truth: backend data determines availability; frontend states never guarantee a booking.
6. Fallbacks: every essential 3D interaction has an accessible 2D/list alternative.
7. Mobile-first booking; desktop-first operational management.
8. Distinct page compositions with shared design tokens and reusable components.

Primary journeys:
- Discover a facility → inspect services → book a resource.
- Choose date/time → select a phantom head → review → submit.
- Book a dental chair → optionally declare teeth/work/support needs → submit.
- Facility receives request → reviews → accepts/rejects → calendar updates.
- Owner adds a resource → maps it to the room plan → publishes it.

## 2. Visual direction and design tokens

Suggested starting tokens; adjust after inspecting any existing brand assets and repository styles.

| Token | Suggested value | Usage |
|---|---|---|
| Page background | #F7F8FA | Main light surfaces |
| Surface | #FFFFFF | Cards and panels |
| Primary ink | #17212B | Main text |
| Secondary ink | #667085 | Supporting text |
| Primary accent | #5146D8 | Main actions and selection |
| Accent soft | #EEECFF | Selected backgrounds |
| Success | #16845B | Available/confirmed |
| Warning | #B7791F | Pending/limited |
| Danger | #C83C45 | Reserved/unavailable/error |
| Border | #E5E7EB | Dividers and outlines |
| Dark surface | #111827 | Optional 3D showcase |

Color must never be the only status indicator. Pair it with labels, icons, patterns, or text.

Typography:
- Use one highly legible sans-serif family with multiple weights.
- Page titles: 30–40px desktop, 25–30px mobile.
- Section headings: 20–24px desktop, 18–20px mobile.
- Body: 14–16px; helper text: 12–13px.
- Avoid tiny text inside calendar cells and room markers.

Shape and spacing:
- Consistent 8px spacing scale.
- Cards: 12–16px radius; inputs/buttons: 10–12px.
- Subtle shadows only to establish hierarchy.
- Motion communicates selection, panel reveal, calendar navigation, and loading; avoid constant decorative movement.
- Respect reduced-motion preferences.

Shared components:
- AppHeader, PublicFooter, CustomerSidebar, FacilitySidebar, AdminSidebar
- PageContainer, PageHeading, SectionHeading, Breadcrumbs
- FacilityCard, CourseCard, ResourceCard, PriceDisplay
- StatusBadge, AvailabilityLegend, EmptyState, ErrorState, Skeleton
- DatePicker, TimeSlotGrid, DurationSelector
- BookingSummary, BookingStepper, ConfirmationPanel
- ResourcePlanViewer, ResourceList, ResourceDetailsPanel
- DentalModelViewer, ToothChart2D, SelectedToothList
- DataTable, FilterBar, ConfirmDialog, Toast

## 3. Global application shells

### 3.1 Public shell

Desktop:
~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ DENTALWEB     Explore   Courses   For Facilities      Sign in  Join │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         PAGE CONTENT                                 │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ About   How it works   Contact   Terms   Privacy     Social links     │
└──────────────────────────────────────────────────────────────────────┘
~~~

Mobile:
~~~text
┌─────────────────────────────────┐
│ DENTALWEB                 [☰]   │
├─────────────────────────────────┤
│          PAGE CONTENT           │
└─────────────────────────────────┘
~~~

Header is compact and consistent. The primary CTA changes by auth state: Join / My bookings. Facility-owner CTA remains visible but secondary. Mobile menu opens in a drawer.

### 3.2 Customer shell
Desktop: compact top bar with logo, page title/breadcrumb, notifications, and profile menu; account pages may use a left sidebar.

Sidebar:
- Overview
- My bookings
- My courses
- Notifications
- Profile
- Sign out

Mobile: bottom navigation for Overview, Bookings, Courses, Profile; secondary actions live inside page menus.

### 3.3 Facility management shell

~~~text
┌──────────────────┬───────────────────────────────────────────────────┐
│ LOGO             │ Facility selector       Search   Help   Profile   │
├──────────────────┼───────────────────────────────────────────────────┤
│ Overview         │                                                   │
│ Bookings         │                 MAIN WORKSPACE                    │
│ Calendar         │                                                   │
│ Resources        │                                                   │
│ Room layouts     │                                                   │
│ Staff            │                                                   │
│ Courses          │                                                   │
│ Public profile   │                                                   │
│ Reports          │                                                   │
│ Settings         │                                                   │
└──────────────────┴───────────────────────────────────────────────────┘
~~~

Sidebar 240–260px on desktop. Support multiple facilities/branches if enabled. On mobile, sidebar becomes a drawer and primary actions remain reachable.

## 4. Public pages

### 4.1 Home — /

Purpose: explain the platform quickly and direct users to facilities or courses.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER                                                               │
├──────────────────────────────────────────────────────────────────────┤
│ Find the right space to practice.       [Large facility photograph] │
│ Book dental training resources                                      │
│ without the back-and-forth.                                          │
│                                                                      │
│ [Area____________] [Resource type ▼] [Search facilities →]           │
├──────────────────────────────────────────────────────────────────────┤
│ Browse by need: [Phantom heads] [Dental chairs] [Rooms] [Courses]    │
├──────────────────────────────────────────────────────────────────────┤
│ Featured facilities                              [View all →]       │
│ [Facility card] [Facility card] [Facility card]                      │
├──────────────────────────────────────────────────────────────────────┤
│ How it works:  01 Discover  →  02 Choose  →  03 Book                  │
├──────────────────────────────────────────────────────────────────────┤
│ Upcoming courses                              [Explore courses →]   │
│ [Course card] [Course card] [Course card]                            │
├──────────────────────────────────────────────────────────────────────┤
│ Own a dental training facility?       [List your facility →]        │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                               │
└──────────────────────────────────────────────────────────────────────┘
~~~

Behavior:
- Hero search navigates to /explore with query parameters.
- Category tiles are shortcuts into the same catalogue.
- Facility cards show image, name, area, resource categories, and starting price only when known.
- Course cards show date, instructor, facility, price, and remaining seats only when accurate.
- Owner CTA explains listing, inventory, booking calendar, and management tools.
- Never fabricate ratings, testimonials, verification, or availability.

Mobile: stack hero content, use vertical search fields, horizontally scrollable category tiles, and single-column facility cards. Use skeletons while loading and useful retry states on error.

### 4.2 Explore facilities — /explore

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ Explore facilities                                                   │
│ [Search name, area, service________________________] [Search]        │
│ [Resource type ▼] [Date ▼] [Price ▼] [Assistance ▼] [More filters]  │
│ 24 facilities found                         [Sort: Recommended ▼]    │
│ ┌────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ Facility photo                 │ │ Facility photo                │ │
│ │ Facility name                  │ │ Facility name                 │ │
│ │ Area · resource types          │ │ Area · resource types         │ │
│ │ Services / short description   │ │ Services / short description  │ │
│ │ Starting price                 │ │ Starting price                │ │
│ │ [View facility]                │ │ [View facility]               │ │
│ └────────────────────────────────┘ └───────────────────────────────┘ │
│ [More facility cards]                                                │
│                         [Pagination / Load more]                     │
└──────────────────────────────────────────────────────────────────────┘
~~~

Filters: name/area/service, resource type, date/time availability, price with explicit pricing unit, assistance, courses, language, accessibility, resource features. Active filters appear as removable chips. Filters are reflected in URL query parameters for sharing and browser navigation. Date-based filtering must use real availability responses.

Mobile: search full width; filters open a bottom sheet with Apply/Clear; cards are single-column.

### 4.3 Facility profile — /facilities/[slug]

This is the primary marketing page. It must build trust and explain what can be booked before starting the booking flow.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ Explore / Area / Facility name                                       │
│                                                                      │
│ Facility name                                      [Book a resource] │
│ Area, city · Short factual introduction                              │
│                                                                      │
│ ┌───────────────────────────────┬──────────────────────────────────┐ │
│ │                               │ Secondary photo                   │ │
│ │          MAIN GALLERY         ├──────────────────────────────────┤ │
│ │                               │ Secondary photo                   │ │
│ └───────────────────────────────┴──────────────────────────────────┘ │
│ About | Resources | Courses | Location | Policies                   │
│ ┌────────────────────────────────────────────┐ ┌───────────────────┐│
│ │ ABOUT THIS FACILITY                        │ │ BOOKING CARD      ││
│ │ Description / amenities                    │ │ Choose service ▼  ││
│ │                                            │ │ Resource type ▼   ││
│ │ RESOURCES                                  │ │ From price        ││
│ │ [Resource card] [Resource card]            │ │ [Check dates]     ││
│ │                                            │ │ Policies summary  ││
│ │ COURSES                                    │ └───────────────────┘│
│ │ [Course card]                              │                      │
│ │ LOCATION: address + map preview           │                      │
│ │ POLICIES & FAQ                             │                      │
│ └────────────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
~~~

Content order:
1. Breadcrumb.
2. Facility name, location, concise description, primary CTA.
3. Photo gallery.
4. Optional sticky section navigation.
5. About and amenities.
6. Bookable resources and services.
7. Courses/workshops.
8. Location/contact.
9. Booking/cancellation policies and FAQs.

Booking card:
- Service/resource selector and indicative starting price.
- CTA leads to booking with facility context preselected.
- Do not imply that a date/resource is reserved yet.
- On mobile, replace the side card with a sticky bottom CTA such as “Choose a resource”.

Resource cards show photo/model thumbnail, name/type, features, pricing unit, duration rules, and whether a specific station can be selected later. Clearly distinguish a resource category from an individually guaranteed station.

Mobile: swipeable gallery, facility identity and CTA near the top, horizontal section navigation or accordions, sticky CTA that does not cover form controls.

### 4.4 Resource catalogue — /facilities/[slug]/resources
- Heading and filters for type, price, and date availability.
- Resource cards show image, name/type, features, pricing unit, availability date filter, View details, and Book.
- State whether the resource is individually selectable on a room plan.
- Explain inclusions/exclusions.

### 4.5 Course discovery — /courses
- Search by course/topic/instructor/facility.
- Filters: date, level, category, area, price.
- Cards: title, instructor, facility, date, duration, level, price, capacity/availability.
- Enrollment CTA and useful empty state.

### 4.6 Course details — /courses/[id]
- Hero: title, instructor, facility, date, level, price, seats.
- Main column: overview, syllabus, outcomes, prerequisites, instructor profile.
- Side enrollment card: date/time, location, price, seats, enroll CTA.
- Policies and cancellation information.
- Mobile: sticky bottom enrollment CTA.
- Enrollment capacity is revalidated on backend.

### 4.7 Authentication
Sign in: narrow centered panel, logo, email, password, show/hide, forgot password, submit, registration link, clear errors, secure return-to-booking redirect.

Sign up: name, email, password, role/profile type only if it changes onboarding, terms/privacy consent, email verification state. Do not request professional documents unless a real workflow requires them.

## 5. Customer account pages

### 5.1 Overview — /account

~~~text
┌──────────────────┬───────────────────────────────────────────────────┐
│ CUSTOMER MENU    │ Good morning, [First name]                         │
│ Overview         │                                                   │
│ My bookings      │ [Upcoming] [Pending] [Completed]                  │
│ My courses       │                                                   │
│ Notifications    │ NEXT BOOKING                                      │
│ Profile          │ Facility · Resource · Date/time · Status          │
│                  │ [View booking]                                    │
│                  │ RECENT ACTIVITY                                   │
│                  │ [Booking row] [Course row]                        │
└──────────────────┴───────────────────────────────────────────────────┘
~~~

Prioritize the next booking; counts are secondary. Empty state: “No bookings yet” with Explore facilities CTA. Pending and confirmed are distinct.

### 5.2 My bookings — /account/bookings
- Filters/tabs: Upcoming, Pending, Past, Cancelled.
- Desktop table/list; mobile stacked cards.
- Each item: facility, resource, date/time, reference, status, price if applicable.
- Actions depend on policy: view, cancel, request reschedule.
- If cancellation cutoff passed, hide the action and explain why.

### 5.3 Booking detail — /account/bookings/[id]

~~~text
Booking #DW-000123                         [CONFIRMED]
Facility name · Address
Date: Friday, 20 Nov · 10:00–12:00
Resource: Phantom Head PH-04
Price breakdown

[Room layout thumbnail with PH-04 highlighted]

Work details (if provided)
Selected teeth: 11, 12, 21
Assistant: Not requested
Facility dentist: Not requested

Booking policy
[Cancel booking] [Request reschedule]
~~~

Show the exact booked resource, human-readable tooth selections, and staff assignments only when authorized and assigned. Never expose internal facility notes.

### 5.4 Profile and notifications
Profile: personal information, preferred contact, professional role/institution if relevant, account security, sign out. Keep fields minimal.

Notifications: read/unread filter, booking/course events with deep links, mark read/all read, channel preferences only for supported channels.

## 6. Booking experience — /facilities/[slug]/book

This is the core product interaction. It should feel guided and premium without becoming a long form. Only show steps relevant to the selected service.

Stepper:
1. Service & resource type.
2. Date, time & duration.
3. Specific station (if enabled).
4. Work details (if applicable).
5. Review & submit.

Desktop layout:
~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ Facility name       Booking                         Help / Back      │
├──────────────────────────────────────────────────────────────────────┤
│ ① Service ── ② Schedule ── ③ Station ── ④ Details ── ⑤ Review       │
│ ┌───────────────────────────────────────────┐ ┌────────────────────┐│
│ │ CURRENT STEP                              │ │ BOOKING SUMMARY    ││
│ │ Step-specific content                    │ │ Facility           ││
│ │                                           │ │ Service            ││
│ │                                           │ │ Date/time          ││
│ │                                           │ │ Resource           ││
│ │                                           │ │ Duration           ││
│ │ [Back]                         [Continue] │ │ Estimated total    ││
│ └───────────────────────────────────────────┘ │ Policy note        ││
│                                               └────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
~~~

### Step 1 — Service/resource type
Heading: “What would you like to book?” Show service cards with description, duration/pricing unit, and requirements. Filter resources by selected service. Do not ask for a station before date/time if station availability depends on the chosen time.

### Step 2 — Date/time/duration

~~~text
Choose a date
[< November 2026 >]
[Calendar: available / partial / full / closed days]

Available times
[09:00] [10:00] [11:00]
[12:00] [13:00] [14:00]

Duration [1 hour ▼]
Estimated price: EGP xxx
~~~

Calendar states: available, partially available, fully booked, closed, selected. Time slots reflect service, duration, eligible resources, hours, buffers, and staff requirements. Selecting a slot refreshes availability. If no slots exist, suggest another date/duration. Show facility timezone where ambiguity is possible. On conflict at submission, preserve choices and ask the customer to choose another slot.

### Step 3 — Specific station
Show the interactive room plan only if a published layout exists and the service supports individual selection. Show legend, selected date/time, zoom, reset, and accessible resource list. Selecting a station opens its detail panel and updates the booking summary. If no layout exists, show a resource list; never block booking.

### Step 4 — Work details
Only show for relevant services. Ask whether the customer wants to tell the facility what they plan to work on. Provide optional 3D model/2D chart, selected-tooth list, facility-configured declared work category, short optional note, assistant request, and facility dentist request where offered. Warn not to enter patient-identifying information. Explain staff requests are not guaranteed until confirmed. Allow Skip when permitted.

### Step 5 — Review and submit
Show facility, service, date/time, duration, exact station, work details, selected teeth, staff requests, price breakdown, payment/deposit status if implemented, and cancellation policy. Use a policy acknowledgement only when meaningful. CTA depends on approval mode: “Request booking” for manual approval; “Confirm booking” for automatic confirmation.

### Confirmation
Show distinct Pending request or Confirmed reservation. Include reference, facility/resource/date/time, View booking, Add to calendar, and Explore more. Pending state explains facility approval and notifications. Never show confirmed until API returns confirmed.

### Mobile booking
Single-column steps, sticky bottom Back/Continue bar and estimated total, expandable summary, accessible calendar list fallback, full-screen room plan with details bottom sheet. Respect safe areas and do not cover controls.

## 7. Interactive room selector — supplied dummy-head blueprint

### 7.1 Blueprint baseline
The supplied blueprint has 14 phantom-head stations:
- PH-01 through PH-07: upper/top counter.
- PH-08 through PH-10: left wall.
- PH-11 through PH-14: lower/bottom counter.

Other visible room elements include chairs/stools, lamps, central chairs, counters, sinks, and room details. Preserve the existing geometry and station placement. Do not assume every visible chair or stool is bookable.

The IDs above are proposed stable product IDs based on the observed 01–14 labels. Confirm the mapping against the original blueprint before coding SVG hit areas. This document does not define exact coordinates.

### 7.2 Customer selector desktop wireframe

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ Choose your phantom head                          Step 3 of 5        │
│ Fri 20 Nov · 10:00–12:00 · 2 hours                                  │
├──────────────────────────────────────────────────────────────────────┤
│ [Available ●] [Selected ●] [Reserved ●] [Maintenance ●]             │
│ ┌──────────────────────────────────────────────┐ ┌─────────────────┐│
│ │                                              │ │ STATION DETAILS ││
│ │        ORIGINAL ROOM BLUEPRINT               │ │                 ││
│ │        (SVG / interactive view)              │ │ PH-04           ││
│ │                                              │ │ Top counter     ││
│ │      [PH-01] [PH-02] [PH-03]                 │ │ Available       ││
│ │      [PH-04] [PH-05] [PH-06] [PH-07]        │ │ Features        ││
│ │                                              │ │ Price / hour    ││
│ │      [PH-08] [PH-09] [PH-10]                 │ │ [Select PH-04]  ││
│ │                                              │ │                 ││
│ │      [PH-11] [PH-12] [PH-13] [PH-14]        │ │ [Continue]      ││
│ │                                              │ └─────────────────┘│
│ │ [−] [Reset] [+] [Fullscreen]                 │                    │
│ └──────────────────────────────────────────────┘                    │
├──────────────────────────────────────────────────────────────────────┤
│ Can't use the room plan? [Choose from station list]                  │
└──────────────────────────────────────────────────────────────────────┘
~~~

This is a schematic grouping only, not a claim about exact station coordinates or spacing. The actual uploaded blueprint must remain the visual base.

### 7.3 Customer interaction
- Every station is an SVG group or 3D node mapped to a stable resource_id.
- Click/tap opens station details.
- Hover/focus tooltip shows station ID and status.
- Selected station has clear outline, label, and check icon; not color alone.
- Reserved and maintenance stations cannot be selected.
- Unavailable station explains customer-safe reason.
- Details: name, type, room location, included features, price, availability.
- Zoom/pan controls must not block station selection.
- Include Reset and Fullscreen.
- Station list offers identical selection behavior.
- Keep selected date/time visible.
- Revalidate availability before continuing.
- Never reveal another customer's identity or booking purpose.

### 7.4 State system

| State | Visual treatment | Selectable? |
|---|---|---|
| Available | Green/neutral + “Available” | Yes |
| Selected | Accent outline/fill + check + “Selected” | Current choice |
| Reserved | Red/muted + lock + “Reserved” | No |
| Maintenance | Grey/amber + tool icon | No |
| Temporarily held | Amber + “On hold” | No |
| Disabled | Muted + explicit reason | No |

A station's status is relative to the selected time range. A station may be reserved at 10:00 and available at 14:00.

### 7.5 Facility owner layout editor

MVP capabilities:
- Upload/select an SVG or image floor plan.
- Preview at original aspect ratio.
- Add/drag marker, link marker to resource, edit label, remove marker.
- Manage resource active/inactive separately from layout visibility.
- Validate duplicate active markers.
- Preview customer-facing states.
- Save draft and publish a new layout version.
- Existing bookings retain their resource IDs if layout changes.

~~~text
┌──────────────────┬───────────────────────────────────────────────────┐
│ Layout editor    │ Room plan                         [Preview] [Save]│
│ Select room      │                                                   │
│ Upload plan      │              [Interactive plan]                   │
│ Add marker       │                                                   │
│ Resources        │                                                   │
│                  ├───────────────────────────────────────────────────┤
│                  │ Selected marker: PH-04                            │
│                  │ Linked resource [Phantom Head 04 ▼]                │
│                  │ Label [PH-04________] [Remove marker]              │
│                  │ [Save draft] [Publish version]                     │
└──────────────────┴───────────────────────────────────────────────────┘
~~~

### 7.6 SVG implementation requirements
- Preserve the uploaded blueprint as visual source.
- Prefer SVG element IDs/data attributes such as data-resource-id.
- If source SVG is unstructured, use a controlled overlay of transparent hit targets aligned to the source viewBox; document positions.
- Separate visual geometry from availability state.
- Do not edit original path geometry merely to show booking states; use overlay classes/markers.
- Maintain sufficiently large hit areas.
- Preserve aspect ratio and viewBox.
- Test touch pan/zoom/select.
- Generate station list from the same resource data.
- Availability API maps resource IDs to status; never hardcode booking status in SVG.

### 7.7 3D room viewer later
When a facility supplies GLB/GLTF, map selectable node names to resource IDs, highlight selection, use the same API/state model, and retain 2D fallback. 3D is optional; no facility should need a 3D model to publish.

## 8. Interactive dental model / tooth selector

This is a booking step, not a medical product.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ Tell the facility what you plan to work on             Optional      │
├──────────────────────────────────────┬───────────────────────────────┤
│                                      │ SELECTED TEETH                 │
│       3D DENTAL MODEL                │ [11] [12] [21]                 │
│       Rotate / zoom / reset          │                               │
│                                      │ Dentition                      │
│                                      │ (•) Permanent  ( ) Primary     │
│                                      │                               │
│                                      │ Work category [Practice ▼]    │
│                                      │ Need assistant? [Yes] [No]     │
│                                      │ Facility dentist? [Request]   │
├──────────────────────────────────────┴───────────────────────────────┤
│ [Use 2D tooth chart] [Skip]                         [Continue]       │
└──────────────────────────────────────────────────────────────────────┘
~~~

Behavior:
- Each tooth mesh has a stable FDI code.
- Selecting/deselecting immediately updates the selected list.
- List can remove individual selections.
- 2D and 3D modes share the same selection state.
- Support permanent, primary, and mixed dentition where assets/data support it.
- Include “Not sure” / “No specific teeth”.
- Explain this helps facility preparation and is not a diagnosis.
- On model failure, show 2D chart without blocking booking.
- Do not store diagnosis or patient-identifiable information.

Asset requirements:
- GLB/GLTF with individual tooth meshes or reliably named nodes.
- Stable node names mapped to FDI codes.
- Orientation validated by a dentist.
- Optimized geometry/textures for mobile.
- Consistent scale and camera framing.
- Highlight materials tested in light/dark scenes.
- Lazy-load with poster/loading state.
- If teeth are merged, separate them in Blender or preprocess reliably; do not fake tooth-level selection with approximate click regions.

## 9. Facility management pages

### 9.1 Overview — /manage

~~~text
┌──────────────────┬───────────────────────────────────────────────────┐
│ FACILITY MENU    │ Facility: Main Branch ▼       [Create booking +]  │
│ Overview         │ Good morning                                     │
│ Bookings         │ [Today's bookings] [Pending] [Resources in use]   │
│ Calendar         │                                                   │
│ Resources        │ TODAY'S SCHEDULE                                 │
│ Room layouts     │ 09:00  PH-01  Student booking     [Confirmed]     │
│ Staff            │ 10:00  Chair 02 Dentist session   [Pending]       │
│ Courses          │ 12:00  PH-04  Practice session    [Confirmed]     │
│ Profile          │                                                   │
│ Reports          │ NEEDS ATTENTION                                  │
│ Settings         │ [2 booking requests] [1 maintenance item]        │
│                  │ QUICK ACTIONS                                    │
│                  │ [Add resource] [Block time] [Add course]         │
└──────────────────┴───────────────────────────────────────────────────┘
~~~

Default date is facility-local today. Pending requests are prominent. Schedule shows time, resource, status, and only authorized customer details. Metrics derive from real data and have clear date ranges.

### 9.2 Bookings management — /manage/bookings
- Calendar/List toggle; Day/Week/Month.
- Filters: status, resource, service, staff.
- Events show time, resource, status, minimal customer label.
- Click opens booking detail.
- Manual booking and block-time actions only for authorized staff.
- Mobile defaults to agenda/list; do not compress a week calendar into unreadable columns.

### 9.3 Booking detail — /manage/bookings/[id]

~~~text
Booking DW-000123                         [PENDING]
Customer: [Name] · Contact (authorized staff only)
Service: Dental chair
Resource: Chair 02 / Room A
Date/time: Fri 20 Nov · 10:00–12:00
Price / payment status

WORK DETAILS
Selected teeth: 11, 12, 21
Declared category: Practice session
Assistant requested: Yes
Facility dentist requested: No
Customer note: ...

STAFF
[Assign assistant ▼] [Assign dentist ▼]

[Accept request] [Reject] [Ask for clarification]
~~~

Show customer-submitted requirements. Staff assignment checks capability and schedule conflicts. Accept/reject requires confirmation; rejection/clarification reason is visible to customer. Audit status changes. Enforce facility-scoped permissions.

### 9.4 Resource inventory — /manage/resources
- Heading, count, Add resource.
- Filters by room, type, active/bookable.
- Table: name/ID, type, room, price unit, active, layout mapping.
- Actions: edit, deactivate, view schedule.
- Deactivation warns if future bookings exist; history is preserved.
- Resource form: name, type, room, description, features, pricing, capacity, active/bookable, selection enabled, rules, dependencies.

### 9.5 Add/edit resource
Fields: display name, stable internal ID, type, room, description/features, price/currency, pricing unit, duration/increment, active/bookable, show on plan, dependencies (e.g. chair requires operatory), photos. Save draft/save resource. Service configuration may add requirements; do not hardcode all rules based only on resource type.

### 9.6 Schedule — /manage/schedule
- Weekly operating hours.
- Resource-specific overrides.
- Holidays, closures, extra hours.
- Maintenance blocks with resource/date/time.
- Buffers and notice configuration.
- Visible timezone.
- Warn if edits affect future availability.
- Never silently delete existing bookings when hours change.

### 9.7 Staff — /manage/staff
- Table: name, role, capabilities, hours, active.
- Invite, edit role, configure capabilities (assistant/dentist/reception), working hours/time off, deactivate.
- Explain facility-scoped permissions.
- Staff personal data is never public.

### 9.8 Room layouts — /manage/layouts
- Room list and published layout version.
- Upload/replace plan; open editor.
- Mapping health: mapped, unmapped, duplicate resources.
- Customer preview; draft/published versions; version history/rollback.
- Publishing never changes historical booking resource IDs.

### 9.9 Courses — /manage/courses
- List with draft/published/completed/cancelled.
- Add/edit course, instructor, capacity, price, date, venue.
- Enrollment list.
- Prevent capacity reductions below confirmed enrollment without explicit resolution.
- Notify enrolled users about important changes.

### 9.10 Public profile editor — /manage/profile
- Live preview alongside form on desktop.
- Name, description, address, contact, photos, services, amenities, policies, visibility.
- Upload preview and validation.
- Save draft/publish.
- Verification label only after admin verification.

### 9.11 Reports — /manage/reports
MVP: bookings by date, resource utilization, cancellation/no-show counts, course enrollments. Revenue only after payment data is implemented and reconciled. Every report shows date range, timezone, and calculation definition. Do not call estimated revenue paid revenue.

### 9.12 Settings — /manage/settings
Facility timezone/locale, approval mode, booking lead time/advance window, duration/slot increments, cancellation/reschedule policy, notification preferences, payment config after integration, staff permissions. Dangerous actions are separated and confirmed.

## 10. Platform administration

Admin pages are private operational tools, not public navigation.

- /admin: facilities awaiting review, reports, account flags, recent moderation actions.
- /admin/facilities: search/filter draft, pending, published, rejected, suspended; review evidence; approve/reject/suspend with reason and audit trail.
- /admin/users: search, roles/status, suspend/reactivate with reason; never expose passwords/secrets.
- /admin/reports: report queue and resolution.
- /admin/audit-log: filter by actor, facility, action, date; restrict sensitive metadata.

## 11. Responsive behavior

| Feature | Desktop | Tablet | Mobile |
|---|---|---|---|
| Public navigation | Full header | Compact header | Menu drawer |
| Explore filters | Inline toolbar | Wrapped toolbar | Filter bottom sheet |
| Facility profile | Gallery + side booking card | Stacked | Swipe gallery + sticky CTA |
| Booking flow | Two columns + summary | Stacked | Single column + sticky actions |
| Calendar | Day/week/month | Day/week | Agenda/list first |
| Room selector | Plan + side panel | Plan + collapsible details | Fullscreen plan + bottom sheet |
| Tooth selector | 3D + side summary | Stacked | 3D/2D toggle + summary drawer |
| Facility sidebar | Fixed | Collapsible | Drawer |
| Data tables | Full table | Compact/scroll | Cards/agenda |

Test widths: 360px, 390px, 768px, 1024px, 1440px. Responsive design means reordering and simplifying controls, not merely shrinking desktop content.

## 12. Component states and accessibility

Every interactive component defines default, hover, focus-visible, selected, disabled, loading, and error states; add empty states where relevant.

Calendar: available, partial, fully booked, closed, selected, loading, API error, no slots for duration.

Booking: draft, submitting, pending, confirmed, conflict, rejected, cancelled, expired.

Room selector: loading, ready, available, selected, reserved, maintenance, held, no layout, blueprint error, availability error, list fallback.

3D viewer: not loaded, loading, ready, selected object, unsupported WebGL, asset failure, 2D fallback.

Accessibility target WCAG 2.2 AA:
- Keyboard navigation and visible focus.
- Semantic headings/landmarks.
- Form labels and field errors.
- Contrast checked; status not color-only.
- Accessible names for icon buttons.
- Calendar usable without pointer.
- Room plan has synchronized station list.
- Tooth selector has 2D alternative.
- Announce meaningful selection/status updates without excessive announcements.
- Reduced motion.
- Aim for 44×44 CSS px touch targets.

## 13. Content and microcopy

Preferred:
- “Choose an available station”
- “Reserved for this time”
- “Temporarily unavailable”
- “Your request has been sent”
- “Waiting for facility approval”
- “This information helps the facility prepare”
- “You can continue without selecting teeth”

Avoid:
- “Guaranteed available” before server confirmation.
- “Diagnosis” or “treatment recommendation” in booking.
- “Verified” without a completed verification process.
- “Book now” when the action only submits a pending request; use “Request booking”.

## 14. Design handoff deliverables

Before implementing all pages, produce:
1. Desktop and mobile wireframes for Home, Explore, Facility Profile, Booking, Room Selector, Customer Overview, Facility Overview, Booking Calendar, Booking Detail, Resource Management, and Layout Editor.
2. Clickable prototype of the customer booking path.
3. Facility-owner prototype for adding a resource and mapping it to the room plan.
4. Component inventory and token sheet.
5. Real SVG blueprint proof-of-concept with 14 mapped stations.
6. GLB tooth-model proof-of-concept with individually selectable teeth.
7. Mapping between visible station labels and database resource IDs.
8. Error/loading/empty/disabled state designs.

Do not polish every low-priority admin page before validating booking and room-selection journeys.

## 15. UI implementation sequence

### Step 1 — Inspect existing code/assets
- Inspect repository structure and current framework.
- Locate supplied blueprint source and preserve original.
- Identify whether source is SVG, HTML with inline SVG, or another format.
- Inspect actual station IDs/labels and confirm 01–14 mapping.
- Do not infer exact coordinates from this document.

### Step 2 — Establish design system
Define tokens, typography, spacing, buttons, fields, cards, badges, navigation, and responsive breakpoints. Build reusable primitives. Avoid stock dashboard appearance.

### Step 3 — Build high-value pages
1. Home and Explore.
2. Facility Profile.
3. Booking stepper and date/time.
4. Room selector using supplied blueprint.
5. Booking review and confirmation.
6. Facility booking calendar and booking detail.

### Step 4 — Build remaining pages
Customer dashboard, resources, layout editor, courses, staff, profile editor, reports, admin.

### Step 5 — Integrate APIs
Replace mock facility/resource/availability data with API data. Connect booking submit to backend. Handle conflicts and pending/confirmed states. Verify resource IDs and tooth codes persist.

### Step 6 — Validate
Test target widths, keyboard navigation, SVG zoom/pan/select, status changes after date/time changes, booking conflict, blueprint failure/list fallback, tooth model failure/2D fallback.

## 16. Definition of done

- Every major route has page composition and responsive layout.
- Customer can understand facility and resources without contacting it.
- Booking stepper only displays relevant steps.
- Date/time selection updates resource availability.
- All 14 phantom-head stations are mapped to stable resource IDs after verifying the source blueprint.
- Selected station is obvious and appears in booking summary.
- Reserved and maintenance stations cannot be selected.
- Station list fallback works.
- Confirmation reflects actual backend status.
- Facility staff can review booking and work details.
- Owner can manage resources and layout mappings.
- Tooth selection is consistent between 3D and 2D.
- Loading, error, empty, and disabled states exist.
- Mobile booking works without horizontal page scrolling.
- Accessibility basics are tested.

**Final principle:** the room plan is not decoration. It represents real inventory. Every selectable station maps to a real resource, and every displayed availability state comes from the booking system.
