'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAccountCourses, type AccountCourse } from '@/lib/platform-api'
import { ENROLLMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/lib/account-types'
import AccountShell from '@/components/account/AccountShell'
import { ButtonLink } from '@/components/ui/Button'

type Status = 'loading' | 'ready' | 'signed-out' | 'unavailable'
type Group = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

const GROUPS: { key: Group; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

/**
 * Course registration history.
 */
export default function AccountCourses() {
  const [courses, setCourses] = useState<AccountCourse[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [group, setGroup] = useState<Group>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const payload = await getAccountCourses()
        if (cancelled) return
        setCourses(payload.courses ?? [])
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
        setMessage(apiError.message ?? 'Your registrations could not be loaded.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <AccountShell title="My courses">
        <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
          Loading your registrations…
        </p>
      </AccountShell>
    )
  }

  if (status === 'signed-out') {
    return (
      <AccountShell title="Sign in to see your courses">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            Your course registrations are private to your account.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/auth/login" variant="primary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/courses" variant="secondary">
              Explore courses
            </ButtonLink>
          </div>
        </div>
      </AccountShell>
    )
  }

  if (status === 'unavailable') {
    return (
      <AccountShell title="My courses">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            {message ||
              'Registrations need a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
          </p>
        </div>
      </AccountShell>
    )
  }

  const visible = group === 'all' ? courses : courses.filter((c) => groupOf(c) === group)

  return (
    <AccountShell
      title="My courses"
      description="The courses you are registered for, and the sessions that make them up."
    >
      <div className="flex flex-wrap gap-2 border-b border-stone-300 pb-5">
        {GROUPS.map((option) => {
          const count =
            option.key === 'all' ? (counts.total ?? courses.length) : (counts[option.key] ?? 0)
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
            {courses.length === 0 ? 'No course registrations yet' : 'Nothing in this group'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-600">
            {courses.length === 0
              ? 'Courses and practical training programmes from dental facilities are a good place to start.'
              : 'Try another group to see the rest of your registrations.'}
          </p>
          {courses.length === 0 ? (
            <div className="mt-7">
              <ButtonLink href="/courses" variant="primary">
                Explore courses
              </ButtonLink>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2">
          {visible.map((course) => (
            <li key={course.enrollmentId} className="border-b border-stone-300 py-7">
              <article>
                <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="rounded-full border border-stone-300 bg-chalk px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-graphite-700">
                        {ENROLLMENT_STATUS_LABEL[course.status] ?? course.status}
                      </span>
                      {course.paymentStatus !== 'not_required' ? (
                        <span
                          className={[
                            'rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
                            course.paymentStatus === 'paid'
                              ? 'border-success/30 bg-success/10 text-success'
                              : 'border-warning/30 bg-warning/10 text-warning',
                          ].join(' ')}
                        >
                          {PAYMENT_STATUS_LABEL[course.paymentStatus] ??
                            course.paymentStatus}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-2.5 font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-graphite-900">
                      {course.courseSlug ? (
                        <Link
                          href={`/courses/${course.courseSlug}`}
                          className="transition-colors hover:text-teal-700"
                        >
                          {course.courseTitle}
                        </Link>
                      ) : (
                        course.courseTitle
                      )}
                    </h3>

                    <p className="mt-1 text-[0.8125rem] text-slate-600">
                      {[
                        course.facilityName,
                        course.instructor ? `with ${course.instructor}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>

                    <p className="tnum mt-2 text-[0.9375rem] text-graphite-900">
                      {formatDate(course.startDt)} – {formatDate(course.endDt)}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-slate-500">
                      Registered on{' '}
                      {new Date(course.registeredAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {course.paymentAmount > 0 ? (
                    <div className="text-right">
                      <p className="tnum font-display text-[1.125rem] font-semibold text-graphite-900">
                        {course.paymentAmount} EGP
                      </p>
                      <p className="mt-1 text-[0.75rem] text-slate-600">
                        {course.paymentStatus === 'paid'
                          ? 'paid'
                          : 'due on registration'}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Sessions */}
                {course.sessions.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Sessions
                    </p>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {course.sessions.map((session) => (
                        <li
                          key={session.id}
                          className="rounded-[12px] border border-stone-300 bg-chalk px-4 py-3"
                        >
                          <p className="text-[0.875rem] font-medium text-graphite-900">
                            {session.title}
                          </p>
                          <p className="tnum mt-1 text-[0.8125rem] text-slate-600">
                            {formatDate(session.startDatetime)}
                            {session.endDatetime
                              ? ` – ${formatTime(session.endDatetime)}`
                              : ''}
                          </p>
                          {session.location ? (
                            <p className="mt-0.5 text-[0.8125rem] text-slate-600">
                              {session.location}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  )
}

function groupOf(course: AccountCourse): Group {
  if (course.status === 'withdrawn' || course.status === 'cancelled') return 'cancelled'
  if (course.status === 'attended') return 'completed'
  const now = Date.now()
  if (course.endDt && new Date(course.endDt).getTime() < now) return 'completed'
  if (course.startDt && new Date(course.startDt).getTime() <= now) return 'ongoing'
  return 'upcoming'
}

function formatDate(value: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value: string): string {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
