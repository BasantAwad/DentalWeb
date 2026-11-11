import type { Metadata } from 'next'
import Link from 'next/link'
import { SERVICES } from '@/lib/services-data'
import { RENTAL_SERVICE_LIST } from '@/lib/pricing'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Dental chair and phantom head rental by the hour, plus courses and practical training from published facilities. Book online with a 50% deposit.',
}

export default function ServicesIndexPage() {
  const clinical = SERVICES.filter(
    (s) => s.category !== 'chair_rental' && s.category !== 'dummy_head',
  )

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-44">
        <div className="page">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Services</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
                Equipment you can
                <br />
                book by the hour.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                Three ways to benefit from a dental facility: rent a chair, rent
                a phantom-head station, or register for a course.
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

      {/* ── Clinical services from facilities ───────────────────────── */}
      {/* Courses and practical training */}
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

      {clinical.length > 0 ? (
        <Section theme="porcelain" className="relative overflow-hidden">
          <div className="page py-16 md:py-20">
            <div className="grid-12 gap-y-12">
              <div className="col-span-12 lg:col-span-3">
                <Eyebrow>From facilities</Eyebrow>
                <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                  Clinical services
                </h2>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-700">
                  Published by individual facilities, with their own rates and
                  availability.
                </p>
                <div className="mt-6">
                  <ButtonLink href="/facilities" variant="secondary">
                    Browse facilities
                  </ButtonLink>
                </div>
              </div>

              <ul className="col-span-12 grid gap-x-10 sm:grid-cols-2 lg:col-span-8 lg:col-start-5">
                {clinical.map((service) => (
                  <li key={service.id} className="border-t border-stone-300 py-5">
                    <Link
                      href={`/services/${service.slug}`}
                      className="group flex items-baseline justify-between gap-4"
                    >
                      <span>
                        <span className="block font-display text-[1.0625rem] font-semibold text-graphite-900 transition-colors group-hover:text-teal-700">
                          {service.name}
                        </span>
                        <span className="mt-1 block text-[0.8125rem] leading-relaxed text-slate-600">
                          {service.tagline}
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-[0.9375rem] font-semibold text-teal-700">
                        {service.price} EGP
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}
    </>
  )
}
