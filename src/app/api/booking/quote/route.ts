import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

/**
 * POST /api/booking/quote
 *
 * Returns the price breakdown for a proposed booking.
 *
 * The amount is always computed from the service's configured rate and the
 * requested duration — never from a value supplied by the client. The same
 * calculation runs again inside the booking endpoint before any hold or
 * payment is created, so a tampered quote cannot change what is charged.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { facilityId, serviceId, resourceId, startDt, endDt } = body ?? {}

    if (!facilityId || !serviceId || !startDt || !endDt) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          message: 'facilityId, serviceId, startDt and endDt are required.',
        },
        { status: 400 },
      )
    }

    const start = new Date(startDt)
    const end = new Date(endDt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return NextResponse.json(
        { error: 'invalid_range', message: 'The requested time range is not valid.' },
        { status: 400 },
      )
    }

    const durationHours = (end.getTime() - start.getTime()) / 3_600_000
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json(
        { error: 'invalid_duration', message: 'The requested duration is not valid.' },
        { status: 400 },
      )
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        backend: 'not_configured',
        message: 'Pricing requires a configured database.',
        quote: null,
      })
    }

    const supabase = createClient()

    const [{ data: facility }, { data: service }] = await Promise.all([
      supabase
        .from('clinics')
        .select('id, deposit_pct, timezone')
        .eq('id', facilityId)
        .single(),
      supabase
        .from('services')
        .select('id, name, price_egp, deposit_pct, duration_minutes, is_active, is_bookable')
        .eq('id', serviceId)
        .single(),
    ])

    if (!facility) {
      return NextResponse.json({ error: 'not_found', message: 'That facility could not be found.' }, { status: 404 })
    }
    if (!service) {
      return NextResponse.json({ error: 'not_found', message: 'That service could not be found.' }, { status: 404 })
    }
    if (!service.is_active || !service.is_bookable) {
      return NextResponse.json(
        { error: 'not_bookable', message: 'That service is not available for booking.' },
        { status: 400 },
      )
    }

    // Integer minor units (piastres). No floating-point money arithmetic.
    const hourlyRateMinor = service.price_egp * 100
    const totalMinor = hourlyRateMinor * durationHours
    const depositPct = service.deposit_pct ?? facility.deposit_pct ?? 50
    const depositMinor = Math.floor((totalMinor * depositPct) / 100)
    const remainingMinor = totalMinor - depositMinor

    return NextResponse.json({
      quote: {
        facilityId,
        serviceId,
        resourceId: resourceId ?? null,
        startDt: start.toISOString(),
        endDt: end.toISOString(),
        durationHours,
        hourlyRateEgp: service.price_egp,
        totalEgp: totalMinor / 100,
        depositEgp: depositMinor / 100,
        remainingEgp: remainingMinor / 100,
        depositPct,
        currency: 'EGP',
      },
    })
  } catch (error) {
    console.error('[DentalWeb] quote failed:', error)
    return NextResponse.json(
      { error: 'quote_failed', message: 'The price could not be calculated.' },
      { status: 500 },
    )
  }
}
