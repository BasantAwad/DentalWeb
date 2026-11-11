'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { RentalServiceKey } from '@/lib/pricing'
import { RENTAL_SERVICES } from '@/lib/pricing'
import { getAsset } from '@/lib/3d/assets'
import { usePrefersReducedMotion } from '@/lib/3d/device-profile'
import { useViewportBand } from '@/lib/3d/use-viewport-band'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

/** The 3D canvas is client-only, so it is loaded separately from the page. */
const ServiceStageCanvas = dynamic(() => import('./ServiceStageCanvas'), { ssr: false })

/**
 * A dedicated product page for one rentable service.
 *
 * The page is a product experience, not a long landing page: the object is
 * the protagonist, the rate is unambiguous, and the path to a booking is
 * always one action away.
 */

interface ServicePageProps {
  serviceKey: RentalServiceKey
  /** What the customer actually gets, per hour. */
  included: { title: string; body: string }[]
  /** Extra notes specific to this service. */
  notes: string[]
}

function ServiceStage({ serviceKey }: { serviceKey: RentalServiceKey }) {
  const asset = getAsset(serviceKey === 'dental-chair' ? 'dentalChair' : 'phantomHead')
  const reducedMotion = usePrefersReducedMotion()
  const band = useViewportBand()
  const [failed, setFailed] = useState(false)

  const isChair = serviceKey === 'dental-chair'
  const offsetX = band === 'desktop' ? 1.1 : 0

  return (
    <div className="relative h-full w-full">
      {!failed ? (
        <ServiceStageCanvas
          asset={asset}
          isChair={isChair}
          offsetX={offsetX}
          reducedMotion={reducedMotion}
          onError={() => setFailed(true)}
        />
      ) : null}
      <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-graphite-700 backdrop-blur-sm">
        Placeholder model
      </span>
    </div>
  )
}

/** Isolated so the canvas is only mounted on the client. */
export default function ServicePage({
  serviceKey,
  included,
  notes,
}: ServicePageProps) {
  const service = RENTAL_SERVICES[serviceKey]
  const dark = serviceKey === 'dental-chair'
  // The resource type that provides this service — the vocabulary the facility
  // explorer's `?service=` filter and the booking flow both understand.
  const serviceResourceType = serviceKey === 'dental-chair' ? 'chair' : 'dummy_head'

  return (
    <>
      {/* ── Product stage ─────────────────────────────────────────── */}
      <Section
        theme={dark ? 'dark' : 'porcelain'}
        className="relative overflow-hidden pt-28 md:pt-36"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: dark
              ? 'radial-gradient(120% 85% at 62% 18%, rgba(51,60,56,0) 0%, rgba(32,37,34,0.35) 46%, rgba(23,26,25,0.92) 100%)'
              : 'radial-gradient(120% 90% at 68% 12%, rgba(255,255,255,0.9) 0%, rgba(242,240,233,0) 58%)',
          }}
        />

        <div className="page relative">
          <div className="grid-12 items-center gap-y-10">
            {/* Copy */}
            <div className="col-span-12 lg:col-span-5">
              <Eyebrow tone={dark ? 'dark' : 'light'}>Equipment rental</Eyebrow>

              <h1 className="mt-6 font-display text-[clamp(2.5rem,5.6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                {service.name}
              </h1>

              <p className="tnum mt-6 flex items-baseline gap-3">
                <span
                  className={[
                    'font-display text-[clamp(2.25rem,4.4vw,3.25rem)] font-semibold tracking-[-0.03em]',
                    dark ? 'text-sage-200' : 'text-teal-700',
                  ].join(' ')}
                >
                  {service.hourlyRateEgp} EGP
                </span>
                <span
                  className={[
                    'text-[1rem]',
                    dark ? 'text-porcelain-100/60' : 'text-slate-600',
                  ].join(' ')}
                >
                  per hour
                </span>
              </p>

              <p
                className={[
                  'mt-6 max-w-md text-[1.0625rem] leading-relaxed',
                  dark ? 'text-porcelain-100/70' : 'text-graphite-700',
                ].join(' ')}
              >
                {service.description}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={`/facilities?service=${serviceResourceType}`}
                  variant={dark ? 'on-dark' : 'primary'}
                  size="lg"
                  withArrow
                >
                  See facilities offering this
                </ButtonLink>
                <ButtonLink
                  href="/#how-it-works"
                  variant={dark ? 'tertiary-on-dark' : 'tertiary'}
                  size="lg"
                >
                  How booking works
                </ButtonLink>
              </div>

              <dl
                className={[
                  'mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 border-t pt-6',
                  dark ? 'border-white/10' : 'border-stone-300',
                ].join(' ')}
              >
                {[
                  { term: 'Deposit', value: '50% of total' },
                  { term: 'Booking unit', value: '1 hour' },
                  { term: 'Confirmation', value: 'On verified deposit' },
                  { term: 'Availability', value: 'Per facility' },
                ].map((item) => (
                  <div key={item.term}>
                    <dt
                      className={[
                        'text-[0.6875rem] uppercase tracking-[0.12em]',
                        dark ? 'text-porcelain-100/45' : 'text-slate-600',
                      ].join(' ')}
                    >
                      {item.term}
                    </dt>
                    <dd
                      className={[
                        'mt-1 text-[0.9375rem] font-medium',
                        dark ? 'text-porcelain-50' : 'text-graphite-900',
                      ].join(' ')}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Object */}
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div
                className={[
                  'relative aspect-[4/3] overflow-hidden sm:aspect-[16/11]',
                  dark ? 'bg-graphite-900' : 'bg-chalk',
                ].join(' ')}
              >
                <ServiceStage serviceKey={serviceKey} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── What is included ─────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-24 md:py-32">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-4">
              <Eyebrow>What is included</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(1.875rem,3.4vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
                Every session includes
                <br />
                the essentials.
              </h2>
              <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-graphite-700">
                What each facility provides is published on its own page, so you
                can see the exact setup before you book.
              </p>
            </div>

            <ul className="col-span-12 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
              {included.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={index * 0.05}
                  className="border-t border-stone-300 py-7"
                >
                  <p className="font-display text-[1.125rem] font-semibold text-graphite-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-700">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Notes ─────────────────────────────────────────────────── */}
      {notes.length > 0 ? (
        <Section theme="chalk" className="relative overflow-hidden">
          <div className="page py-20 md:py-24">
            <div className="grid-12 gap-y-8">
              <div className="col-span-12 lg:col-span-3">
                <Eyebrow>Good to know</Eyebrow>
              </div>
              <ul className="col-span-12 space-y-4 lg:col-span-8 lg:col-start-5">
                {notes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-4 border-b border-stone-200 pb-4 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-600"
                    />
                    <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
                      {note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ── Closing action ────────────────────────────────────────── */}
      <Section theme="dark" seam="chalk" className="relative overflow-hidden">
        <div className="page py-24 md:py-32">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow tone="dark">Ready when you are</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
                Facilities offering {service.name.toLowerCase()},
                <br />
                one booking away.
              </h2>
              <div className="mt-8">
                <Rule tone="dark" fade="right" className="max-w-sm" />
              </div>
            </div>
            <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
              <ButtonLink
                href={`/facilities?service=${serviceResourceType}`}
                variant="on-dark"
                size="lg"
                withArrow
              >
                Find your facility
              </ButtonLink>
              <Link
                href="/#how-it-works"
                className="inline-flex h-[52px] items-center rounded-[12px] border border-white/25 px-6 text-[0.9375rem] font-medium text-porcelain-50 transition-colors duration-200 hover:bg-white/10"
              >
                How booking works
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
