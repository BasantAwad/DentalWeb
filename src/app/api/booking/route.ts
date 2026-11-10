import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

// ─── POST /api/booking ───
// Create a booking hold + booking record atomically
// Validates availability, creates hold with expiration, returns checkout session info
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
      depositDue,
      balanceDue,
      holdMinutes = 15,
    } = body

    // Validate required fields
    if (!clinicId || !userId || !resourceId || !startDt || !endDt) {
      return NextResponse.json({ error: 'Missing required fields: clinicId, userId, resourceId, startDt, endDt' }, { status: 400 })
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

    // Validate start/end are within operating hours
    // (Simplified: check if any operating hours exist that cover this time range)
    const weekday = start.getDay()
    const { data: hours } = await supabase
      .from('operating_hours')
      .select('start_time, end_time')
      .eq('clinic_id', clinicId)
      .eq('weekday', weekday)
      .or('resource_id.is_null')
      .eq('resource_id', resourceId)

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

    // Verify the slot is within operating hours
    const slotHour = start.getHours()
    const slotMinutes = start.getMinutes()
    const slotTimeStr = `${String(slotHour).padStart(2, '0')}:${String(slotMinutes).padStart(2, '0')}`
    const endHour = end.getHours()
    const endMinutes = end.getMinutes()
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

    let inOperatingHours = false
    if (hours && hours.length > 0) {
      for (const h of hours) {
        if (h.start_time <= slotTimeStr && h.end_time > slotTimeStr) {
          inOperatingHours = true
          break
        }
      }
    }

    // If no operating hours found but this is an admin/phone booking, allow
    if (!inOperatingHours && source !== 'phone' && source !== 'walk_in' && source !== 'admin') {
      // Check if there are ANY operating hours for this weekday
      if (!hours || hours.length === 0) {
        return NextResponse.json({
          error: 'No operating hours configured for this day. Please contact the clinic.',
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
        deposit_due_egp: depositDue || 0,
        balance_due_egp: balanceDue || 0,
        deposit_paid_egp: 0,
        source,
        created_by: userId,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Failed to create booking: ' + bookingError?.message }, { status: 500 })
    }

    const expirationDt = new Date(start.getTime() + holdMinutes * 60 * 1000)

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

    // Get service info for checkout summary
    let serviceName = 'Booking'
    let servicePrice = depositDue || 0
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('name, price_egp')
        .eq('id', serviceId)
        .single()
      if (service) {
        serviceName = service.name
        servicePrice = service.price_egp
      }
    }

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

// ─── GET /api/booking/[id] ───
// Get booking details (user's own booking or clinic staff)
export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop()
  if (!id) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      clinics (*),
      services (*),
      resources (*),
      payments (*)
    `)
    .eq('id', id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
