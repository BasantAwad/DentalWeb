'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAccountBookings, type AccountBooking } from '@/lib/platform-api'
import { BOOKING_STATUS_LABEL } from '@/lib/account-types'
import AccountShell from '@/components/account/AccountShell'
import { StatusPill } from '@/components/account/AccountDashboard'
import { ButtonLink } from '@/components/ui/Button'

type Status = 'loading' | 'ready' | 'signed-out' | 'unavailable'
type Group = 'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled'

const GROUPS: { key: Group; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'pending', label: 'Pending payment' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

/**
 * Reservation history.
 *
 * Every reservation the signed-in customer has made, grouped by state.
 */
export default function AccountBookings() {
  const [bookings, setBookings] = useState<AccountBooking[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [group, setGroup] = useState<Group>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const payload = await getAccountBookings()
        if (cancelled) return
        setBookings(payload.bookings ?? [])
        setCounts(payload.counts ?? {})
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const apiError = err as { code?: string; message?: string }
        if (apiError.code === 'authentication_required') {
          setStatus('signed-out')
          return
        }
        setStatus('unavailable')
        setMessage(apiError.message ?? 'Your reservations could not be loaded.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <AccountShell title="My reservations">
        <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
          Loading your reservations…
        </p>
      </AccountShell>
    )
  }

  if (status === 'signed-out') {
    return (
      <AccountShell title="Sign in to see your reservations">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            Your reservation history is private to your account.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/auth/login" variant="primary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              Explore services
            </ButtonLink>
          </div>
        </div>
      </AccountShell>
    )
  }

  if (status === 'unavailable') {
    return (
      <AccountShell title="My reservations">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            {message ||
              'Reservations need a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
          </p>
        </div>
      </AccountShell>
    )
  }

  const visible = group === 'all' ? bookings : bookings.filter((b) => b.group === group)

  return (
    <AccountShell
      title="My reservations"
      description="Every reservation you have made, whether it is still ahead or already finished."
    >
      {/* Group filters */}
      <div className="flex flex-wrap gap-2 border-b border-stone-300 pb-5">
        {GROUPS.map((option) => {
          const count =
            option.key === 'all' ? (counts.total ?? bookings.length) : (counts[option.key] ?? 0)
          const active = group === option.key
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setGroup(option.key)}
              aria-pressed={active}
              className={[
                'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[0.8125rem] font-medium transition-colors duration-200',
                active
                  ? 'border-graphite-900 bg-graphite-900 text-porcelain-50'
                  : 'border-stone-300 bg-white text-graphite-700 hover:border-teal-600/50',
              ].join(' ')}
            >
              {option.label}
              <span className={active ? 'text-porcelain-50/60' : 'text-slate-500'}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-[16px] border border-dashed border-stone-300 bg-chalk/60 px-6 py-12 text-center">
          <p className="font-display text-[1.25rem] font-semibold text-graphite-900">
            {bookings.length === 0
              ? 'No reservations yet'
              : 'Nothing in this group'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-600">
            {bookings.length === 0
              ? 'When you reserve a dental chair or a phantom-head station it will appear here with its payment status.'
              : 'Try another group to see the rest of your reservations.'}
          </p>
          {bookings.length === 0 ? (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/services" variant="primary">
                Explore services
              </ButtonLink>
              <ButtonLink href="/services/phantom-head" variant="secondary">
                Phantom-head training
              </ButtonLink>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2">
          {visible.map((booking) => (
            <li key={booking.id} className="border-b border-stone-300 py-7">
              <BookingDetail booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  )
}

/**
 * One reservation, with everything the customer needs to act on it.
 */
function BookingDetail({ booking }: { booking: AccountBooking }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article>
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="tnum text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {booking.reference}
            </span>
            <StatusPill kind="reservation" status={booking.status} />
            {booking.paymentStatus !== 'not_required' ? (
              <span
                className={[
                  'rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
                  booking.paymentStatus === 'paid'
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-warning/30 bg-warning/10 text-warning',
                ].join(' ')}
              >
                {booking.paymentStatus === 'paid'
                  ? 'Deposit paid'
                  : 'Payment pending'}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-graphite-900">
            {booking.serviceName ?? 'Equipment reservation'}
          </h3>

          <p className="mt-1 text-[0.8125rem] text-slate-600">
            {booking.facilityName}
            {booking.facilityCity ? ` · ${booking.facilityCity}` : ''}
            {booking.stationName ? ` · ${booking.stationName}` : ''}
          </p>

          <p className="tnum mt-2 text-[0.9375rem] text-graphite-900">
            {formatDateTime(booking.startDt)} – {formatTime(booking.endDt)}
            <span className="ml-2 text-slate-600">
              {booking.durationHours % 1 === 0
                ? `${booking.durationHours}h`
                : `${booking.durationHours.toFixed(1)}h`}
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="tnum font-display text-[1.25rem] font-semibold text-graphite-900">
            {booking.totalEgp} EGP
          </p>
          <p className="tnum mt-1 text-[0.8125rem] text-slate-600">
            {booking.depositDueEgp} EGP deposit
            {booking.depositPaidEgp > 0
              ? ` · ${booking.depositPaidEgp} paid`
              : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] font-semibold text-teal-700 transition-colors hover:text-teal-600"
      >
        {expanded ? 'Hide details' : 'View details'}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded ? (
        <dl className="mt-5 grid gap-x-8 gap-y-4 rounded-[14px] border border-stone-300 bg-chalk p-5 sm:grid-cols-2">
          {[
            { term: 'Status', value: BOOKING_STATUS_LABEL[booking.status] ?? booking.status },
            { term: 'Payment status', value: paymentLabel(booking.paymentStatus) },
            { term: 'Hourly rate', value: `${booking.hourlyRateEgp} EGP` },
            { term: 'Total amount', value: `${booking.totalEgp} EGP` },
            { term: 'Deposit due', value: `${booking.depositDueEgp} EGP` },
            { term: 'Deposit paid', value: `${booking.depositPaidEgp} EGP` },
            ...(booking.paymentStatus !== 'not_required'
              ? [{ term: 'Remaining balance', value: `${booking.balanceDueEgp} EGP` }]
              : []),
            ...(booking.stationName
              ? [
                  { term: 'Station', value: booking.stationName },
                  ...(booking.roomName
                    ? [{ term: 'Room', value: booking.roomName }]
                    : []),
                ]
              : []),
            ...(booking.facilityAddress
              ? [{ term: 'Facility address', value: booking.facilityAddress }]
              : []),
            {
              term: 'Booked on',
              value: new Date(booking.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
            },
          ].map((row) => (
            <div key={row.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-slate-600">
                {row.term}
              </dt>
              <dd className="tnum mt-1 text-[0.875rem] font-medium text-graphite-900">
                {row.value}
              </dd>
            </div>
          ))}

          <div className="sm:col-span-2">
            <ButtonLink
              href={`/facilities/${booking.facilityId}`}
              variant="secondary"
              size="md"
            >
              Visit the facility
            </ButtonLink>
          </div>
        </dl>
      ) : null}
    </article>
  )
}

function paymentLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Payment pending'
    case 'failed':
      return 'Payment failed'
    case 'refunded':
      return 'Refunded'
    default:
      return 'No payment required'
  }
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
