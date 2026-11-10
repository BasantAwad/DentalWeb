import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/client'

// ─── GET /api/availability ───
// Check available slots for a resource on a given date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clinicId = searchParams.get('clinicId')
  const resourceId = searchParams.get('resourceId')
  const dateStr = searchParams.get('date') // YYYY-MM-DD
  const serviceId = searchParams.get('serviceId') || null

  if (!clinicId || !resourceId || !dateStr) {
    return NextResponse.json({ error: 'Missing parameters: clinicId, resourceId, date' }, { status: 400 })
  }

  const supabase = createClient()

  // Parse date
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  // Get clinic timezone
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('timezone, deposit_pct, cancellation_cutoff_hours')
    .eq('id', clinicId)
    .single()

  if (clinicError || !clinic) {
    return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
  }

  // Get operating hours for the weekday.
  // Facility-wide hours apply to every resource; resource-specific hours
  // override them. They are fetched separately because a single `.or()` filter
  // cannot express "either facility-wide or this resource".
  const weekday = date.getDay() // 0=Sunday in JS, matches Egypt convention
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

  // Resource-specific hours win when present.
  const hours = resourceHours?.length ? resourceHours : facilityHours

  // Get existing bookings/holds for the resource on that date
  const startOfDay = new Date(date)
  const endOfDay = new Date(date)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_dt, end_dt, status')
    .eq('clinic_id', clinicId)
    .eq('resource_id', resourceId)
    .in('status', ['confirmed', 'held', 'pending'])
    .gte('start_dt', startOfDay.toISOString())
    .lt('end_dt', endOfDay.toISOString())

  const { data: holds } = await supabase
    .from('booking_holds')
    .select('start_dt, end_dt')
    .eq('resource_id', resourceId)
    .eq('status', 'active')
    .gte('start_dt', startOfDay.toISOString())
    .lt('end_dt', endOfDay.toISOString())

  // Get availability blocks — facility-wide closures plus resource blocks.
  const { data: facilityBlocks } = await supabase
    .from('availability_blocks')
    .select('start_dt, end_dt, reason')
    .eq('clinic_id', clinicId)
    .is('resource_id', null)
    .gte('start_dt', startOfDay.toISOString())
    .lt('end_dt', endOfDay.toISOString())

  const { data: resourceBlocks } = await supabase
    .from('availability_blocks')
    .select('start_dt, end_dt, reason')
    .eq('clinic_id', clinicId)
    .eq('resource_id', resourceId)
    .gte('start_dt', startOfDay.toISOString())
    .lt('end_dt', endOfDay.toISOString())

  const blocks = [...(facilityBlocks ?? []), ...(resourceBlocks ?? [])]

  // Build availability from operating hours, subtracting occupied times
  const occupied = new Map<string, { start: Date, end: Date, status: string }>()

  if (bookings) {
    for (const b of bookings) {
      const s = new Date(b.start_dt)
      const e = new Date(b.end_dt)
      const key = `${s.getHours()}:${s.getMinutes()}`
      if (!occupied.has(key) || occupied.get(key)!.end < e) {
        occupied.set(key, { start: s, end: e, status: b.status })
      }
    }
  }
  if (holds) {
    for (const h of holds) {
      const s = new Date(h.start_dt)
      const e = new Date(h.end_dt)
      const key = `${s.getHours()}:${s.getMinutes()}`
      if (!occupied.has(key) || occupied.get(key)!.end < e) {
        occupied.set(key, { start: s, end: e, status: 'held' })
      }
    }
  }

  // Generate hourly slots based on operating hours
  const slots: { hour: string; available: boolean; occupiedUntil?: string; reason?: string }[] = []

  if (hours && hours.length > 0) {
    for (const h of hours) {
      const [startH, startM] = h.start_time.split(':').map(Number)
      const [endH, endM] = h.end_time.split(':').map(Number)

      for (let hr = startH; hr < endH; hr++) {
        const hourStr = `${String(hr).padStart(2, '0')}:00`
        const slotStart = new Date(date)
        slotStart.setHours(hr, 0, 0, 0)
        const slotEnd = new Date(date)
        slotEnd.setHours(hr + 1, 0, 0, 0)

        // Check if this slot overlaps with any occupied/block
        let isAvailable = true
        let occupiedUntil: string | undefined
        let reason: string | undefined

        if (blocks) {
          for (const b of blocks) {
            const bs = new Date(b.start_dt)
            const be = new Date(b.end_dt)
            if (bs.getHours() <= hr && be.getHours() > hr) {
              isAvailable = false
              reason = b.reason
              break
            }
          }
        }

        if (isAvailable && bookings) {
          for (const bs of bookings) {
            const bsTime = new Date(bs.start_dt)
            const beTime = new Date(bs.end_dt)
            if (bsTime.getHours() <= hr && beTime.getHours() > hr) {
              isAvailable = false
              occupiedUntil = beTime.toISOString()
              break
            }
          }
        }

        slots.push({
          hour: hourStr,
          available: isAvailable,
          occupiedUntil,
          reason,
        })
      }
    }
  }

  return NextResponse.json({
    date: dateStr,
    resourceId,
    timezone: clinic.timezone,
    depositPct: clinic.deposit_pct,
    slots,
    summary: {
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.available).length,
      isFullyReserved: slots.length > 0 && slots.every(s => !s.available),
      isPartiallyBooked: slots.some(s => s.available) && slots.some(s => !s.available),
    },
  })
}

// ─── POST /api/availability ───
// Create a new availability block (admin)
export async function POST(request: NextRequest) {
  // Admin-only: must be authenticated
  // In production: validate session, check role
  try {
    const body = await request.json()
    const { clinicId, resourceId, startDt, endDt, reason, createdBy } = body

    if (!clinicId || !startDt || !endDt || !reason || !createdBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('availability_blocks')
      .insert({
        clinic_id: clinicId,
        resource_id: resourceId || null,
        start_dt: startDt,
        end_dt: endDt,
        reason,
        created_by: createdBy,
        is_recurring: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, block: data })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
