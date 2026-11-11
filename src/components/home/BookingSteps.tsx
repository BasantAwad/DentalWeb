'use client'

import { useEffect, useRef, useState } from 'react'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Scene 4 — How booking works.
 *
 * A horizontal timeline rather than a row of cards: the steps run along a
 * single measured line, and the price example sits beneath it as the
 * resolution of the sequence.
 */
const STEPS = [
  {
    n: '01',
    title: 'Choose a service',
    body: 'A dental chair at 150 EGP an hour, or a phantom head at 100 EGP an hour.',
  },
  {
    n: '02',
    title: 'Pick a time',
    body: 'Availability comes from the facility and the resource. Only continuous, bookable hours are offered.',
  },
  {
    n: '03',
    title: 'Review the price',
    body: 'Rate, hours, total and the 50% deposit — all shown before anything is charged.',
  },
  {
    n: '04',
    title: 'Pay the deposit',
    body: 'The reservation is confirmed only once the deposit has been verified.',
  },
]

const EXAMPLE = [
  { label: 'Service', value: 'Dental chair' },
  { label: 'Duration', value: '2 hours' },
  { label: 'Hourly rate', value: '150 EGP' },
  { label: 'Total booking amount', value: '300 EGP', strong: true },
  { label: 'Deposit required (50%)', value: '150 EGP', accent: true },
  { label: 'Remaining balance', value: '150 EGP' },
]

export default function BookingSteps() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const rect = element.getBoundingClientRect()
          const travelled = Math.min(
            1,
            Math.max(0, (window.innerHeight * 0.78 - rect.top) / (window.innerHeight * 0.42)),
          )
          setActive(Math.min(STEPS.length - 1, Math.floor(travelled * STEPS.length)))
        }
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Section
      id="how-it-works"
      theme="porcelain"
      seam="graphite"
      className="relative overflow-hidden"
    >
      <div className="page section-y">
        <div className="grid-12 gap-y-12">
          {/* Heading */}
          <div className="col-span-12 lg:col-span-4">
            <Eyebrow>How booking works</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Booking without the back-and-forth.
            </h2>
            <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-graphite-700">
              Four steps. The resource is held once the deposit is verified, and
              the amount is never a surprise.
            </p>
          </div>

          {/* Timeline */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            {/* The rail */}
            <div className="relative" aria-hidden="true">
              <span className="absolute left-0 right-0 top-[7px] h-px bg-stone-300" />
              <span
                className="absolute left-0 top-[7px] h-px bg-teal-600 transition-[width] duration-700 ease-out"
                style={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            <ol className="mt-0 grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:gap-x-10">
              {STEPS.map((step, index) => {
                const reached = index <= active
                return (
                  <li key={step.n} className="relative pt-9">
                    {/* Node on the rail */}
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute left-0 top-0 grid h-[15px] w-[15px] place-items-center rounded-full border-2 transition-colors duration-500',
                        reached
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-stone-300 bg-porcelain-100',
                      ].join(' ')}
                    >
                      {reached ? (
                        <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>

                    <p
                      className={[
                        'tnum font-display text-[0.75rem] font-semibold tracking-[0.12em] transition-colors duration-500',
                        reached ? 'text-teal-700' : 'text-slate-400',
                      ].join(' ')}
                    >
                      {step.n}
                    </p>
                    <h3 className="mt-2 font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.02em] text-graphite-900">
                      {step.title}
                    </h3>
                    <p
                      className={[
                        'mt-2 text-[0.9375rem] leading-relaxed transition-colors duration-500',
                        reached ? 'text-graphite-700' : 'text-slate-400',
                      ].join(' ')}
                    >
                      {step.body}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>

        {/* Worked example — the resolution of the sequence */}
        <Reveal className="mt-16 md:mt-24">
          <div className="grid-12 items-start gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <Eyebrow>Worked example</Eyebrow>
              <h3 className="mt-5 font-display text-[clamp(1.625rem,3vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                What you would actually pay.
              </h3>
              <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-graphite-700">
                A two-hour dental chair session. The deposit is 50% of the total
                and confirms the reservation. The remaining balance is settled
                with the facility.
              </p>
              <div className="mt-8">
                <ButtonLink href="/services/dental-chair" variant="primary" withArrow>
                  Start a booking
                </ButtonLink>
              </div>
            </div>

            <dl className="col-span-12 lg:col-span-6 lg:col-start-7">
              {EXAMPLE.map((row) => (
                <div
                  key={row.label}
                  className={[
                    'flex items-baseline justify-between gap-6 border-b border-stone-300 py-3.5 last:border-b-0',
                    row.strong ? 'border-t border-t-graphite-900/15 pt-4' : '',
                  ].join(' ')}
                >
                  <dt className="text-[0.9375rem] text-slate-600">{row.label}</dt>
                  <dd
                    className={[
                      'tnum font-display font-semibold',
                      row.strong
                        ? 'text-[1.25rem] text-graphite-900'
                        : row.accent
                          ? 'text-[1.25rem] text-teal-700'
                          : 'text-[1.0625rem] text-graphite-900',
                    ].join(' ')}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
