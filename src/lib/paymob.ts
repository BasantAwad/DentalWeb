// Paymob server-side integration
// Credentials from .env.local (server-side only — never exposed to browser)
// Based on Paymob Egypt API: https://developers.paymob.com/

export const PAYMOB_PRIVATE_KEY = process.env.PAYMOB_PRIVATE_KEY!
export const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY!
export const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET!
export const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || 'pbm_demo_integration'

export interface PaymobSession {
  id: string                    // Paymob session/token ID
  international_card_integration_id?: string
  client_secret: string         // for the payment page/iframe
  amount: number                // in EGP
  currency: 'EGP'
  redirect_url: string          // where Paymob redirects after payment
  webhook_url: string           // server endpoint to receive callbacks
  order_number?: string         // internal reference
  order_customer_email?: string
  order_customer_phone?: string
}

export interface PaymobCallback {
  token: string
  object: string
  status: 'failed' | 'success' | 'paid' | 'refunded'
  order?: {
    id: number
    amount: number
    order_status: string
    payments: Array<{
      id: number
      amount_cents: number
      success: boolean
      ref_number: string
      order_id: number
    }>
  }
  payment?: {
    id: number
    order_id: number
    amount: number
    success: boolean
    paid_amount: number
    ref_number: string
  }
}

// ─── Initiate a Paymob checkout session ───
export async function initiatePaymobSession(params: {
  amountEgP: number
  currency?: string
  orderNumber?: string
  customerEmail?: string
  customerPhone?: string
  redirectUrl: string
  webhookUrl: string
}) {
  const {
    amountEgP,
    currency = 'EGP',
    orderNumber,
    customerEmail,
    customerPhone,
    redirectUrl,
    webhookUrl,
  } = params

  const apiKey = PAYMOB_PRIVATE_KEY
  const baseUrl = 'https://accept.paymob.com'

  // Step 1: get an auth token
  const tokenResponse = await fetch(`${baseUrl}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  })

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text()
    throw new Error(`Paymob auth failed: ${tokenResponse.status} ${text}`)
  }

  const { token } = await tokenResponse.json() as { token: string }

  // Step 2: create the order
  const orderResponse = await fetch(`${baseUrl}/api/ecommerce/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      delivery_needed: false,
      amount_cents: Math.round(amountEgP * 100),
      currency: 'EGP',
      items: [{ name: orderNumber || 'Dental Booking', amount_cents: Math.round(amountEgP * 100), quantity: 1 }],
      shipping_data: {
        blocking_data: [],
        customer_details: {
          first_name: '',
          last_name: '',
          phone_number: customerPhone || '',
          email: customerEmail || '',
          street_style_address: '',
          city: '',
          governate: { id: 0, name_en: '' },
          country_id: 0,
          country: { id: 0, name_en: '' },
        },
      },
    }),
  })

  if (!orderResponse.ok) {
    const text = await orderResponse.text()
    throw new Error(`Paymob order creation failed: ${orderResponse.status} ${text}`)
  }

  const orderData = await orderResponse.json() as { id: number; amount_cents: number }

  // Step 3: create the payment key / session
  const sessionResponse = await fetch(`${baseUrl}/api/acceptance/payment_key/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount_cents: Math.round(amountEgP * 100),
      order_number: String(orderData.id),
      currency: 'EGP',
      integration_id: PAYMOB_INTEGRATION_ID,
      billing_data: {
        first_name: '',
        last_name: '',
        email: customerEmail || '',
        phone_number: customerPhone || '',
        street: '',
        city: '',
        state: '',
        country: 'EG',
        zip: '',
      },
      // webhook_url: webhookUrl,   // server-to-server callback (preferred)
      // redirect_url: redirectUrl,  // where user returns after payment
    }),
  })

  if (!sessionResponse.ok) {
    const text = await sessionResponse.text()
    throw new Error(`Paymob session creation failed: ${sessionResponse.status} ${text}`)
  }

  const sessionData = await sessionResponse.json() as {
    token: string
    payment_key: string
    redirect_url?: string
    embed_url?: string
  }

  return {
    sessionToken: sessionData.token,
    paymentKey: sessionData.payment_key,
    redirectUrl: sessionData.redirect_url || redirectUrl,
    embedUrl: sessionData.embed_url,
    amountEgP,
    currency,
    orderId: orderData.id,
    orderNumber: orderData.id.toString(),
  }
}

// ─── Verify a Paymob callback/webhook ───
export async function verifyPaymobPayment(params: {
  orderId: number | string
  expectedAmountEgP: number
}) {
  const { orderId, expectedAmountEgP } = params

  const apiKey = PAYMOB_PRIVATE_KEY
  const baseUrl = 'https://accept.paymob.com'

  // Authenticate
  const tokenResponse = await fetch(`${baseUrl}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Paymob auth failed during verification: ${tokenResponse.status}`)
  }

  const { token } = await tokenResponse.json() as { token: string }

  // Fetch the order status
  const orderResponse = await fetch(`${baseUrl}/api/ecommerce/orders/${orderId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!orderResponse.ok) {
    throw new Error(`Paymob order lookup failed: ${orderResponse.status}`)
  }

  const order = await orderResponse.json() as {
    id: number
    amount_cents: number
    order_status: string
    payments: Array<{
      id: number
      amount_cents: number
      success: boolean
      ref_number: string
      order_id: number
    }>
  }

  const paidCents = order.payments?.reduce((sum, p) => sum + (p.success ? p.amount_cents : 0), 0) ?? 0
  const paidEgP = paidCents / 100
  const expectedCents = Math.round(expectedAmountEgP * 100)
  const ratio = paidEgP / expectedAmountEgP

  return {
    orderId: order.id,
    orderStatus: order.order_status,
    expectedAmountEgP,
    paidAmountEgP: paidEgP,
    paidRatio: ratio,
    paidCents,
    expectedCents,
    isDepositSufficient: ratio >= 0.5,  // 50% deposit rule
    isFullyPaid: ratio >= 1.0,
    payments: order.payments ?? [],
  }
}
