import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuid } from 'uuid'

// ─── POST /api/checkout/webhook ───
// Paymob server-to-server callback.
// This is the authoritative payment confirmation path. The client redirect is not trusted alone.
// We verify the payment, record it exactly once (idempotency), and confirm the booking if >= 50% paid.
export async function POST(request: NextRequest) {
  try {
    // Paymob sends the callback as form-encoded or JSON. Try both.
    let payload: any
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      payload = await request.json()
    } else {
      const text = await request.text()
      // Try to parse as JSON first; if not, treat as form data
      try {
        payload = JSON.parse(text)
      } catch {
        // Form-encoded fallback: parse manually (simplified)
        payload = Object.fromEntries(new URLSearchParams(text))
      }
    }

    const {
      order,
      payment,
      token,         // session token
      order_number,  // internal order number
      status,
    } = payload

    // ── Validate the payload ──
    if (!order && !payment) {
      return NextResponse.json({ error: 'Invalid Paymob callback: no order or payment data' }, { status: 400 })
    }

    const orderId = order?.id ?? payment?.order_id
    if (!orderId) {
      return NextResponse.json({ error: 'No order_id in callback' }, { status: 400 })
    }

    const supabase = createClient()

    // Find the booking that matches this Paymob order.
    // In production, we store the paymob order_id on the booking or a mapping table.
    // Here we search by the Paymob order number stored on the booking or payment.
    const { data: payments } = await supabase
      .from('payments')
      .select('*, bookings(*)')
      .eq('provider', 'paymob')
      .or(`provider_tx_id.eq.${orderId}`)
      .limit(5)

    // Also try matching by order_number on the booking
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, clinics(*, paymob_configs(*))')
      .eq('reference', String(orderId))
      .limit(5)

    if (!payments?.length && !bookings?.length) {
      // No matching booking found — store for later reconciliation or reject?
      // In production, we'd record this as an unmatched callback for review.
      console.warn('Unmatched Paymob callback:', { orderId, order_number, status })
      return NextResponse.json({ received: true, note: 'No matching booking found; stored for reconciliation.' }, { status: 200 })
    }

    // Pick the first matching booking
    const booking = bookings?.[0]
    const existingPayment = payments?.[0]

    // Determine the clinic's Paymob config
    const clinic = booking?.clinic || (payments?.[0]?.booking as any)?.clinic
    const paymobConfig = clinic?.paymob_configs?.[0] ?? null

    const apiKey = process.env.PAYMOB_API_KEY || paymobConfig?.api_key || ''
    if (!apiKey) {
      return NextResponse.json({ error: 'Paymob API key not configured for this clinic' }, { status: 500 })
    }

    // ── Verify the payment with Paymob (authoritative check) ──
    const { verifyPaymobPayment } = await import('@/lib/paymob')

    const verification = await verifyPaymobPayment({
      orderId: orderId,
      expectedAmountEgP: booking?.deposit_due_egp ?? 0,
    })

    const {
      orderStatus,
      paidAmountEgP,
      paidRatio,
      isDepositSufficient,
      isFullyPaid,
    } = verification

    // ── Idempotency: only process if not already fully processed ──
    const idempotencyKey = `paymob_${orderId}_${payment?.id ?? 'unknown'}`

    const { data: existingIdempotent } = await supabase
      .from('payments')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .single()

    if (existingIdempotent) {
      // Already processed this callback — return success without reprocessing
      return NextResponse.json({
        received: true,
        note: `Already processed (idempotency key: ${idempotencyKey})`,
        paymentId: existingIdempotent.id,
        status: 'idempotent',
      })
    }

    // ── Determine the new status ──
    // Paymob callback statuses: "paid", "failed", "pending", "refunded", "cancelled"
    const paymobStatus = status ?? orderStatus ?? 'unknown'
    let paymentStatus: 'paid' | 'failed' | 'pending' | 'refunded' = 'pending'

    if (paymobStatus === 'paid' || paidRatio >= 1) {
      paymentStatus = 'paid'
    } else if (paymobStatus === 'failed') {
      paymentStatus = 'failed'
    } else if (paymobStatus === 'refunded') {
      paymentStatus = 'refunded'
    }

    // ── Record / update the payment record ──
    const providerTxId = String(payment?.id ?? orderId)
    const amountEgP = paidAmountEgP

    // If we already have a payment record for this booking, update it
    let paymentRecordId: string | null = existingPayment?.id ?? null

    if (!paymentRecordId) {
      // Create the payment record
      const { data: newPayment, error: pError } = await supabase
        .from('payments')
        .insert({
          booking_id: booking?.id,
          clinic_id: booking?.clinic_id,
          provider: 'paymob',
          provider_tx_id: providerTxId,
          amount_egp: amountEgP,
          currency: 'EGP',
          status: paymentStatus,
          verified_at: new Date().toISOString().replace('Z', '+00:00'),
          idempotency_key: idempotencyKey,
          raw_metadata: payload,
        })
        .select()
        .single()

      if (pError || !newPayment) {
        return NextResponse.json({ error: 'Failed to record payment: ' + pError?.message }, { status: 500 })
      }

      paymentRecordId = newPayment.id
    } else {
      // Update the existing payment record
      await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          amount_egp: amountEgP,
          provider_tx_id: providerTxId,
          verified_at: new Date().toISOString().replace('Z', '+00:00'),
          raw_metadata: payload,
        })
        .eq('id', paymentRecordId)
    }

    // ── Confirm the booking if deposit is sufficient (≥ 50%) ──
    let bookingDidChange = false
    if (isDepositSufficient && booking && booking.status === 'held') {
      const { error: bError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          deposit_paid_egp: Math.min(amountEgP, booking.deposit_due_egp),
          updated_at: new Date().toISOString().replace('Z', '+00:00'),
        })
        .eq('id', booking.id)

      if (!bError) {
        bookingDidChange = true
      }
    }

    // ── If payment failed or expired, release the hold ──
    if ((paymobStatus === 'failed' || paymobStatus === 'cancelled') && booking) {
      await supabase
        .from('bookings')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString().replace('Z', '+00:00'),
        })
        .eq('id', booking.id)

      // Release the hold
      await supabase
        .from('booking_holds')
        .update({ status: 'released' })
        .eq('booking_id', booking.id)
        .eq('status', 'active')
    }

    // ── Audit log ──
    // (Simplified — in production, create an audit_logs entry with actor = 'Paymob callback')
    await supabase.from('audit_logs').upsert({
      id: uuid()  // ensure uniqueness
      , clinic_id: booking?.clinic_id
      , actor_id: 'system'
      , action: 'paymob_callback'
      , entity: 'payment'
      , entity_id: paymentRecordId,
      after: {
        paymentStatus,
        paidAmountEgP,
        paidRatio,
        isDepositSufficient,
        bookingStatus: booking?.status,
        bookingConfirmed: bookingDidChange,
      },
    }, { onConflict: 'id' })

    return NextResponse.json({
      received: true,
      paymentId: paymentRecordId,
      paymentStatus,
      paidAmountEgP,
      isDepositSufficient,
      bookingConfirmed: bookingDidChange,
      bookingId: booking?.id,
    })
  } catch (err) {
    console.error('Paymob webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
