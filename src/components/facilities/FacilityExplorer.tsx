'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { listFacilities, type FacilitySummary } from '@/lib/platform-api'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const SERVICE_FILTERS = [
  { key: '', label: 'All services' },
  { key: 'chair', label: 'Dental chair' },
  { key: 'dummy_head', label: 'Phantom head' },
]

type Status = 'loading' | 'ready' | 'empty' | 'unavailable' | 'error'

/**
 * Facility discovery.
 *
 * Facilities come from the backend. Nothing is fabricated: when the platform
 * has nothing published, or the backend is unreachable, the page says exactly
 * that rather than showing placeholder cards.
 */
export default function FacilityExplorer() {
  const searchParams = useSearchParams()
  const [facilities, setFacilities] = useState<FacilitySummary[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [service, setService] = useState(searchParams.get('service') ?? '')
  const [city, setCity] = useState(searchParams.get('city') ?? '')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const payload = await listFacilities({ q: query, service, city })
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Facility listings are not available yet.')
        setFacilities([])
        return
      }
      const list = payload.facilities ?? []
      setFacilities(list)
      setStatus(list.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error ? error.message : 'Facilities could not be loaded.',
      )
      setFacilities([])
    }
  }, [query, service, city])

  useEffect(() => {
    void load()
  }, [load])

  // Keep the URL shareable.
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (service) params.set('service', service)
    if (city) params.set('city', city)
    const next = params.toString()
    window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname)
  }, [query, service, city])

  const cities = useMemo(() => {
    const set = new Set(
      facilities.map((f) => f.city).filter((c) => c && c.length > 0),
    )
    return Array.from(set).sort()
  }, [facilities])

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-44">
        <div className="page">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Facilities</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
                Find your practice
                <br />
                space.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                Real training facilities, with their own rooms, equipment and
                opening hours. Check what is actually bookable before you pay.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Search ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative pb-10">
        <div className="page">
          <div className="grid-12 items-center gap-y-4">
            <div className="col-span-12 lg:col-span-5">
              <label htmlFor="facility-search" className="sr-only">
                Search facilities
              </label>
              <div className="relative">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  id="facility-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, city or service"
                  className="h-12 w-full rounded-[10px] border border-stone-300 bg-white pl-11 pr-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30"
                />
              </div>
            </div>

            <div className="col-span-12 flex flex-wrap items-center gap-2 lg:col-span-4">
              {SERVICE_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setService(filter.key)}
                  aria-pressed={service === filter.key}
                  className={[
                    'h-10 rounded-full border px-4 text-[0.875rem] font-medium transition-colors duration-200',
                    service === filter.key
                      ? 'border-teal-700 bg-teal-700 text-white'
                      : 'border-stone-300 bg-transparent text-graphite-700 hover:border-teal-600/50 hover:bg-sage-100',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="col-span-12 lg:col-span-3 lg:text-right">
              {cities.length > 0 ? (
                <>
                  <label htmlFor="city-filter" className="sr-only">
                    Filter by city
                  </label>
                  <select
                    id="city-filter"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
                  >
                    <option value="">All cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Results ────────────────────────────────────────────────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          {status === 'loading' ? (
            <p role="status" aria-live="polite" className="py-20 text-center text-[0.9375rem] text-slate-600">
              Loading facilities…
            </p>
          ) : status === 'unavailable' || status === 'error' ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <p className="font-display text-[1.5rem] font-semibold text-graphite-900">
                {status === 'unavailable'
                  ? 'Listings are not connected yet'
                  : 'Listings could not be loaded'}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                {message}
              </p>
              <div className="mt-7">
                <ButtonLink href="/services/dental-chair" variant="secondary">
                  Browse the services instead
                </ButtonLink>
              </div>
            </div>
          ) : status === 'empty' ? (
            <div className="mx-auto max-w-xl py-16 text-center">
              <p className="font-display text-[1.5rem] font-semibold text-graphite-900">
                No facilities match that search
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                Try a different name, city or service.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setService('')
                  setCity('')
                }}
                className="mt-6 text-[0.9375rem] font-semibold text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-[0.8125rem] text-slate-600">
                  <span className="tnum font-semibold text-graphite-900">{facilities.length}</span>{' '}
                  facilit{facilities.length === 1 ? 'y' : 'ies'}
                  {cities.length > 0 ? ` · ${cities.join(' · ')}` : ''}
                </p>
              </div>

              <div className="mt-10">
                <Rule />
              </div>

              {/* Editorial list — each facility is a row, not a card. */}
              <ul>
                {facilities.map((facility, index) => {
                  const chair = facility.services.find(
                    (s) => s.resourceType === 'chair',
                  )
                  const phantom = facility.services.find(
                    (s) => s.resourceType === 'dummy_head',
                  )
                  const cheapest = [...facility.services]
                    .filter((s) => s.priceEgp > 0)
                    .sort((a, b) => a.priceEgp - b.priceEgp)[0]

                  return (
                    <Reveal as="li" key={facility.id} delay={index * 0.04}>
                      <article className="group grid-12 items-center gap-y-6 border-b border-stone-300 py-9 transition-colors duration-300 hover:bg-porcelain-100/60 md:py-11">
                        {/* Identity */}
                        <div className="col-span-12 md:col-span-5 lg:col-span-4">
                          <div className="flex items-start gap-4">
                            {facility.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={facility.coverImageUrl}
                                alt=""
                                loading="lazy"
                                className="h-16 w-16 shrink-0 rounded-[12px] object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="grid h-16 w-16 shrink-0 place-items-center rounded-[12px] bg-sage-100 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-600"
                              >
                                {facility.name.slice(0, 2)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <h2 className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em]">
                                <Link
                                  href={`/facilities/${facility.slug}`}
                                  className="inline-flex min-h-11 items-center transition-colors after:absolute after:inset-0 hover:text-teal-700"
                                >
                                  {facility.name}
                                </Link>
                              </h2>
                              <p className="mt-1 text-[0.8125rem] text-slate-600">
                                {[facility.address, facility.city].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="col-span-12 md:col-span-7 lg:col-span-4">
                          {facility.description ? (
                            <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-graphite-700">
                              {facility.description}
                            </p>
                          ) : null}
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            {chair ? (
                              <li className="text-[0.8125rem] text-graphite-700">
                                <span className="text-slate-600">Dental chair</span>{' '}
                                <span className="tnum font-semibold text-teal-700">
                                  {chair.priceEgp} EGP/hr
                                </span>
                              </li>
                            ) : null}
                            {phantom ? (
                              <li className="text-[0.8125rem] text-graphite-700">
                                <span className="text-slate-600">Phantom head</span>{' '}
                                <span className="tnum font-semibold text-teal-700">
                                  {phantom.priceEgp} EGP/hr
                                </span>
                              </li>
                            ) : null}
                          </ul>
                        </div>

                        {/* Action */}
                        <div className="col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 md:col-span-12 lg:col-span-4 lg:justify-end">
                          {cheapest ? (
                            <span className="tnum text-[0.8125rem] text-slate-600">
                              from{' '}
                              <span className="font-semibold text-graphite-900">
                                {cheapest.priceEgp} EGP
                              </span>
                              /hr
                            </span>
                          ) : null}
                          <Link
                            href={`/facilities/${facility.slug}`}
                            className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-teal-700 underline decoration-teal-600/30 underline-offset-[6px] transition-colors hover:text-teal-600"
                          >
                            View facility
                          </Link>
                          <Link
                            href={`/facilities/${facility.slug}/book${service ? `?service=${service}` : ''}`}
                            className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium text-graphite-900 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-teal-600"
                          >
                            {service ? 'Reserve this service' : 'Check availability'}
                          </Link>
                        </div>
                      </article>
                    </Reveal>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
