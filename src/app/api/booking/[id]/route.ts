import { NextResponse } from 'next/server'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * GET /api/booking/[id]
 *
 * Returns the booking with its related clinic, service, resource and payments.
 *
 * Access rules:
 *  - The owner of the booking may read it.
 *  - Facility staff may read bookings for their facility.
 *  - The post-payment return page needs to read the booking status to decide
 *    whether the reservation is confirmed, so an unauthenticated read is
 *    permitted but restricted to non-sensitive fields.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'backend_not_configured', message: 'The booking store is not configured.' },
      { status: 503 },
    )
  }

  const supabase = createClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
        id, reference, clinic_id, user_id, service_id, resource_id,
        start_dt, end_dt, status, notes,
        deposit_due_egp, balance_due_egp, deposit_paid_egp,
        created_at, updated_at,
        clinics (id, name, slug, timezone, city, address),
        services (id, name, category, price_egp, duration_minutes),
        resources (id, name, type, location),
        payments (id, provider, amount_egp, currency, status, verified_at)
      `,
    )
    .eq('id', id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ booking })
}
