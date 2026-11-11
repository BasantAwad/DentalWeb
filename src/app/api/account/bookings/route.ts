import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import type { AccountBooking, BookingGroup } from '@/lib/account-types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/bookings
 *
 * Every reservation the signed-in student has made, grouped by state.
 *
 * The query is scoped to the session's user id, so a student cannot read
 * anybody else's reservations by changing a parameter.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message: 'Bookings are not connected yet.',
        bookings: [],
        counts: { upcoming: 0, pending: 0, completed: 0, cancelled: 0, total: 0 },
      },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.', bookings: [] },
      { status: 401 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data: rows, error } = await supabase
    .from('bookings')
    .select(
      `
        id, reference, start_dt, end_dt, status, created_at,
        deposit_due_egp, balance_due_egp, deposit_paid_egp,
        services (id, name, category, price_egp),
        resources (id, name, type, location),
        clinics (id, name, city, address),
        payments (id, status, amount_egp, verified_at)
      `,
    )
    .eq('user_id', user.id)
    .order('start_dt', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[DentalWeb] bookings lookup failed:', error.message)
    return NextResponse.json(
      { error: 'query_failed', message: 'Your reservations could not be loaded.' },
      { status: 500 },
    )
  }

  const bookings: AccountBooking[] = (rows ?? []).map((row) => {
    const service = Array.isArray(row.services) ? row.services[0] : row.services
    const resource = Array.isArray(row.resources) ? row.resources[0] : row.resources
    const clinic = Array.isArray(row.clinics) ? row.clinics[0] : row.clinics
    const payments = row.payments ?? []

    // The most advanced payment state wins, so a pending payment that later
    // became paid is not reported as unpaid.
    const paid = payments.find((payment) => payment.status === 'paid')
    const pending = payments.find((payment) => payment.status === 'pending')
    const paymentStatus = paid
      ? 'paid'
      : pending
        ? 'pending'
        : (payments[0]?.status as string | undefined) ?? 'not_required'

    const durationHours =
      (new Date(row.end_dt).getTime() - new Date(row.start_dt).getTime()) /
      3_600_000

    const totalEgp =
      service?.price_egp != null
        ? Math.round(service.price_egp * durationHours)
        : row.deposit_due_egp + row.balance_due_egp

    return {
      id: row.id,
      reference: row.reference,
      facilityId: clinic?.id ?? '',
      facilityName: clinic?.name ?? 'Facility',
      facilityCity: clinic?.city ?? null,
      facilityAddress: clinic?.address ?? null,
      serviceName: service?.name ?? null,
      serviceCategory: service?.category ?? null,
      stationName:
        resource && resource.type === 'dummy_head' ? resource.name : null,
      stationId:
        resource && resource.type === 'dummy_head' ? resource.id : null,
      roomName: resource?.location ?? null,
      startDt: row.start_dt,
      endDt: row.end_dt,
      durationHours,
      hourlyRateEgp: service?.price_egp ?? 0,
      totalEgp,
      depositDueEgp: row.deposit_due_egp,
      depositPaidEgp: row.deposit_paid_egp,
      balanceDueEgp: row.balance_due_egp,
      paymentStatus,
      status: row.status,
      createdAt: row.created_at,
      group: groupFor(row.status, row.start_dt, row.end_dt),
    }
  })

  const counts = {
    upcoming: bookings.filter((booking) => booking.group === 'upcoming').length,
    pending: bookings.filter((booking) => booking.group === 'pending').length,
    completed: bookings.filter((booking) => booking.group === 'completed').length,
    cancelled: bookings.filter((booking) => booking.group === 'cancelled').length,
    total: bookings.length,
  }

  return NextResponse.json({ bookings, counts })
}

/**
 * Which group a reservation belongs to.
 *
 * A reservation that has not been paid for yet is "pending" even if its date
 * is in the future, because it is not actually secured.
 */
function groupFor(status: string, startDt: string, endDt: string): BookingGroup {
  if (status === 'cancelled' || status === 'no_show') return 'cancelled'
  if (status === 'completed') return 'completed'
  if (status === 'pending' || status === 'held') return 'pending'
  if (new Date(endDt).getTime() < Date.now()) return 'completed'
  if (new Date(startDt).getTime() > Date.now()) return 'upcoming'
  // Currently running and confirmed.
  return 'upcoming'
}
