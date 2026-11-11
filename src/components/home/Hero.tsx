'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { getAsset } from '@/lib/3d/assets'
import { usePrefersReducedMotion } from '@/lib/3d/device-profile'
import { useScrollProgress } from '@/lib/3d/use-scroll-progress'
import { ButtonLink } from '@/components/ui/Button'
import { RevealWords } from '@/components/ui/Reveal'

const HeroScene3D = dynamic(() => import('./HeroScene3D'), { ssr: false })

/**
 * Scene 1 — The hero.
 *
 * Full-viewport, no container around the object. The chair sits in the right
 * third of the composition and the headline occupies the left, so the two
 * never fight. The page background bleeds upward into the navigation.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const asset = getAsset('dentalChair')
  const [loaded, setLoaded] = useState(false)

  const progress = useScrollProgress(sectionRef, {
    start: 'top top',
    end: 'bottom top',
    enabled: !reducedMotion,
  })

  useEffect(() => {
    if (reducedMotion) progress.current = 0
  }, [reducedMotion, progress])

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-theme="dark"
      data-section-theme="dark"
      className="relative min-h-[100svh] overflow-hidden bg-[#171A19] text-porcelain-50"
    >
      {/* Studio backdrop — sits above the canvas so the floor fades into it
          instead of meeting it at a hard horizon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 88% at 64% 14%, rgba(51,60,56,0) 0%, rgba(32,37,34,0.32) 44%, rgba(23,26,25,0.94) 100%)',
        }}
      />

      {/* 3D stage — on narrow screens the object occupies the upper half so
          the copy below it is never overlapped. */}
      <div
        className={[
          'absolute inset-x-0 top-0',
          'h-[46svh] md:h-full',
        ].join(' ')}
      >
        <HeroScene3D progress={progress} reducedMotion={reducedMotion} />
      </div>

      {/* A soft fade between the stage and the copy on narrow screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[38svh] h-[16svh] md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(23,26,25,0) 0%, rgba(23,26,25,0.85) 62%, rgba(23,26,25,1) 100%)',
        }}
      />

      {/* Content */}
      <div className="page relative z-10 flex min-h-[100svh] flex-col justify-end pb-12 pt-[46svh] md:pb-14 md:pt-32">
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-6 xl:col-span-5">
            <p className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-sage-200/85">
              <span aria-hidden="true" className="block h-px w-9 bg-sage-200/50" />
              Dental training spaces
            </p>

            <RevealWords
              as="h1"
              text="A better space to practice."
              className="mt-6 font-display text-[clamp(2.75rem,6.4vw,4.75rem)] font-semibold leading-[1.0] tracking-[-0.035em]"
            />

            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-porcelain-100/75 md:text-[1.125rem]">
              Reserve dental training equipment by the hour, or learn through
              courses and supervised practice — real facilities, transparent
              rates, a 50% deposit to confirm.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-9">
              <ButtonLink href="/services" variant="on-dark" size="lg" withArrow>
                Explore services
              </ButtonLink>
              <ButtonLink href="/courses" variant="tertiary-on-dark" size="lg">
                Browse courses
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Rates — a measured strip along the base, clear of the object */}
        <dl className="mt-12 flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-white/10 pt-6 md:mt-14">
          {[
            { term: 'Dental chair', value: '150 EGP', unit: '/hr' },
            { term: 'Phantom head', value: '100 EGP', unit: '/hr' },
            { term: 'Deposit', value: '50%', unit: '' },
          ].map((item) => (
            <div key={item.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-porcelain-100/45">
                {item.term}
              </dt>
              <dd className="tnum mt-1 font-display text-[1.375rem] font-semibold text-porcelain-50">
                {item.value}
                {item.unit ? (
                  <span className="ml-1 text-[0.8125rem] font-normal text-porcelain-100/45">
                    {item.unit}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}

          {/* Scroll cue */}
          <div className="ml-auto flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.18em] text-porcelain-100/35">
            <span
              aria-hidden="true"
              className="relative block h-10 w-px overflow-hidden bg-white/15"
            >
              <span className="absolute inset-x-0 top-0 h-4 animate-[heroScroll_2.4s_ease-in-out_infinite] bg-sage-200/80" />
            </span>
            Scroll to explore
          </div>
        </dl>
      </div>

      <style>{`
        @keyframes heroScroll {
          0% { transform: translateY(-100%); }
          60%, 100% { transform: translateY(250%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[heroScroll_2\\.4s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </section>
  )
}
