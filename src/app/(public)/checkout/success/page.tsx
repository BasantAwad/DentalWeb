'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-border shadow-sm p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-navy">Booking Confirmed!</h1>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">
          Your deposit has been received and your booking is confirmed. You&apos;ll receive a confirmation with all the details.
        </p>

        <div className="mt-6 p-4 bg-cream rounded-lg text-left text-sm space-y-2 border border-border">
          <div className="flex justify-between">
            <span className="text-muted">Booking reference</span>
            <span className="font-mono font-medium text-navy">
              #{searchParams.get('bookingId')?.slice(0, 12) ?? '—'}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Deposit paid</span>
            <span className="font-semibold text-green-700">
              {searchParams.get('deposit') ?? '—'} EGP
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Balance at clinic</span>
            <span className="font-semibold text-navy">
              {searchParams.get('balance') ?? '—'} EGP
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-charcoal transition-colors"
          >
            Sign in to view bookings
          </Link>
          <Link
            href="/chair-rental"
            className="px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-cream transition-colors"
          >
            Book another appointment
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-aqua border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">Verifying your booking…</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
