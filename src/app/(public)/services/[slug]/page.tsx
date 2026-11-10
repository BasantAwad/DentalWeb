import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICES } from '@/lib/services-data'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'

export async function generateStaticParams() {
  // The two rentable services have their own dedicated product pages at
  // /services/dental-chair and /services/phantom-head, so they are not
  // generated from this catalogue.
  return SERVICES.filter(
    (s) => s.category !== 'chair_rental' && s.category !== 'dummy_head',
  ).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) return {}
  return {
    title: service.name,
    description: service.shortDescription,
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) notFound()

  const otherServices = SERVICES.filter((s) => s.slug !== slug).slice(0, 3)

  return (
    <>
      {/* ── Identity ───────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pt-32 md:pt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 26% 8%, rgba(47,119,114,0.18) 0%, rgba(32,37,34,0) 60%)',
          }}
        />

        <div className="page relative">
          <Breadcrumb
            tone="dark"
            items={[
              { href: '/', label: 'Home' },
              { href: '/services', label: 'Services' },
              { href: `/services/${service.slug}`, label: service.name },
            ]}
          />

          <div className="mt-8 grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-sage-200/80">
                {service.tagline}
              </p>
              <h1 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                {service.name}
              </h1>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-porcelain-100/70">
                {service.shortDescription}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="border-l border-white/12 pl-6">
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-porcelain-100/45">
                  From
                </p>
                <p className="tnum mt-2 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.03em]">
                  {service.price} EGP
                </p>
                <p className="mt-1.5 text-[0.875rem] text-porcelain-100/55">
                  per session · {service.duration} min
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Media ──────────────────────────────────────────────────── */}
      <Section theme="graphite" className="relative overflow-hidden !py-0">
        <div className="relative h-[34vh] min-h-[240px] w-full overflow-hidden md:h-[48vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.coverImage}
            alt={service.name}
            className="h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(32,37,34,0.4) 0%, rgba(32,37,34,0) 32%, rgba(32,37,34,0.9) 100%)',
            }}
          />
        </div>
      </Section>

      {/* ── Detail ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-16 md:py-24">
          <div className="grid-12 gap-y-14">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>About this service</Eyebrow>
              <div className="mt-6 space-y-4">
                {service.fullDescription.split('\n').map((line, index) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h2
                        key={index}
                        className="pt-4 font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900"
                      >
                        {line.replace(/\*\*/g, '')}
                      </h2>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li
                        key={index}
                        className="flex gap-3 text-[0.9375rem] leading-relaxed text-graphite-700"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-teal-600"
                        />
                        {line.slice(2)}
                      </li>
                    )
                  }
                  if (line.startsWith('#')) return null
                  if (!line.trim()) return null
                  return (
                    <p key={index} className="text-[1.0625rem] leading-relaxed text-graphite-700">
                      {line}
                    </p>
                  )
                })}
              </div>

              {service.highlights.length > 0 ? (
                <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                  {service.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-2 text-[0.9375rem] text-graphite-700"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="shrink-0 text-teal-600"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Booking panel */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-[18px] border border-stone-300 bg-chalk p-6">
                  <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                    Booking
                  </p>
                  <p className="tnum mt-3 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
                    {service.price} EGP
                    <span className="ml-1.5 text-[0.9375rem] font-normal text-slate-600">
                      /session
                    </span>
                  </p>

                  <div className="mt-5">
                    <Rule />
                  </div>

                  <dl className="mt-5 space-y-2.5 text-[0.875rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Duration</dt>
                      <dd className="tnum font-medium text-graphite-900">
                        {service.duration} minutes
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Deposit</dt>
                      <dd className="tnum font-semibold text-teal-700">
                        {service.deposit} EGP (50%)
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Balance</dt>
                      <dd className="tnum font-medium text-graphite-900">
                        {service.price - service.deposit} EGP
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <ButtonLink href="/facilities" variant="primary" size="lg" withArrow className="w-full">
                      Check availability
                    </ButtonLink>
                  </div>

                  <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-600">
                    A reservation is confirmed only after the deposit payment
                    has been verified by the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Related ────────────────────────────────────────────────── */}
      {otherServices.length > 0 ? (
        <Section theme="chalk" className="relative overflow-hidden">
          <div className="page py-16 md:py-20">
            <Eyebrow>Also on DentalWeb</Eyebrow>
            <ul className="mt-8 grid gap-x-10 sm:grid-cols-3">
              {otherServices.map((other) => (
                <li key={other.id} className="border-t border-stone-300 py-5">
                  <Link
                    href={`/services/${other.slug}`}
                    className="group flex items-baseline justify-between gap-4"
                  >
                    <span className="font-display text-[1rem] font-semibold text-graphite-900 transition-colors group-hover:text-teal-700">
                      {other.name}
                    </span>
                    <span className="tnum shrink-0 text-[0.875rem] font-medium text-teal-700">
                      {other.price} EGP
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}
    </>
  )
}
