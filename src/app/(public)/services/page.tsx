import type { Metadata } from 'next'
import Link from 'next/link'
import { RENTAL_SERVICE_LIST } from '@/lib/pricing'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Dental chair and phantom head rental by the hour, plus courses and practical training from published facilities. Book online with a 50% deposit.',
}

export default function ServicesIndexPage() {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-44">
        <div className="page">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Services</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
                Three ways to use
                <br />
                a dental facility.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                Rent a chair, train at a phantom-head station, or register for a
                course. Each one is a service a facility actually offers —
                published with its real rate, and bookable online.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── The two rental services — the primary catalogue ───────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow>Rental</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                Book by the hour
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                Whole-hour sessions. A 50% deposit confirms the reservation.
              </p>
            </div>

            <ul className="col-span-12 lg:col-span-8 lg:col-start-5">
              {RENTAL_SERVICE_LIST.map((service, index) => (
                <li key={service.key}>
                  <Link
                    href={service.href}
                    className="group grid gap-y-4 border-b border-stone-300 py-8 transition-colors duration-300 hover:bg-porcelain-100/70 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-10"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-[-0.03em] text-graphite-900 transition-colors group-hover:text-teal-700">
                        {service.name}
                      </p>
                      <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-700">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-1">
                      <span className="tnum font-display text-[1.75rem] font-semibold text-teal-700">
                        {service.hourlyRateEgp} EGP
                      </span>
                      <span className="text-[0.8125rem] text-slate-600">per hour</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-graphite-900">
                        Explore
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Courses and practical training ─────────────────────────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow>Training</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                Courses and practical training
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                Programmes with their own instructor, schedule, capacity and
                price — not an equipment rental.
              </p>
              <div className="mt-6">
                <ButtonLink href="/courses" variant="secondary" withArrow>
                  Explore courses
                </ButtonLink>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <p className="max-w-2xl font-display text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium leading-[1.25] tracking-[-0.02em] text-graphite-900">
                Learn the science. Practise the skill. Build confidence.
              </p>
              <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
                {[
                  {
                    title: 'Theoretical',
                    body: 'Explanations, demonstrations and structured teaching sessions for a subject you are studying.',
                  },
                  {
                    title: 'Practical',
                    body: 'Supervised hands-on practice in a real facility, with the equipment in front of you.',
                  },
                  {
                    title: 'Combined',
                    body: 'A theory block followed by supervised clinical practice in the same programme.',
                  },
                  {
                    title: 'Its own registration rules',
                    body: 'Each course sets its own price, capacity, deadline and payment policy. The hourly rental rate and the 50% deposit do not apply.',
                  },
                ].map((item) => (
                  <li key={item.title} className="border-t border-stone-300 py-5">
                    <p className="font-display text-[1.0625rem] font-semibold text-graphite-900">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-slate-600">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── How the journey continues ──────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-20 md:py-28">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 lg:col-span-5">
              <Eyebrow>After you choose</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                Pick a service. The facilities that offer it come next.
              </h2>
              <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-graphite-700">
                Every service page leads to the facilities that provide it, with
                their published rates. From there you choose a date and time,
                and — where the facility publishes a room plan — the exact
                station you will work at.
              </p>
              <div className="mt-8">
                <Rule />
              </div>
            </div>

            <ol className="col-span-12 lg:col-span-6 lg:col-start-7">
              {[
                'Choose the service you need.',
                'See the facilities offering it, with real rates.',
                'Choose your date, time and duration.',
                'Reserve your resource — down to the station.',
                'Review the total and confirm with a deposit.',
              ].map((step, index) => (
                <Reveal
                  as="li"
                  key={step}
                  delay={index * 0.05}
                  className="flex items-baseline gap-5 border-t border-stone-300 py-5 first:border-t-0"
                >
                  <span
                    aria-hidden="true"
                    className="tnum shrink-0 font-display text-[0.8125rem] font-semibold tracking-[0.1em] text-teal-700"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[1.0625rem] font-medium leading-snug text-graphite-900">
                    {step}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  )
}
