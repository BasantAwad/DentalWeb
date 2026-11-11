'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getAccountOverview,
  getSession,
  type SessionUser,
} from '@/lib/platform-api'
import type { AccountActivity } from '@/lib/account-types'
import { BOOKING_STATUS_LABEL } from '@/lib/account-types'
import AccountShell from '@/components/account/AccountShell'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

interface Overview {
  counts: {
    reservations: number
    upcoming: number
    completed: number
    enrollments: number
    activeEnrollments: number
  }
  next: AccountActivity[]
  activity: AccountActivity[]
}

/**
 * The account dashboard.
 *
 * Every figure comes from the signed-in user's own records. There is no
 * placeholder data and no invented activity.
 */
export default function AccountDashboard() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'signed-out' | 'unavailable'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const session = await getSession()
        if (cancelled) return

        // A platform without a database is a different state from a visitor
        // who simply is not signed in, and it should not look like a login
        // problem.
        if (!session.backendConfigured) {
          setStatus('unavailable')
          setMessage(
            'Your account needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
          )
          return
        }

        if (!session.signedIn) {
          setStatus('signed-out')
          return
        }
        setUser(session.user)

        const data = await getAccountOverview()
        if (cancelled) return
        setOverview(data)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        const apiError = error as { code?: string; message?: string }
        if (apiError?.code === 'authentication_required') {
          setStatus('signed-out')
          return
        }
        setStatus('unavailable')
        setMessage(
          apiError?.message ?? 'Your account could not be loaded.',
        )
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <AccountShell title="Your dashboard">
        <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
          Loading your activity…
        </p>
      </AccountShell>
    )
  }

  if (status === 'signed-out') {
    return (
      <AccountShell
        title="Sign in to see your dashboard"
        description="Your reservations, course registrations and profile live behind your account."
      >
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            Sign in to see your upcoming reservations, your course registrations
            and everything you have booked.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/auth/login" variant="primary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/auth/register" variant="secondary">
              Create an account
            </ButtonLink>
          </div>
        </div>
      </AccountShell>
    )
  }

  if (status === 'unavailable') {
    return (
      <AccountShell title="Your dashboard">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            {message ||
              'Your account needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
          </p>
        </div>
      </AccountShell>
    )
  }

  const counts = overview?.counts
  const next = overview?.next ?? []
  const activity = overview?.activity ?? []

  return (
    <AccountShell
      title={`Welcome back, ${firstName(user?.name)}`}
      description="Everything you have booked, registered for or paid for on DentalWeb."
    >
      {/* Activity counts — a measured strip rather than a card wall */}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-7 border-y border-stone-300 py-7 sm:grid-cols-4">
        {[
          { term: 'Reservations', value: counts?.reservations ?? 0 },
          { term: 'Upcoming', value: counts?.upcoming ?? 0 },
          { term: 'Completed', value: counts?.completed ?? 0 },
          { term: 'Active courses', value: counts?.activeEnrollments ?? 0 },
        ].map((metric) => (
          <div key={metric.term}>
            <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
              {metric.term}
            </dt>
            <dd className="tnum mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Upcoming activities */}
      <section aria-labelledby="next-heading" className="mt-12">
        <h2
          id="next-heading"
          className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Coming up
        </h2>

        {next.length === 0 ? (
          <div className="mt-5 rounded-[16px] border border-dashed border-stone-300 bg-chalk/60 px-6 py-10 text-center">
            <p className="text-[0.9375rem] text-graphite-700">
              Nothing is scheduled. Explore a facility to reserve a chair or a
              phantom-head station.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/services" variant="primary" size="md">
                Explore services
              </ButtonLink>
              <ButtonLink href="/courses" variant="secondary" size="md">
                Explore courses
              </ButtonLink>
            </div>
          </div>
        ) : (
          <ul className="mt-5">
            {next.map((item) => (
              <li key={item.id} className="border-b border-stone-300 first:border-t">
                <Link
                  href={item.href}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-4 transition-colors hover:bg-sage-100/60"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-semibold text-graphite-900 transition-colors group-hover:text-teal-700">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-slate-600">
                      {item.subtitle}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-4">
                    <span className="tnum text-[0.8125rem] text-slate-600">
                      {new Date(item.occurredAt).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <StatusPill kind={item.kind} status={item.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activity timeline */}
      <section aria-labelledby="activity-heading" className="mt-14">
        <h2
          id="activity-heading"
          className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Recent activity
        </h2>

        {activity.length === 0 ? (
          <p className="mt-5 text-[0.9375rem] text-slate-600">
            Your activity will appear here as you make reservations and course
            registrations.
          </p>
        ) : (
          <ol className="mt-6 space-y-0">
            {activity.map((item, index) => (
              <Reveal as="li" key={item.id} delay={index * 0.03}>
                <div className="flex gap-5 border-l border-stone-300 pb-7 pl-6">
                  <span
                    aria-hidden="true"
                    className={[
                      'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                      item.kind === 'course' ? 'bg-sage-200' : 'bg-teal-600',
                    ].join(' ')}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] font-medium text-graphite-900">
                      {item.title}
                    </p>
                    <p className="text-[0.8125rem] text-slate-600">{item.subtitle}</p>
                    <p className="tnum mt-1 text-[0.75rem] text-slate-400">
                      {new Date(item.occurredAt).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        )}
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-heading" className="mt-14">
        <h2
          id="quick-heading"
          className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Book something
        </h2>
        <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            { href: '/services', label: 'Explore services', detail: 'Chair rental, phantom-head training and courses' },
            { href: '/services/dental-chair', label: 'Book a dental chair', detail: '150 EGP per hour' },
            { href: '/services/phantom-head', label: 'Find phantom-head training', detail: '100 EGP per hour' },
            { href: '/courses', label: 'Explore courses', detail: 'Practical training programmes' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group border-t border-stone-300 py-4 transition-colors hover:border-teal-600"
            >
              <span className="block text-[0.9375rem] font-semibold text-graphite-900 transition-colors group-hover:text-teal-700">
                {action.label}
              </span>
              <span className="mt-0.5 block text-[0.8125rem] text-slate-600">
                {action.detail}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </AccountShell>
  )
}

/**
 * A status pill. Never colour alone — the label carries the meaning.
 */
export function StatusPill({
  kind,
  status,
}: {
  kind: 'reservation' | 'course'
  status: string
}) {
  const label =
    kind === 'reservation'
      ? (BOOKING_STATUS_LABEL[status] ?? status)
      : status.charAt(0).toUpperCase() + status.slice(1)

  const tone =
    status === 'confirmed' || status === 'paid' || status === 'attended'
      ? 'border-success/30 bg-success/10 text-success'
      : status === 'pending' || status === 'held' || status === 'registered'
        ? 'border-warning/30 bg-warning/10 text-warning'
        : status === 'cancelled' || status === 'withdrawn' || status === 'no_show'
          ? 'border-stone-300 bg-stone-200/60 text-slate-600'
          : 'border-stone-300 bg-stone-200/60 text-slate-600'

  return (
    <span
      className={[
        'shrink-0 rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
        tone,
      ].join(' ')}
    >
      {label}
    </span>
  )
}

function firstName(name?: string | null): string {
  if (!name) return 'there'
  return name.trim().split(/\s+/)[0] || 'there'
}
