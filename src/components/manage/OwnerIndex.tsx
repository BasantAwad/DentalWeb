'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { listFacilities, type FacilitySummary } from '@/lib/platform-api'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Facility owner entry point.
 *
 * Lists the facilities this browser can reach. A production deployment would
 * scope this list to the signed-in owner's facilities via the membership
 * table; until a session exists the page states that plainly rather than
 * pretending to be authenticated.
 */
export default function OwnerIndex() {
  const [facilities, setFacilities] = useState<FacilitySummary[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const payload = await listFacilities({})
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'The platform database is not configured.')
        return
      }
      const list = payload.facilities ?? []
      setFacilities(list)
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
    <>
      <Section theme="dark" className="relative overflow-hidden pt-32 md:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 24% 10%, rgba(47,119,114,0.2) 0%, rgba(32,37,34,0) 58%)',
          }}
        />
        <div className="page relative">
          <Eyebrow tone="dark">For facility owners</Eyebrow>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Your space, better managed.
          </h1>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-porcelain-100/65">
            Publish your rooms and equipment, set your hourly rates, and take
            reservations without the back-and-forth.
          </p>
        </div>
      </Section>

      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-4">
              <Eyebrow>Your facilities</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                Choose a facility to manage
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                Each facility keeps its own catalogue, resources and schedule.
                Open one to see what customers see and what is bookable.
              </p>
              <div className="mt-6">
                <ButtonLink href="/auth/login" variant="secondary">
                  Sign in to your account
                </ButtonLink>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              {status === 'loading' ? (
                <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
                  Loading facilities…
                </p>
              ) : status === 'unavailable' ? (
                <div className="rounded-[16px] border border-stone-300 bg-chalk p-6">
                  <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
                    {message}
                  </p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-slate-600">
                    Facility ownership requires a signed-in account with a
                    membership on the facility. The public listing remains
                    available once the database is connected.
                  </p>
                </div>
              ) : status === 'empty' ? (
                <p className="text-[0.9375rem] text-slate-600">
                  No facilities have been published yet.
                </p>
              ) : (
                <ul>
                  {facilities.map((facility) => (
                    <li
                      key={facility.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-stone-300 py-5"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-[1.125rem] font-semibold text-graphite-900">
                          {facility.name}
                        </p>
                        <p className="mt-1 text-[0.8125rem] text-slate-600">
                          {[facility.address, facility.city].filter(Boolean).join(', ') ||
                            'Location not published'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <span className="tnum text-[0.8125rem] text-slate-600">
                          {facility.services.length} service
                          {facility.services.length === 1 ? '' : 's'}
                        </span>
                        <Link
                          href={`/manage/${facility.slug}`}
                          className="text-[0.9375rem] font-semibold text-teal-700 underline decoration-teal-600/30 underline-offset-[6px] transition-colors hover:text-teal-600"
                        >
                          Manage
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
