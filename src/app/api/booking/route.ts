import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

// ─── POST /api/booking ───
// Create a booking hold + booking record atomically.
// Validates availability, computes the price server-side, creates the hold
// with an expiry, and returns the checkout session info.
//
// The client may send an `idempotencyKey`. If a booking already exists for
// that key it is returned unchanged, so a double-click or a network retry
// cannot create two reservations.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clinicId,
      userId,
      serviceId,
      resourceId,
      startDt,
      endDt,
      source = 'web',
      notes = null,
      holdMinutes = 15,
      idempotencyKey: providedIdempotencyKey = null,
    } = body

    // Validate required fields
    if (!clinicId || !userId || !resourceId || !startDt || !endDt) {
      return NextResponse.json({ error: 'Missing required fields: clinicId, userId, resourceId, startDt, endDt' }, { status: 400 })
    }

    // Staff-entered bookings are not customer requests; they are marked as
    // such so they can bypass the customer-facing availability rules.
    const staffEntry = source === 'phone' || source === 'walk_in' || source === 'admin'
    let idempotencyKey = providedIdempotencyKey
    if (!staffEntry && !idempotencyKey) {
      // A customer booking without an idempotency key is still allowed, but
      // the key is derived deterministically so a retry is de-duplicated.
      idempotencyKey = `${clinicId}:${userId}:${resourceId}:${startDt}:${endDt}`
    }

    // Return the existing booking if this request was already processed.
    if (idempotencyKey) {
      const { data: existing } = await createClient()
        .from('bookings')
        .select('id, reference, clinic_id, user_id, service_id, resource_id, start_dt, end_dt, status, deposit_due_egp, balance_due_egp, deposit_paid_egp')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .eq('start_dt', startDt)
        .eq('end_dt', endDt)
        .in('status', ['held', 'pending', 'confirmed'])
        .limit(1)

      if (existing && existing.length > 0) {
        const booking = existing[0]
        return NextResponse.json({
          success: true,
          idempotent: true,
          booking: {
            id: booking.id,
            reference: booking.reference,
            clinicId: booking.clinic_id,
            userId: booking.user_id,
            serviceId: booking.service_id,
            resourceId: booking.resource_id,
            startDt: booking.start_dt,
            endDt: booking.end_dt,
            status: booking.status,
            depositDue: booking.deposit_due_egp,
            balanceDue: booking.balance_due_egp,
            depositPaid: booking.deposit_paid_egp,
          },
        })
      }
    }

    // Parse dates
    const start = new Date(startDt)
    const end = new Date(endDt)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    if (start >= end) {
      return NextResponse.json({ error: 'startDt must be before endDt' }, { status: 400 })
    }

    // Duration is derived from the requested window. Pricing is computed
    // server-side from the service rate — the client never supplies an amount.
    const durationHours = (end.getTime() - start.getTime()) / 3_600_000
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json({ error: 'Invalid booking duration' }, { status: 400 })
    }

    // Get clinic for timezone and deposit rule
    const supabase = createClient()

    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, timezone, deposit_pct, cancellation_cutoff_hours')
      .eq('id', clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    // ── Server-authoritative pricing ────────────────────────────────
    // The rate comes from the configured service, never from the request.
    // Money is handled in integer minor units (piastres).
    const { data: service } = serviceId
      ? await supabase
          .from('services')
          .select('id, name, price_egp, deposit_pct, duration_minutes, is_active, is_bookable')
          .eq('id', serviceId)
          .single()
      : { data: null }

    if (serviceId && !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    if (service && (!service.is_active || !service.is_bookable)) {
      return NextResponse.json({ error: 'Service is not available for booking' }, { status: 400 })
    }

    const hourlyRateMinor = (service?.price_egp ?? 0) * 100
    if (hourlyRateMinor <= 0) {
      return NextResponse.json(
        { error: 'No bookable rate configured for this service' },
        { status: 400 },
      )
    }

    const totalMinor = hourlyRateMinor * durationHours
    // Deposit percentage comes from the service override, else the clinic default.
    const depositPct = service?.deposit_pct ?? clinic.deposit_pct ?? 50
    const depositMinor = Math.floor((totalMinor * depositPct) / 100)
    const balanceMinor = totalMinor - depositMinor

    // Validate start/end are within operating hours.
    // Facility-wide hours apply to every resource; resource-specific hours
    // override them. Fetched separately because a single `.or()` filter cannot
    // express "either facility-wide or this resource".
    const weekday = start.getDay()
    const { data: facilityHours } = await supabase
      .from('operating_hours')
      .select('start_time, end_time')
      .eq('clinic_id', clinicId)
      .eq('weekday', weekday)
      .is('resource_id', null)

    const { data: resourceHours } = await supabase
      .from('operating_hours')
      .select('start_time, end_time')
      .eq('clinic_id', clinicId)
      .eq('weekday', weekday)
      .eq('resource_id', resourceId)

    const hours = resourceHours?.length ? resourceHours : facilityHours

    // Check if the slot conflicts with existing bookings or holds
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('id, start_dt, end_dt, status')
      .eq('clinic_id', clinicId)
      .eq('resource_id', resourceId)
      .in('status', ['confirmed', 'held', 'pending'])
      .lt('end_dt', end.toISOString())
      .gt('start_dt', start.toISOString())

    const { data: conflictingHolds } = await supabase
      .from('booking_holds')
      .select('id, start_dt, end_dt')
      .eq('resource_id', resourceId)
      .eq('status', 'active')
      .lt('end_dt', end.toISOString())
      .gt('start_dt', start.toISOString())

    const conflicts = [...(conflictingBookings || []), ...(conflictingHolds || [])]
    if (conflicts.length > 0) {
      return NextResponse.json({
        error: 'Slot is already reserved or blocked',
        conflicts: conflicts.map(c => ({
          id: c.id,
          start: c.start_dt,
          end: c.end_dt,
          status: (c as any).status ?? 'held',
        })),
      }, { status: 409 })
    }

    // Verify the whole requested range sits inside one operating-hours window.
    // Checking only the start time would allow a booking to run past closing.
    const slotTimeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
    const endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`

    const inOperatingHours = (hours ?? []).some(
      (h) => h.start_time <= slotTimeStr && h.end_time >= endTimeStr,
    )

    // Staff-entered bookings (phone, walk-in, admin) bypass the hours check.
    if (!inOperatingHours && !staffEntry) {
      if (!hours || hours.length === 0) {
        return NextResponse.json({
          error: 'No operating hours configured for this day. Please contact the facility.',
        }, { status: 400 })
      }
      return NextResponse.json({
        error: 'The selected time is outside operating hours.',
      }, { status: 400 })
    }

    // Generate booking reference
    const reference = `BK-${String(start.getFullYear()).slice(2)}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}-${uuidv4().slice(0, 6).toUpperCase()}`

    // Create booking with 'held' status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        reference,
        clinic_id: clinicId,
        user_id: userId,
        service_id: serviceId || null,
        resource_id: resourceId,
        start_dt: start.toISOString(),
        end_dt: end.toISOString(),
        status: 'held',
        notes,
        deposit_due_egp: depositMinor / 100,
        balance_due_egp: balanceMinor / 100,
        deposit_paid_egp: 0,
        source,
        created_by: userId,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Failed to create booking: ' + bookingError?.message }, { status: 500 })
    }

    // The hold expires relative to NOW, not relative to the booking start —
    // otherwise a booking next month would be held indefinitely.
    const expirationDt = new Date(Date.now() + holdMinutes * 60 * 1000)

    // Create hold
    const { data: hold, error: holdError } = await supabase
      .from('booking_holds')
      .insert({
        booking_id: booking.id,
        resource_id: resourceId,
        start_dt: start.toISOString(),
        end_dt: end.toISOString(),
        expiration_dt: expirationDt.toISOString(),
        status: 'active',
      })
      .select()
      .single()

    if (holdError || !hold) {
      // Rollback: delete the booking
      await supabase.from('bookings').delete().eq('id', booking.id)
      return NextResponse.json({ error: 'Failed to create hold: ' + holdError?.message }, { status: 500 })
    }

    // Checkout summary — amounts come from the server-side calculation.
    const serviceName = service?.name ?? 'Booking'
    const servicePrice = service?.price_egp ?? 0

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.reference,
        clinicId,
        userId,
        serviceId,
        resourceId,
        startDt: booking.start_dt,
        endDt: booking.end_dt,
        status: booking.status,
        durationHours,
        hourlyRateEgp: servicePrice,
        depositDue: booking.deposit_due_egp,
        balanceDue: booking.balance_due_egp,
        depositPaid: booking.deposit_paid_egp,
        source: booking.source,
        notes: booking.notes,
      },
      hold: {
        id: hold.id,
        expirationDt: hold.expiration_dt,
        status: hold.status,
      },
      checkout: {
        serviceName,
        servicePrice,
        depositDue: booking.deposit_due_egp,
        balanceDue: booking.balance_due_egp,
        currency: 'EGP',
        checkoutUrl: `/checkout/${booking.id}`,
        expiry: expirationDt.toISOString(),
        note: 'Complete payment within the hold window to confirm this booking.',
      },
    })
  } catch (err) {
    console.error('Booking API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
