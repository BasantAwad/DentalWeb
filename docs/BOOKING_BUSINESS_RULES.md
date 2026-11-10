# DentalWeb — Confirmed Booking Business Rules

Version: 1.0  
Date: 10 November 2026  
Status: Confirmed product rules supplied by the project owner

This document records the confirmed core rental and reservation process. It takes precedence over any conflicting booking assumptions in earlier planning or wireframe documents. Do not add approval steps, mandatory clinical forms, or extra booking steps unless the product owner explicitly approves them.

## 1. Core business model

DentalWeb allows customers to discover dental facilities and rent bookable dental resources by the hour.

| Service | Price |
|---|---:|
| Dental chair rental | 150 EGP per hour |
| Phantom head rental | 100 EGP per hour |

Prices are in Egyptian pounds (EGP). These are the confirmed starting business rates. Do not invent additional fees, taxes, discounts, or service charges.

## 2. Customer booking flow

1. **Choose a service.** Select Dental Chair Rental or Phantom Head Rental.
2. **Choose a date and available duration.** Show dates and time slots based on the facility schedule and actual resource availability. The customer selects a start time and number of hours. Only durations that fit the schedule and resource availability may be selected.
3. **Review booking details.** Show facility, service/resource, date, start time, end time, number of hours, hourly rate, total price, 50% deposit, and remaining balance.
4. **Pay the deposit.** The customer pays 50% of the total booking amount to confirm the reservation.
5. **Confirm the reservation.** The booking becomes confirmed only after the backend verifies successful deposit payment. The reserved resource and time range then become unavailable to other customers.

Keep this journey short. Do not make tooth selection, assistant requests, dentist requests, or medical-work details mandatory in the core booking flow. Such information may be offered as optional extras only if the owner later confirms they are needed.

## 3. Price calculation

- hourly_rate = 150 EGP for a dental chair, or 100 EGP for a phantom head.
- duration_hours = selected booking duration in hours.
- total_amount = hourly_rate × duration_hours.
- deposit_amount = total_amount × 0.50.
- remaining_balance = total_amount − deposit_amount.

Use exact decimal or integer minor-unit money handling in the backend. Never use floating-point arithmetic for monetary calculations.

| Service | Hours | Total | 50% deposit | Remaining |
|---|---:|---:|---:|---:|
| Dental chair | 1 | 150 EGP | 75 EGP | 75 EGP |
| Dental chair | 2 | 300 EGP | 150 EGP | 150 EGP |
| Dental chair | 3 | 450 EGP | 225 EGP | 225 EGP |
| Phantom head | 1 | 100 EGP | 50 EGP | 50 EGP |
| Phantom head | 2 | 200 EGP | 100 EGP | 100 EGP |
| Phantom head | 3 | 300 EGP | 150 EGP | 150 EGP |

## 4. Availability and reservation integrity

- Availability is calculated for the selected facility, service, resource, date, start time, and requested duration.
- Only offer time ranges that fit operating hours and do not overlap an existing confirmed reservation or applicable resource block.
- Availability shown in the UI is indicative until the backend validates it during booking/payment initiation.
- Recheck availability before accepting the deposit and protect the operation against concurrent booking attempts.
- A successful payment must be linked to exactly one booking and processed idempotently.
- Mark the booking confirmed only after the backend verifies successful deposit payment (for example, through a verified payment-provider webhook or equivalent trusted server-side confirmation).
- Do not trust a frontend success redirect as proof of payment.
- If payment fails or expires, do not confirm the reservation.
- A temporary hold/checkout-expiration policy is needed so unpaid checkout sessions do not block resources indefinitely. The exact hold duration is an open decision; do not invent it.
- Public availability may show available/reserved states but must never expose another customer's identity or booking details.

## 5. Booking review UI

Before payment, display a clear price breakdown:

~~~text
Review your reservation

Service: Dental chair
Date: [selected date]
Time: [start] – [end]
Duration: [number] hours

Hourly rate                         150 EGP
Total booking amount                450 EGP
Deposit required (50%)              225 EGP
Remaining balance                   225 EGP

[Continue to secure deposit payment]
~~~

Use the phantom-head rate when that service is selected. The payment CTA must state the exact amount due now. Do not label the reservation confirmed before payment verification.

## 6. Booking states

Minimum customer-facing states:
- draft: customer is selecting service/date/time.
- awaiting_deposit: booking details are accepted and deposit payment is pending; any resource hold is temporary and expires according to configured policy.
- confirmed: deposit payment has been verified and the resource/time is reserved.
- payment_failed: deposit payment failed.
- expired: deposit was not paid before the hold expired.
- cancelled: reservation was cancelled according to applicable policy.
- completed: rental period has passed and booking is complete.

Keep payment state separate from booking state. Suggested payment states: pending, succeeded, failed, expired, refunded. A booking is not confirmed merely because a payment attempt was created.

## 7. Facility dashboard implications

Facility staff need to:
- View the calendar and reservations for each chair/phantom head.
- See customer, service/resource, date, start/end time, duration, total amount, deposit status, and remaining balance, subject to permissions.
- Distinguish confirmed reservations from unpaid temporary holds.
- Add resource unavailability/maintenance blocks.
- Manage resources and their active hourly rates.
- See a confirmed reservation immediately after successful deposit verification.

The calendar must be based on resource-level reservations, not only a facility-wide count. Two different resources may be bookable at the same time; the same single-capacity resource may not be double-booked.

## 8. Not part of the confirmed core flow

These items were discussed as possible platform capabilities but are not required to complete basic rental booking:
- Mandatory 3D tooth selection.
- Mandatory clinical procedure descriptions.
- Mandatory assistant or dentist requests.
- Manual facility approval after a successful deposit.
- Online collection of the remaining 50%.
- Course enrollment as part of a rental booking.

They may be developed as optional modules or later phases, but must not complicate the core booking path.

The room blueprint and selectable phantom-head stations remain a visual resource-selection feature where the facility has configured individual stations. They must reflect real resource availability. If a service does not require choosing a specific station, do not force the customer through the room selector.

## 9. Open decisions — do not silently assume

1. How long an unpaid checkout holds a resource before expiring.
2. Whether the remaining 50% is paid at the facility, online later, or by another agreed method.
3. Cancellation, refund, and no-show rules, including what happens to the 50% deposit.
4. Whether customers may book fractional hours or only whole hours.
5. Whether facilities can override the default hourly rates, or whether the two rates are platform-wide fixed prices.
6. Whether every phantom-head booking requires selecting a numbered station, or whether the facility can allocate one automatically.
7. Whether a dental-chair booking requires a specific chair selection or lets the facility allocate one.

Until these are decided, implement the confirmed rules above and make unresolved values configurable rather than hardcoding assumptions.

## 10. Implementation acceptance criteria

- Customer can choose one of the two confirmed rental services.
- Correct hourly rate is displayed and used in backend calculations.
- Customer can select an available date, start time, and permitted number of hours.
- Total, 50% deposit, and remaining balance are calculated correctly.
- Booking review clearly shows the amount due now.
- Payment is verified server-side.
- Only verified deposit payment transitions a booking to confirmed.
- A confirmed resource/time range cannot be booked again.
- Failed/expired payment does not create a confirmed booking.
- Customer and facility dashboards distinguish temporary unpaid holds from confirmed bookings.
- Basic booking can be completed without interacting with the tooth model or entering clinical details.
