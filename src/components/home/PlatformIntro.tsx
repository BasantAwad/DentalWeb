'use client'

import Link from 'next/link'
import Section, { Eyebrow, Rule, BleedWord } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Scene 2 — What the platform is.
 *
 * An asymmetric editorial composition rather than a feature grid: a narrow
 * statement column, and a set of numbered facts hung off an architectural
 * rule that runs down the page.
 */
const FACTS = [
  {
    n: '01',
    title: 'By the hour',
    body: 'Dental chairs and phantom heads rented in whole-hour sessions. No minimum block, no commitment you did not intend.',
  },
  {
    n: '02',
    title: 'From real facilities',
    body: 'Every listing belongs to a facility that publishes its own rooms, equipment, hours and hourly rate.',
  },
  {
    n: '03',
    title: 'One deposit, no guesswork',
    body: 'A 50% deposit confirms the reservation. The total, the deposit and the balance are shown before you pay.',
  },
  {
    n: '04',
    title: 'Your station, your choice',
    body: 'Where a facility has published a room plan, you select the exact station you will work at.',
  },
]

export default function PlatformIntro() {
  return (
    <Section id="platform" theme="chalk" className="relative overflow-hidden">
      <BleedWord className="left-[-4%] top-8 text-[22vw] leading-[0.7]">
        Practice
      </BleedWord>

      <div className="page relative py-24 md:py-36">
        <div className="grid-12 gap-y-14">
          {/* Statement */}
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>The platform</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.03em]">
              A place to find the
              <br />
              space, the chair and
              <br />
              the time — in one
              <br />
              reservation.
            </h2>
            <div className="mt-9 max-w-sm">
              <Rule />
            </div>
            <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-graphite-700">
              DentalWeb removes the message-and-haggle step. You see what a
              facility actually has, what it costs per hour, and when it is
              free — then you reserve it directly.
            </p>
            <div className="mt-8">
              <Link
                href="/facilities"
                className="group inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-teal-700 transition-colors hover:text-teal-600"
              >
                Browse facilities
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Facts — hung off a vertical rule */}
          <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
            {FACTS.map((fact, index) => (
              <Reveal
                as="li"
                key={fact.n}
                delay={index * 0.06}
                className="group relative border-t border-stone-300 py-7 first:border-t-0 first:pt-0 lg:pl-14"
              >
                {/* The number hangs in the margin, aligned to the rule */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-7 hidden font-display text-[0.8125rem] font-semibold tracking-[0.1em] text-slate-400 lg:block"
                >
                  {fact.n}
                </span>
                <div className="lg:pl-2">
                  <h3 className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900">
                    {fact.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-graphite-700">
                    {fact.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  )
}
