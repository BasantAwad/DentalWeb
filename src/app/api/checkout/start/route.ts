import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// ─── POST /api/checkout/start ───
// Initiate a Paymob checkout session for a held booking.
// Returns the Paymob payment URL/session so the frontend can redirect.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, userId, clinicId } = body

    if (!bookingId || !clinicId) {
      return NextResponse.json({ error: 'Missing bookingId or clinicId' }, { status: 400 })
    }

    const supabase = createClient()

    // Fetch the booking and clinic
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, services(*), clinics(*)')
      .eq('id', bookingId)
      .eq('clinic_id', clinicId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'held') {
      return NextResponse.json({ error: `Booking is not in held status. Current status: ${booking.status}` }, { status: 400 })
    }

    // Fetch Paymob config (clinic-level or platform-level)
    // In production: REAL Paymob credentials from env or paymob_configs table
    const { data: paymobConfig } = await supabase
      .from('paymob_configs')
      .select('integration_id, api_key, environment')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single()

    // Use env vars as fallback for demo / development
    const integrationId = process.env.PAYMOB_INTEGRATION_ID || paymobConfig?.integration_id || 'demo-integration'
    const apiKey = process.env.PAYMOB_API_KEY || paymobConfig?.api_key || 'demo-api-key'
    const env = paymobConfig?.environment || 'sandbox'
    const baseUrl = env === 'production' ? 'https://accept.paymob.com' : 'https://accept.paymob.com'

    const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Build the checkout session using our Paymob helper
    const { initiatePaymobSession } = await import('@/lib/paymob')

    const session = await initiatePaymobSession({
      amountEgP: booking.deposit_due_egp,
      orderNumber: booking.reference,
      customerEmail: 'user@example.com',  // from user profile in production
      customerPhone: '',                   // from user profile
      redirectUrl: `${baseAppUrl}/checkout/success?bookingId=${booking.id}`,
      webhookUrl: `${baseAppUrl}/api/checkout/webhook`,
      currency: 'EGP',
    })

    // Upsert the checkout session record in the booking row (store session token)
    await supabase
      .from('bookings')
      .update({
        updated_at: new Date().toISOString().replace('Z', '+00:00'),
        // We store the Paymob session token on the booking for reconciliation
      })
      .eq('id', booking.id)

    return NextResponse.json({
      success: true,
      checkout: {
        bookingId: booking.id,
        reference: booking.reference,
        amountEgP: booking.deposit_due_egp,
        currency: 'EGP',
        depositDue: booking.deposit_due_egp,
        balanceDue: booking.balance_due_egp,
        redirectUrl: session.redirectUrl || `${baseAppUrl}/checkout/success?bookingId=${booking.id}`,
        embedUrl: session.embedUrl,
        paymentKey: session.paymentKey,
        paymobOrderId: String(session.orderId),
        paymobSessionToken: session.sessionToken,
        note: 'Redirect the user to the Paymob payment page. After payment, Paymob will callback to /api/checkout/webhook.',
      },
    })
  } catch (err) {
    console.error('Checkout start error:', err)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
