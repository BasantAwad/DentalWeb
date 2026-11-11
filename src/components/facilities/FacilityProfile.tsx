'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  getFacility,
  listCourses,
  type FacilityDetail,
  type CourseSummary,
} from '@/lib/platform-api'
import { TRAINING_TYPE_LABEL } from '@/lib/account-types'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { Reveal } from '@/components/ui/Reveal'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

type Status = 'loading' | 'ready' | 'not-found' | 'unavailable' | 'error'

/**
 * Facility profile.
 *
 * Everything on this page comes from the facility's own record — its
 * services, its resources, its opening hours and its rates. Nothing is
 * invented, and no rating or verification badge is shown because the
 * platform has no such process yet.
 */
export default function FacilityProfile({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const payload = await getFacility(slug)
        if (cancelled) return
        if (payload.backend === 'not_configured') {
          setStatus('unavailable')
          setMessage(payload.message ?? 'Facility details are not available yet.')
          return
        }
        if (!payload.facility) {
          setStatus('not-found')
          return
        }
        setFacility(payload.facility)
        setStatus('ready')

        // The courses this facility teaches. A failure here must not break
        // the profile — the section simply stays out of the way.
        try {
          const coursePayload = await listCourses({ clinicId: payload.facility.id })
          if (!cancelled) setCourses(coursePayload.courses ?? [])
        } catch {
          if (!cancelled) setCourses([])
        }
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(
          error instanceof Error ? error.message : 'This facility could not be loaded.',
        )
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
            Loading facility
          </h1>
          <p role="status" aria-live="polite" className="mt-3 text-[0.9375rem] text-slate-600">
            Fetching the facility's services, equipment and opening hours.
          </p>
        </div>
      </Section>
    )
  }

  if (status !== 'ready' || !facility) {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              {status === 'not-found' ? 'Facility not found' : 'This page is unavailable'}
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message ||
                'That facility does not exist, or it is not published. Browse the facilities that are.'}
            </p>
            <div className="mt-7">
              <ButtonLink href="/facilities" variant="primary">
                Browse facilities
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  const bookableServices = facility.services.filter((s) => s.isBookable !== false)
  const cheapest = [...bookableServices]
    .filter((s) => s.priceEgp > 0)
    .sort((a, b) => a.priceEgp - b.priceEgp)[0]
  const activeResources = facility.resources.filter((r) => r.isActive)

  // A service chosen in the explorer travels to the booking flow unchanged.
  const requestedService = searchParams.get('service')
  const bookHref = `/facilities/${facility.slug}/book${
    requestedService === 'chair' || requestedService === 'dummy_head'
      ? `?service=${requestedService}`
      : ''
  }`

  return (
    <>
      {/* ── Identity ───────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pt-32 md:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 80% at 22% 8%, rgba(47,119,114,0.22) 0%, rgba(32,37,34,0) 62%)',
          }}
        />

        <div className="page relative">
          {/* Breadcrumb */}
          <Breadcrumb
            tone="dark"
            items={[
              { href: '/', label: 'Home' },
              { href: '/facilities', label: 'Facilities' },
              { href: `/facilities/${facility.slug}`, label: facility.name },
            ]}
          />

          <div className="mt-8 grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                {facility.name}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-[0.9375rem] text-porcelain-100/60">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {[facility.address, facility.city].filter(Boolean).join(', ') ||
                  'Location published on request'}
              </p>
              {facility.description ? (
                <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-porcelain-100/70">
                  {facility.description}
                </p>
              ) : null}
            </div>

            {/* Rates */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="border-l border-white/12 pl-6">
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-porcelain-100/45">
                  From
                </p>
                <p className="tnum mt-2 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.03em]">
                  {cheapest ? `${cheapest.priceEgp} EGP` : '—'}
                </p>
                <p className="mt-1.5 text-[0.875rem] text-porcelain-100/55">
                  per hour · {facility.depositPct}% deposit
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Hero media ─────────────────────────────────────────────── */}
      {facility.coverImageUrl ? (
        <Section theme="graphite" className="relative overflow-hidden !py-0">
          <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden md:h-[52vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={facility.coverImageUrl}
              alt={`${facility.name} — facility`}
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(32,37,34,0.35) 0%, rgba(32,37,34,0) 30%, rgba(32,37,34,0.85) 100%)',
              }}
            />
          </div>
        </Section>
      ) : null}

      {/* ── Content ────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-16 md:py-24">
          <div className="grid-12 gap-y-14">
            {/* Main column */}
            <div className="col-span-12 lg:col-span-7">
              {/* Services */}
              <section aria-labelledby="services-heading">
                <Eyebrow>Services and rates</Eyebrow>
                <h2
                  id="services-heading"
                  className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                >
                  What you can book here
                </h2>

                {bookableServices.length > 0 ? (
                  <ul className="mt-7">
                    {bookableServices.map((service) => (
                      <li
                        key={service.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-stone-300 py-5 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-[1.0625rem] font-semibold text-graphite-900">
                            {service.name}
                          </p>
                          {service.description ? (
                            <p className="mt-1 max-w-lg text-[0.875rem] leading-relaxed text-graphite-700">
                              {service.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="tnum shrink-0 text-[1.0625rem] font-semibold text-teal-700">
                          {service.priceEgp} EGP
                          <span className="ml-1 text-[0.8125rem] font-normal text-slate-600">
                            /{service.durationMinutes >= 60 ? 'hr' : `${service.durationMinutes} min`}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-[0.9375rem] text-slate-600">
                    This facility has not published a bookable service yet.
                  </p>
                )}
              </section>

              {/* Courses — only when this facility actually teaches them */}
              {courses.length > 0 ? (
                <section aria-labelledby="courses-heading" className="mt-16">
                  <Eyebrow>Courses</Eyebrow>
                  <h2
                    id="courses-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    Courses offered here
                  </h2>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-700">
                    Programmes this facility teaches — with their own schedule,
                    capacity and price.
                  </p>

                  <ul className="mt-7">
                    {courses.map((course, index) => (
                      <Reveal as="li" key={course.id} delay={index * 0.04}>
                        <article className="border-b border-stone-300 py-6 first:border-t">
                          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                {course.subject ? (
                                  <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-teal-700">
                                    {course.subject}
                                  </span>
                                ) : null}
                                <span className="text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                                  {TRAINING_TYPE_LABEL[course.trainingType]}
                                </span>
                              </div>

                              <h3 className="mt-2 font-display text-[1.125rem] font-semibold tracking-[-0.02em] text-graphite-900">
                                <Link
                                  href={`/courses/${course.slug}`}
                                  className="transition-colors hover:text-teal-700"
                                >
                                  {course.title}
                                </Link>
                              </h3>

                              {course.description ? (
                                <p className="mt-1.5 max-w-xl text-[0.875rem] leading-relaxed text-graphite-700">
                                  {course.description}
                                </p>
                              ) : null}

                              <p className="tnum mt-2 text-[0.8125rem] text-slate-600">
                                {new Date(course.startDt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                                {course.instructor ? ` · with ${course.instructor}` : ''}
                              </p>
                            </div>

                            <div className="flex flex-col items-start gap-1 sm:items-end">
                              <span className="tnum font-display text-[1.125rem] font-semibold text-graphite-900">
                                {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
                              </span>
                              <span
                                className={[
                                  'text-[0.75rem] font-semibold uppercase tracking-[0.08em]',
                                  course.registration.open
                                    ? 'text-teal-700'
                                    : 'text-slate-600',
                                ].join(' ')}
                              >
                                {course.registration.open
                                  ? `${course.seatsRemaining} seat${course.seatsRemaining === 1 ? '' : 's'} left`
                                  : (course.registration.reason ?? 'Registration closed')}
                              </span>
                              <Link
                                href={`/courses/${course.slug}`}
                                className="mt-1 text-[0.875rem] font-semibold text-graphite-900 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-teal-600"
                              >
                                Register
                              </Link>
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    ))}
                  </ul>

                  <div className="mt-7">
                    <ButtonLink href="/courses" variant="secondary" withArrow>
                      All courses on DentalWeb
                    </ButtonLink>
                  </div>
                </section>
              ) : null}

              {/* Equipment */}
              {activeResources.length > 0 ? (
                <section aria-labelledby="equipment-heading" className="mt-16">
                  <Eyebrow>Equipment</Eyebrow>
                  <h2
                    id="equipment-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    In the room
                  </h2>
                  <ul className="mt-7 grid gap-x-10 sm:grid-cols-2">
                    {activeResources.map((resource) => (
                      <li
                        key={resource.id}
                        className="border-t border-stone-300 py-4"
                      >
                        <p className="text-[0.9375rem] font-semibold text-graphite-900">
                          {resource.name}
                        </p>
                        {resource.description ? (
                          <p className="mt-1 text-[0.8125rem] leading-relaxed text-graphite-700">
                            {resource.description}
                          </p>
                        ) : null}
                        {resource.location ? (
                          <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                            {resource.location}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Hours */}
              {facility.hours.length > 0 ? (
                <section aria-labelledby="hours-heading" className="mt-16">
                  <Eyebrow>Opening hours</Eyebrow>
                  <h2
                    id="hours-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    When you can book
                  </h2>
                  <dl className="mt-7 grid gap-x-10 sm:grid-cols-2">
                    {facility.hours.map((entry) => (
                      <div
                        key={entry.weekday}
                        className="flex items-baseline justify-between gap-4 border-t border-stone-300 py-3.5"
                      >
                        <dt className="text-[0.9375rem] text-graphite-700">
                          {WEEKDAYS[entry.weekday] ?? `Day ${entry.weekday}`}
                        </dt>
                        <dd className="tnum text-[0.9375rem] font-medium text-graphite-900">
                          {entry.closed
                            ? 'Closed'
                            : `${entry.startTime?.slice(0, 5)} – ${entry.endTime?.slice(0, 5)}`}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-[0.8125rem] text-slate-600">
                    Times shown in the facility&rsquo;s local timezone ({facility.timezone}).
                  </p>
                </section>
              ) : null}

              {/* Contact */}
              <section aria-labelledby="contact-heading" className="mt-16">
                <Eyebrow>Contact</Eyebrow>
                <h2
                  id="contact-heading"
                  className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                >
                  Reach the facility
                </h2>
                <dl className="mt-7 space-y-3">
                  {facility.phone ? (
                    <div className="flex items-baseline gap-4">
                      <dt className="w-24 text-[0.8125rem] uppercase tracking-[0.1em] text-slate-600">
                        Phone
                      </dt>
                      <dd>
                        <a
                          href={`tel:${facility.phone}`}
                          className="tnum text-[0.9375rem] text-graphite-900 underline decoration-stone-300 underline-offset-4 transition-colors hover:decoration-teal-600"
                        >
                          {facility.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {facility.email ? (
                    <div className="flex items-baseline gap-4">
                      <dt className="w-24 text-[0.8125rem] uppercase tracking-[0.1em] text-slate-600">
                        Email
                      </dt>
                      <dd>
                        <a
                          href={`mailto:${facility.email}`}
                          className="text-[0.9375rem] text-graphite-900 underline decoration-stone-300 underline-offset-4 transition-colors hover:decoration-teal-600"
                        >
                          {facility.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {facility.address ? (
                    <div className="flex items-baseline gap-4">
                      <dt className="w-24 shrink-0 text-[0.8125rem] uppercase tracking-[0.1em] text-slate-600">
                        Address
                      </dt>
                      <dd className="text-[0.9375rem] text-graphite-900">
                        {facility.address}
                        {facility.city ? `, ${facility.city}` : ''}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </div>

            {/* Booking panel */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-[18px] border border-stone-300 bg-chalk p-6">
                  <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                    Booking
                  </p>
                  <p className="tnum mt-3 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
                    {cheapest ? `${cheapest.priceEgp} EGP` : '—'}
                    <span className="ml-1.5 text-[0.9375rem] font-normal text-slate-600">
                      /hour
                    </span>
                  </p>

                  <div className="mt-5">
                    <Rule />
                  </div>

                  <dl className="mt-5 space-y-2.5 text-[0.875rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Deposit</dt>
                      <dd className="tnum font-semibold text-teal-700">
                        {facility.depositPct}% of total
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Cancellation</dt>
                      <dd className="tnum font-medium text-graphite-900">
                        {facility.cancellationCutoffHours}h notice
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Confirmation</dt>
                      <dd className="text-right font-medium text-graphite-900">
                        On verified deposit
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <ButtonLink
                      href={bookHref}
                      variant="primary"
                      size="lg"
                      withArrow
                      className="w-full"
                    >
                      Check availability
                    </ButtonLink>
                  </div>

                  <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-600">
                    Availability is confirmed by the platform against the
                    facility&rsquo;s own schedule before any payment is taken.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
