'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  getFacility,
  getAvailability,
  quoteBooking,
  type FacilityDetail,
  type AvailabilitySlot,
  type BookingQuote,
} from '@/lib/platform-api'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'

/**
 * The booking experience.
 *
 * A focused flow rather than a section: service → date → time → duration →
 * review → deposit, inside a facility that was already chosen. When the visitor
 * arrived from a service page, that service arrives preselected via
 * `initialService` so the journey they started is the journey they continue.
 * Availability comes from the backend for the chosen resource and date, and the
 * price is quoted by the backend, never calculated in the browser.
 */

type Step = 'service' | 'schedule' | 'review'

/**
 * A service the visitor may have already chosen, expressed as the resource
 * type that provides it. Mirrors the `?service=` filter of the facility
 * explorer, so a link can carry the choice from list to booking untouched.
 */
export type PreselectedService = 'chair' | 'dummy_head'

interface Draft {
  serviceId: string | null
  resourceId: string | null
  date: string | null
  startHour: string | null
  durationHours: number
}

const STEP_ORDER: Step[] = ['service', 'schedule', 'review']
const STEP_LABELS: Record<Step, string> = {
  service: 'Service',
  schedule: 'Date and time',
  review: 'Review',
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function BookingFlow({
  slug,
  initialService = null,
  initialResourceId = null,
}: {
  slug: string
  /** A service chosen before arrival, e.g. from a service page or the explorer. */
  initialService?: PreselectedService | null
  /** A resource chosen before arrival, e.g. a station picked on the room plan. */
  initialResourceId?: string | null
}) {
  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [facilityStatus, setFacilityStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const [step, setStep] = useState<Step>('service')
  const [draft, setDraft] = useState<Draft>({
    serviceId: null,
    resourceId: null,
    date: null,
    startHour: null,
    durationHours: 1,
  })

  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [slotsStatus, setSlotsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [quote, setQuote] = useState<BookingQuote | null>(null)
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  // ── Facility ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const payload = await getFacility(slug)
        if (cancelled) return
        if (!payload.facility) {
          setFacilityStatus('error')
          setMessage('That facility could not be found.')
          return
        }
        setFacility(payload.facility)
        setFacilityStatus('ready')
        // Preselect the service the visitor came for; otherwise the first
        // bookable service. The choice is never invented — if the facility
        // does not offer the requested resource type, the list decides.
        const bookable = payload.facility.services.filter((s) => s.isBookable !== false)
        const wantedType =
          initialService === 'chair'
            ? 'chair'
            : initialService === 'dummy_head'
              ? 'dummy_head'
              : null
        const preferred = wantedType
          ? bookable.find((s) => s.resourceType === wantedType)
          : undefined
        const first = preferred ?? bookable[0]
        // A station picked on the room plan arrives as its backend resource
        // id. It is accepted only when the facility still owns it, it is
        // active, and it matches the service's resource type — otherwise the
        // flow starts with no resource and the visitor chooses one.
        const wantedResource =
          initialResourceId && first
            ? payload.facility.resources.find(
                (r) =>
                  r.id === initialResourceId &&
                  r.isActive &&
                  (first.resourceType === null ||
                    r.type === first.resourceType),
              )
            : undefined
        if (first) {
          setDraft((current) => ({
            ...current,
            serviceId: first.id,
            resourceId: wantedResource ? wantedResource.id : current.resourceId,
          }))
        }
      } catch (error) {
        if (cancelled) return
        setFacilityStatus('error')
        setMessage(error instanceof Error ? error.message : 'This facility could not be loaded.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug, initialService, initialResourceId])

  // ── Availability ─────────────────────────────────────────────────
  const loadAvailability = useCallback(async () => {
    if (!facility || !draft.resourceId || !draft.date) return
    setSlotsStatus('loading')
    try {
      const response = await getAvailability({
        clinicId: facility.id,
        resourceId: draft.resourceId,
        date: draft.date,
      })
      setSlots(response.slots ?? [])
      setSlotsStatus('ready')
    } catch {
      setSlots([])
      setSlotsStatus('error')
    }
  }, [facility, draft.resourceId, draft.date])

  useEffect(() => {
    void loadAvailability()
  }, [loadAvailability])

  // ── Quote ────────────────────────────────────────────────────────
  const refreshQuote = useCallback(async () => {
    if (!facility || !draft.serviceId || !draft.date || !draft.startHour) {
      setQuote(null)
      return
    }
    setQuoteStatus('loading')
    try {
      const start = new Date(`${draft.date}T${draft.startHour}:00`)
      const end = new Date(start.getTime() + draft.durationHours * 3_600_000)
      const response = await quoteBooking({
        facilityId: facility.id,
        serviceId: draft.serviceId,
        resourceId: draft.resourceId ?? undefined,
        startDt: start.toISOString(),
        endDt: end.toISOString(),
      })
      setQuote(response.quote)
      setQuoteStatus('idle')
    } catch {
      setQuote(null)
      setQuoteStatus('error')
    }
  }, [facility, draft.serviceId, draft.resourceId, draft.date, draft.startHour, draft.durationHours])

  useEffect(() => {
    void refreshQuote()
  }, [refreshQuote])

  const service = useMemo(
    () => facility?.services.find((s) => s.id === draft.serviceId) ?? null,
    [facility, draft.serviceId],
  )

  const eligibleResources = useMemo(() => {
    if (!facility || !draft.serviceId) return []
    const resourceType =
      service?.resourceType === 'chair'
        ? 'chair'
        : service?.resourceType === 'dummy_head'
          ? 'dummy_head'
          : null
    if (!resourceType) return []
    return facility.resources.filter(
      (r) => r.isActive && r.type === resourceType,
    )
  }, [facility, draft.serviceId, service])

  const selectedResource = useMemo(
    () => facility?.resources.find((r) => r.id === draft.resourceId) ?? null,
    [facility, draft.resourceId],
  )

  // ── Derived ──────────────────────────────────────────────────────
  const startTime = draft.startHour
  const endTime = useMemo(() => {
    if (!draft.startHour) return null
    const [hour, minute] = draft.startHour.split(':').map(Number)
    const total = hour * 60 + minute + draft.durationHours * 60
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }, [draft.startHour, draft.durationHours])

  /** A start time is only offered when the whole duration is free. */
  const durationFits = useCallback(
    (slot: AvailabilitySlot): boolean => {
      if (!slot.available) return false
      const [hour] = slot.hour.split(':').map(Number)
      return hour + draft.durationHours <= 23
    },
    [draft.durationHours],
  )

  const maxDuration = 8

  if (facilityStatus === 'loading') {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
            Loading booking
          </h1>
          <p role="status" aria-live="polite" className="mt-3 text-[0.9375rem] text-slate-600">
            Fetching the facility's services and resources.
          </p>
        </div>
      </Section>
    )
  }

  if (facilityStatus === 'error' || !facility) {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              This facility is not available
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message || 'The facility could not be loaded.'}
            </p>
            <div className="mt-7">
              <ButtonLink href="/services" variant="primary">
                Back to services
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden pt-28 md:pt-36">
        <div className="page">
          <Breadcrumb
            items={[
              { href: '/facilities', label: 'Facilities' },
              { href: `/facilities/${facility.slug}`, label: facility.name },
              { href: `/facilities/${facility.slug}/book`, label: 'Book' },
            ]}
          />

          <div className="mt-7 grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Book a resource</Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
                Reserve time at {facility.name}.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
                Choose a service, pick a time that works, and pay a{' '}
                {facility.depositPct}% deposit to confirm.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Flow ───────────────────────────────────────────────────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-14 md:py-20">
          {/* Step indicator */}
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Booking steps">
            {STEP_ORDER.map((s, index) => {
              const done = index < stepIndex
              const active = index === stepIndex
              return (
                <li key={s} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (index <= stepIndex) setStep(s)
                    }}
                    disabled={index > stepIndex}
                    aria-current={active ? 'step' : undefined}
                    className={[
                      'flex items-center gap-2 text-[0.8125rem] font-medium transition-colors duration-200',
                      active
                        ? 'text-graphite-900'
                        : done
                          ? 'text-teal-700 hover:text-teal-600'
                          : 'text-slate-400',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'grid h-6 w-6 place-items-center rounded-full border text-[0.6875rem] font-semibold',
                        active
                          ? 'border-graphite-900 bg-graphite-900 text-porcelain-50'
                          : done
                            ? 'border-teal-600 bg-teal-600 text-white'
                            : 'border-stone-300 text-slate-400',
                      ].join(' ')}
                    >
                      {done ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    {STEP_LABELS[s]}
                  </button>
                  {index < STEP_ORDER.length - 1 ? (
                    <span aria-hidden="true" className="h-px w-8 bg-stone-300" />
                  ) : null}
                </li>
              )
            })}
          </ol>

          <div className="mt-10 grid-12 gap-y-12">
            {/* Main flow */}
            <div className="col-span-12 lg:col-span-7">
              {/* ── Step 1: service ─────────────────────────────────── */}
              {step === 'service' ? (
                <section aria-labelledby="step-service">
                  <h2 id="step-service" className="font-display text-[1.5rem] font-semibold tracking-[-0.02em]">
                    What would you like to book?
                  </h2>
                  <ul className="mt-6 space-y-3">
                    {facility.services
                      .filter((s) => s.isBookable !== false)
                      .map((option) => {
                        const selected = draft.serviceId === option.id
                        return (
                          <li key={option.id}>
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  serviceId: option.id,
                                  resourceId: null,
                                  startHour: null,
                                }))
                              }
                              aria-pressed={selected}
                              className={[
                                'flex w-full flex-wrap items-center justify-between gap-4 rounded-[12px] border px-5 py-4 text-left transition-all duration-200',
                                selected
                                  ? 'border-teal-600 bg-teal-100'
                                  : 'border-stone-300 bg-white hover:border-teal-600/50 hover:bg-sage-100',
                              ].join(' ')}
                            >
                              <span className="min-w-0">
                                <span className="block font-display text-[1.0625rem] font-semibold text-graphite-900">
                                  {option.name}
                                </span>
                                {option.description ? (
                                  <span className="mt-1 block text-[0.875rem] leading-relaxed text-graphite-700">
                                    {option.description}
                                  </span>
                                ) : null}
                              </span>
                              <span className="tnum shrink-0 text-[1.0625rem] font-semibold text-teal-700">
                                {option.priceEgp} EGP
                                <span className="ml-1 text-[0.8125rem] font-normal text-slate-600">
                                  /{option.durationMinutes >= 60 ? 'hr' : `${option.durationMinutes} min`}
                                </span>
                              </span>
                            </button>
                          </li>
                        )
                      })}
                  </ul>

                  {/* Resource */}
                  {eligibleResources.length > 1 ? (
                    <div className="mt-8">
                      <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        Choose a resource
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {eligibleResources.map((resource) => {
                          const selected = draft.resourceId === resource.id
                          return (
                            <button
                              key={resource.id}
                              type="button"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  resourceId: resource.id,
                                  startHour: null,
                                }))
                              }
                              aria-pressed={selected}
                              className={[
                                'rounded-[10px] border px-4 py-2.5 text-[0.875rem] font-medium transition-colors duration-200',
                                selected
                                  ? 'border-teal-700 bg-teal-700 text-white'
                                  : 'border-stone-300 bg-white text-graphite-700 hover:border-teal-600/50 hover:bg-sage-100',
                              ].join(' ')}
                            >
                              {resource.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : eligibleResources.length === 1 ? (
                    <p className="mt-8 text-[0.875rem] text-slate-600">
                      Resource:{' '}
                      <span className="font-medium text-graphite-900">
                        {eligibleResources[0].name}
                      </span>
                    </p>
                  ) : null}

                  <div className="mt-9">
                    <ButtonLink
                      href="#"
                      variant="primary"
                      size="lg"
                      withArrow
                      onClick={(event) => {
                        event.preventDefault()
                        setStep('schedule')
                      }}
                      className="cursor-pointer"
                    >
                      Continue
                    </ButtonLink>
                  </div>
                </section>
              ) : null}

              {/* ── Step 2: schedule ────────────────────────────────── */}
              {step === 'schedule' ? (
                <section aria-labelledby="step-schedule">
                  <h2 id="step-schedule" className="font-display text-[1.5rem] font-semibold tracking-[-0.02em]">
                    Pick a date, time and duration
                  </h2>

                  {/* Date */}
                  <div className="mt-6">
                    <label
                      htmlFor="booking-date"
                      className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate-600"
                    >
                      Date
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from({ length: 14 }).map((_, index) => {
                        const iso = addDaysIso(todayIso(), index)
                        const selected = draft.date === iso
                        return (
                          <button
                            key={iso}
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                date: iso,
                                startHour: null,
                              }))
                            }
                            aria-pressed={selected}
                            className={[
                              'min-w-[4.5rem] rounded-[10px] border px-3 py-2.5 text-center transition-colors duration-200',
                              selected
                                ? 'border-teal-700 bg-teal-700 text-white'
                                : 'border-stone-300 bg-white text-graphite-700 hover:border-teal-600/50 hover:bg-sage-100',
                            ].join(' ')}
                          >
                            <span className="block text-[0.6875rem] uppercase tracking-[0.08em] opacity-70">
                              {new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
                                weekday: 'short',
                              })}
                            </span>
                            <span className="tnum block text-[0.9375rem] font-semibold">
                              {new Date(`${iso}T00:00:00`).getDate()}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="mt-8">
                    <label
                      htmlFor="booking-duration"
                      className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate-600"
                    >
                      Duration
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2" id="booking-duration">
                      {Array.from({ length: maxDuration }).map((_, index) => {
                        const hours = index + 1
                        const selected = draft.durationHours === hours
                        return (
                          <button
                            key={hours}
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                durationHours: hours,
                                startHour: null,
                              }))
                            }
                            aria-pressed={selected}
                            className={[
                              'tnum rounded-[10px] border px-4 py-2.5 text-[0.875rem] font-medium transition-colors duration-200',
                              selected
                                ? 'border-teal-700 bg-teal-700 text-white'
                                : 'border-stone-300 bg-white text-graphite-700 hover:border-teal-600/50 hover:bg-sage-100',
                            ].join(' ')}
                          >
                            {hours}h
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="mt-8">
                    <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      Available start times
                    </p>

                    {!draft.date ? (
                      <p className="mt-3 text-[0.9375rem] text-slate-600">
                        Choose a date to see available times.
                      </p>
                    ) : slotsStatus === 'loading' ? (
                      <p role="status" aria-live="polite" className="mt-3 text-[0.9375rem] text-slate-600">
                        Checking availability…
                      </p>
                    ) : slotsStatus === 'error' ? (
                      <p className="mt-3 text-[0.9375rem] text-danger">
                        Availability could not be loaded. Please try again.
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="mt-3 text-[0.9375rem] text-slate-600">
                        No times are published for this date.
                      </p>
                    ) : (
                      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {slots.map((slot) => {
                          const usable = durationFits(slot)
                          const selected = draft.startHour === slot.hour
                          return (
                            <button
                              key={slot.hour}
                              type="button"
                              disabled={!usable}
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  startHour: slot.hour,
                                }))
                              }
                              aria-pressed={selected}
                              title={
                                usable
                                  ? undefined
                                  : slot.available
                                    ? 'Not enough consecutive time for this duration'
                                    : slot.reason === 'maintenance'
                                      ? 'Unavailable'
                                      : 'Reserved'
                              }
                              className={[
                                'tnum relative rounded-[10px] border px-3 py-2.5 text-[0.875rem] font-medium transition-colors duration-200',
                                selected
                                  ? 'border-teal-700 bg-teal-700 text-white'
                                  : usable
                                    ? 'border-stone-300 bg-white text-graphite-700 hover:border-teal-600/50 hover:bg-sage-100'
                                    : 'cursor-not-allowed border-stone-200 bg-stone-200/40 text-slate-400',
                              ].join(' ')}
                            >
                              {slot.hour}
                              {!usable ? (
                                <span className="mt-0.5 block text-[0.625rem] uppercase tracking-[0.08em] opacity-70">
                                  {slot.available ? 'Too long' : 'Reserved'}
                                </span>
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <ButtonLink
                      href="#"
                      variant="secondary"
                      size="lg"
                      onClick={(event) => {
                        event.preventDefault()
                        setStep('service')
                      }}
                      className="cursor-pointer"
                    >
                      Back
                    </ButtonLink>
                    <ButtonLink
                      href="#"
                      variant="primary"
                      size="lg"
                      withArrow
                      onClick={(event) => {
                        event.preventDefault()
                        setStep('review')
                      }}
                      className="cursor-pointer"
                    >
                      Review reservation
                    </ButtonLink>
                  </div>
                </section>
              ) : null}

              {/* ── Step 3: review ──────────────────────────────────── */}
              {step === 'review' ? (
                <section aria-labelledby="step-review">
                  <h2 id="step-review" className="font-display text-[1.5rem] font-semibold tracking-[-0.02em]">
                    Review your reservation
                  </h2>

                  <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
                    {[
                      { term: 'Facility', value: facility.name },
                      { term: 'Service', value: service?.name ?? '—' },
                      {
                        term: 'Resource',
                        value: selectedResource?.name ?? 'Assigned by the facility',
                      },
                      {
                        term: 'Date',
                        value: draft.date ? formatDate(draft.date) : '—',
                      },
                      {
                        term: 'Time',
                        value: startTime && endTime ? `${startTime} – ${endTime}` : '—',
                      },
                      {
                        term: 'Duration',
                        value: `${draft.durationHours} hour${draft.durationHours === 1 ? '' : 's'}`,
                      },
                    ].map((row) => (
                      <div
                        key={row.term}
                        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
                      >
                        <dt className="text-[0.9375rem] text-slate-600">{row.term}</dt>
                        <dd className="text-[0.9375rem] font-medium text-graphite-900">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Price — always from the backend */}
                  <div className="mt-8 rounded-[14px] border border-stone-300 bg-porcelain-100 p-6">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Price breakdown
                    </p>

                    {quoteStatus === 'loading' ? (
                      <p role="status" aria-live="polite" className="mt-4 text-[0.9375rem] text-slate-600">
                        Calculating…
                      </p>
                    ) : quoteStatus === 'error' || !quote ? (
                      <p className="mt-4 text-[0.9375rem] text-danger">
                        The price could not be calculated. Please go back and try again.
                      </p>
                    ) : (
                      <dl className="mt-4 space-y-2.5">
                        <div className="flex justify-between gap-4">
                          <dt className="text-[0.9375rem] text-slate-600">
                            Hourly rate × {quote.durationHours}h
                          </dt>
                          <dd className="tnum text-[0.9375rem] font-medium text-graphite-900">
                            {quote.hourlyRateEgp} EGP/hr
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-stone-300 pt-2.5">
                          <dt className="text-[0.9375rem] font-semibold text-graphite-900">
                            Total booking amount
                          </dt>
                          <dd className="tnum text-[1.25rem] font-semibold text-graphite-900">
                            {quote.totalEgp} EGP
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[0.9375rem] text-slate-600">
                            Deposit required ({quote.depositPct}%)
                          </dt>
                          <dd className="tnum text-[1.125rem] font-semibold text-teal-700">
                            {quote.depositEgp} EGP
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[0.9375rem] text-slate-600">
                            Remaining balance
                          </dt>
                          <dd className="tnum text-[0.9375rem] font-medium text-graphite-900">
                            {quote.remainingEgp} EGP
                          </dd>
                        </div>
                      </dl>
                    )}

                    <p className="mt-5 border-t border-stone-300 pt-4 text-[0.8125rem] leading-relaxed text-slate-600">
                      The deposit confirms the reservation. The remaining balance
                      is settled with the facility according to its policy — the
                      platform does not collect it online.
                    </p>
                  </div>

                  {submitError ? (
                    <p role="alert" className="mt-5 text-[0.9375rem] text-danger">
                      {submitError}
                    </p>
                  ) : null}

                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink
                      href="#"
                      variant="secondary"
                      size="lg"
                      onClick={(event) => {
                        event.preventDefault()
                        setStep('schedule')
                      }}
                      className="cursor-pointer"
                    >
                      Back
                    </ButtonLink>
                    <ButtonLink
                      href="/auth/register"
                      variant="primary"
                      size="lg"
                      withArrow
                    >
                      {quote ? `Continue to deposit — ${quote.depositEgp} EGP` : 'Continue to deposit'}
                    </ButtonLink>
                  </div>

                  <p className="mt-4 text-[0.8125rem] text-slate-600">
                    You will be asked to sign in before the deposit is taken. The
                    reservation is confirmed only once the payment has been
                    verified.
                  </p>
                </section>
              ) : null}
            </div>

            {/* Summary */}
            <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Your reservation
                </p>
                <dl className="mt-5 space-y-3 text-[0.875rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Facility</dt>
                    <dd className="text-right font-medium text-graphite-900">
                      {facility.name}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Service</dt>
                    <dd className="text-right font-medium text-graphite-900">
                      {service?.name ?? '—'}
                    </dd>
                  </div>
                  {draft.date ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Date</dt>
                      <dd className="text-right font-medium text-graphite-900">
                        {formatDate(draft.date)}
                      </dd>
                    </div>
                  ) : null}
                  {startTime && endTime ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Time</dt>
                      <dd className="tnum text-right font-medium text-graphite-900">
                        {startTime} – {endTime}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">Duration</dt>
                    <dd className="tnum text-right font-medium text-graphite-900">
                      {draft.durationHours}h
                    </dd>
                  </div>
                </dl>

                {quote ? (
                  <div className="mt-6 border-t border-stone-300 pt-5">
                    <div className="flex justify-between gap-4">
                      <span className="text-[0.875rem] text-slate-600">Total</span>
                      <span className="tnum text-[1.125rem] font-semibold text-graphite-900">
                        {quote.totalEgp} EGP
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between gap-4">
                      <span className="text-[0.875rem] text-slate-600">Deposit due now</span>
                      <span className="tnum text-[1rem] font-semibold text-teal-700">
                        {quote.depositEgp} EGP
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  )
}
