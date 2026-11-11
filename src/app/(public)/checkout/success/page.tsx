'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type VerificationState =
  | { status: 'loading' }
  | { status: 'confirmed'; reference: string; deposit: number; balance: number }
  | { status: 'pending'; reference?: string; message: string }
  | { status: 'failed'; message: string }

/**
 * Post-payment return page.
 *
 * A browser redirect is NOT proof of payment. The booking status is read from
 * the backend, which only reports `confirmed` after a verified deposit
 * payment. Until then the page shows the reservation as awaiting payment.
 */
function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [state, setState] = useState<VerificationState>({ status: 'loading' })

  useEffect(() => {
    if (!bookingId) {
      setState({
        status: 'failed',
        message: 'No booking reference was provided for this payment.',
      })
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        if (!response.ok) {
          throw new Error('We could not read the booking status.')
        }
        const payload = await response.json()
        if (cancelled) return

        const booking = payload.booking
        const status = booking?.status

        if (status === 'confirmed') {
          setState({
            status: 'confirmed',
            reference: booking.reference ?? bookingId,
            deposit: Number(booking.deposit_paid_egp ?? 0),
            balance: Number(booking.balance_due_egp ?? 0),
          })
          return
        }

        setState({
          status: 'pending',
          reference: booking?.reference,
          message:
            status === 'held'
              ? 'Your deposit payment has not been verified yet. The reservation is on hold and will be confirmed once the payment is verified.'
              : 'Your reservation is not confirmed yet. If a deposit was taken, it is released once the hold expires.',
        })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'failed',
            message:
              error instanceof Error
                ? error.message
                : 'We could not verify the payment status.',
          })
        }
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  return (
    <div className="min-h-screen bg-porcelain-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-chalk rounded-[18px] border border-stone-300 p-8 text-center">
        {state.status === 'loading' ? (
          <>
            <div className="w-12 h-12 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-graphite-900">Verifying your payment</h1>
            <p className="text-sm text-slate-600 mt-2">
              We are checking the payment with the provider before confirming the
              reservation.
            </p>
          </>
        ) : state.status === 'confirmed' ? (
          <>
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-graphite-900">Reservation confirmed</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your deposit was verified and the resource is now reserved for you.
            </p>

            <dl className="mt-6 p-4 bg-porcelain-100 rounded-[12px] text-left text-sm space-y-2 border border-stone-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Booking reference</dt>
                <dd className="font-mono font-medium text-graphite-900 truncate">
                  {state.reference}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Deposit paid</dt>
                <dd className="font-semibold text-success tnum">{state.deposit} EGP</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Remaining balance</dt>
                <dd className="font-semibold text-graphite-900 tnum">{state.balance} EGP</dd>
              </div>
            </dl>
          </>
        ) : state.status === 'pending' ? (
          <>
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-warning"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-graphite-900">Payment not confirmed yet</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {state.message}
            </p>
            {state.reference ? (
              <p className="mt-4 text-xs text-slate-600">
                Reference <span className="font-mono text-graphite-900">{state.reference}</span>
              </p>
            ) : null}
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-danger"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-graphite-900">We could not verify this booking</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {state.message} No resource has been reserved. You can try the booking
              again, or contact the facility.
            </p>
          </>
        )}

        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center rounded-[12px] bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Explore services
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-[12px] border border-stone-300 px-5 text-sm font-medium text-graphite-900 transition-colors hover:bg-sage-100"
          >
            Sign in to view bookings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-porcelain-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Verifying your booking…</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
