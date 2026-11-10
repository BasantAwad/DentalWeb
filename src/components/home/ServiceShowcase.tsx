'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { getAsset } from '@/lib/3d/assets'
import { usePrefersReducedMotion } from '@/lib/3d/device-profile'
import { useScrollProgress } from '@/lib/3d/use-scroll-progress'
import { RENTAL_SERVICE_LIST, type RentalServiceKey } from '@/lib/pricing'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const ServiceScene3D = dynamic(() => import('./ServiceScene3D'), { ssr: false })

const COPY: Record<
  RentalServiceKey,
  { headline: string; body: string; includes: string[] }
> = {
  'dental-chair': {
    headline: 'A full clinical setup, ready when you arrive.',
    body:
      'An articulating chair with delivery arm, operating light and sterilised instrument tray. Practise with the same equipment you will meet in the operatory.',
    includes: ['Delivery arm and suction', 'LED operating light', 'Sterile instrument tray'],
  },
  'phantom-head': {
    headline: 'Your own station, for as long as you need it.',
    body:
      'A manned phantom head with typodont, handpieces and suction. Rehearse operative and endodontic technique at your own pace, with no patient in the chair.',
    includes: ['Typodont with 28 teeth', 'High and low-speed handpieces', 'Suction and spittoon setup'],
  },
}

/**
 * Scene 3 — Two ways to practice.
 *
 * A split composition rather than two cards: the object occupies one half of
 * the viewport and the copy the other, and switching services changes both.
 * The switcher is always visible so the second service is never hidden behind
 * a scroll.
 */
export default function ServiceShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<RentalServiceKey>('dental-chair')
  const [manual, setManual] = useState(false)
  const [failed, setFailed] = useState(false)

  const progress = useScrollProgress(sectionRef, {
    start: 'top top',
    end: 'bottom bottom',
    enabled: !reducedMotion,
  })

  // Scroll reveals the chair first, then transitions to the phantom head.
  // An explicit selection always wins.
  useEffect(() => {
    if (reducedMotion || manual) return
    let frame = 0
    const update = () => {
      const value = progress.current
      const next: RentalServiceKey = value > 0.42 ? 'phantom-head' : 'dental-chair'
      setActive((current) => (current === next ? current : next))
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [progress, reducedMotion, manual])

  // Re-arm the scroll-driven behaviour once the section leaves the viewport.
  useEffect(() => {
    const element = sectionRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) setManual(false)
      },
      { threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const service = RENTAL_SERVICE_LIST.find((s) => s.key === active)!
  const copy = COPY[active]
  const asset = getAsset(active === 'dental-chair' ? 'dentalChair' : 'phantomHead')

  const tabs = useMemo(
    () =>
      RENTAL_SERVICE_LIST.map((item) => ({
        ...item,
        selected: item.key === active,
      })),
    [active],
  )

  return (
    <Section id="services" theme="porcelain" className="relative overflow-hidden">
      <div className="page section-y">
        {/* Heading + switcher */}
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <Eyebrow>Two ways to practice</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Choose what you need.
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:justify-self-end">
            <div
              role="tablist"
              aria-label="Choose a rental service"
              className="inline-flex w-full rounded-[14px] border border-stone-300 bg-chalk p-1.5 lg:w-auto"
            >
              {tabs.map((item) => (
                <button
                  key={item.key}
                  role="tab"
                  type="button"
                  aria-selected={item.selected}
                  aria-controls="service-panel"
                  onClick={() => {
                    setActive(item.key)
                    setManual(true)
                  }}
                  className={[
                    'flex flex-1 flex-col items-start gap-0.5 rounded-[10px] px-4 py-2.5 text-left transition-all duration-200 lg:flex-none lg:min-w-[13.5rem]',
                    item.selected
                      ? 'bg-graphite-900 text-porcelain-50 shadow-sm'
                      : 'text-graphite-700 hover:bg-sage-100',
                  ].join(' ')}
                >
                  <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                  <span
                    className={[
                      'tnum text-[0.75rem]',
                      item.selected ? 'text-sage-200' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {item.hourlyRateEgp} EGP / hour
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Split composition */}
        <div id="service-panel" role="tabpanel" className="mt-12 grid-12 items-stretch gap-y-10">
          {/* Object — a full-height half */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative h-full min-h-[320px] overflow-hidden rounded-[22px] border border-stone-300 bg-chalk lg:min-h-[520px]">
              {!failed ? (
                <ServiceScene3D
                  serviceKey={active}
                  progress={progress}
                  reducedMotion={reducedMotion}
                  onError={() => setFailed(true)}
                />
              ) : null}
              <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-graphite-700 backdrop-blur-sm">
                Placeholder model
              </span>
            </div>
          </div>

          {/* Copy — the other half, aligned to the object's baseline */}
          <div className="col-span-12 flex flex-col justify-center lg:col-span-5 lg:col-start-8">
            <Reveal key={active}>
              <p className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                {service.name}
              </p>
              <p className="tnum mt-3 font-display text-[1.75rem] font-semibold text-teal-700">
                {service.hourlyRateEgp} EGP
                <span className="ml-1.5 text-[1rem] font-normal text-slate-600">
                  per hour
                </span>
              </p>

              <p className="mt-6 text-[1.0625rem] leading-relaxed text-graphite-700">
                {copy.headline}
              </p>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-slate-600">
                {copy.body}
              </p>

              <ul className="mt-8 space-y-3 border-t border-stone-300 pt-6">
                {copy.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[0.9375rem] text-graphite-700"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-teal-600"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <ButtonLink href={service.href} variant="primary" withArrow>
                  Explore availability
                </ButtonLink>
                <ButtonLink href="/#how-it-works" variant="tertiary">
                  How booking works
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
