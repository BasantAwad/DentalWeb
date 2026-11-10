'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { listFacilities, type FacilitySummary } from '@/lib/platform-api'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

type Status = 'loading' | 'ready' | 'empty' | 'unavailable'

/**
 * Scene 5 — Explore facilities.
 *
 * A short editorial preview on the homepage. The full discovery experience —
 * search, filters and every published facility — lives on its own page.
 */
export default function FacilityPreview() {
  const [facilities, setFacilities] = useState<FacilitySummary[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const payload = await listFacilities({})
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Facility listings are not available yet.')
        return
      }
      const list = payload.facilities ?? []
      setFacilities(list.slice(0, 3))
      setStatus(list.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      setStatus('unavailable')
      setMessage(
        error instanceof Error ? error.message : 'Facilities could not be loaded.',
      )
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Section id="facilities" theme="chalk" className="relative overflow-hidden">
      <div className="page section-y">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow>Explore facilities</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Find your practice space.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
              Published facilities with their own rooms, equipment and opening
              hours. Check what is actually bookable before you pay.
            </p>
          </div>
        </div>

        <div className="mt-12">
          {status === 'loading' ? (
            <p role="status" aria-live="polite" className="py-16 text-center text-[0.9375rem] text-slate-600">
              Loading facilities…
            </p>
          ) : status === 'unavailable' ? (
            <div className="rounded-[18px] border border-stone-300 bg-porcelain-100 px-6 py-14 text-center">
              <p className="font-display text-[1.375rem] font-semibold text-graphite-900">
                Listings are not connected yet
              </p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-600">
                {message}
              </p>
              <div className="mt-7">
                <ButtonLink href="/services/dental-chair" variant="secondary">
                  Browse the services instead
                </ButtonLink>
              </div>
            </div>
          ) : status === 'empty' ? (
            <div className="rounded-[18px] border border-stone-300 bg-porcelain-100 px-6 py-14 text-center">
              <p className="font-display text-[1.375rem] font-semibold text-graphite-900">
                No facilities published yet
              </p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-600">
                Facilities appear here as soon as they publish their rooms and
                rates.
              </p>
            </div>
          ) : (
            <>
              <Rule />
              <ul>
                {facilities.map((facility, index) => {
                  const chair = facility.services.find((s) => s.resourceType === 'chair')
                  const phantom = facility.services.find(
                    (s) => s.resourceType === 'dummy_head',
                  )

                  return (
                    <Reveal as="li" key={facility.id} delay={index * 0.06}>
                      <article className="group grid-12 items-center gap-y-5 border-b border-stone-300 py-8">
                        <div className="col-span-12 md:col-span-5 lg:col-span-4">
                          {facility.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={facility.coverImageUrl}
                              alt={`${facility.name} — facility`}
                              loading="lazy"
                              className="aspect-[16/10] w-full rounded-[14px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="grid aspect-[16/10] w-full place-items-center rounded-[14px] bg-sage-100 text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                              No photo published
                            </div>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-7 lg:col-span-5">
                          <h3 className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em]">
                            <Link
                              href={`/facilities/${facility.slug}`}
                              className="transition-colors after:absolute after:inset-0 hover:text-teal-700"
                            >
                              {facility.name}
                            </Link>
                          </h3>
                          <p className="mt-1.5 text-[0.8125rem] text-slate-600">
                            {[facility.address, facility.city].filter(Boolean).join(', ')}
                          </p>
                          {facility.description ? (
                            <p className="mt-3 line-clamp-2 text-[0.9375rem] leading-relaxed text-graphite-700">
                              {facility.description}
                            </p>
                          ) : null}
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                            {chair ? (
                              <li className="text-[0.8125rem] text-graphite-700">
                                Chair{' '}
                                <span className="tnum font-semibold text-teal-700">
                                  {chair.priceEgp} EGP/hr
                                </span>
                              </li>
                            ) : null}
                            {phantom ? (
                              <li className="text-[0.8125rem] text-graphite-700">
                                Phantom head{' '}
                                <span className="tnum font-semibold text-teal-700">
                                  {phantom.priceEgp} EGP/hr
                                </span>
                              </li>
                            ) : null}
                          </ul>
                        </div>

                        <div className="col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-3 lg:justify-end">
                          <Link
                            href={`/facilities/${facility.slug}`}
                            className="text-[0.9375rem] font-semibold text-teal-700 underline decoration-teal-600/30 underline-offset-[6px] transition-colors hover:text-teal-600"
                          >
                            View facility
                          </Link>
                          <Link
                            href={`/facilities/${facility.slug}/book`}
                            className="text-[0.9375rem] font-medium text-graphite-900 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-teal-600"
                          >
                            Check availability
                          </Link>
                        </div>
                      </article>
                    </Reveal>
                  )
                })}
              </ul>

              <div className="mt-10">
                <ButtonLink href="/facilities" variant="primary" size="lg" withArrow>
                  Explore all facilities
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
