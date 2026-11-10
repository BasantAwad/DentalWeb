'use client'

import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const CAPABILITIES = [
  {
    title: 'Resource management',
    body: 'Add chairs, phantom heads and workstations. Each keeps its own availability and room mapping.',
  },
  {
    title: 'Room layouts',
    body: 'Upload the floor plan and place markers on the stations that are actually rentable. Customers pick from the same plan.',
  },
  {
    title: 'Booking management',
    body: 'A calendar built on resource-level reservations, so two stations can be booked at once and one can never be double-booked.',
  },
  {
    title: 'Facility presentation',
    body: 'A public profile with your photographs, services, opening hours and policies — presented as a place, not a listing.',
  },
]

/**
 * Scene 6 — For facility owners.
 *
 * A split composition: the proposition on one side, a working preview of the
 * workspace on the other. The preview is a designed mock of the tool's shape,
 * clearly labelled as a preview.
 */
export default function FacilityOwner() {
  return (
    <Section id="for-facilities" theme="dark" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 16% 10%, rgba(47,119,114,0.20) 0%, rgba(43,50,47,0) 62%)',
        }}
      />

      <div className="page section-y relative">
        <div className="grid-12 items-start gap-y-14">
          {/* Proposition */}
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow tone="dark">For facility owners</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Your space.
              <br />
              Better managed.
            </h2>
            <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-porcelain-100/65">
              One workspace for your rooms, your equipment and your reservations
              — so inquiries stop arriving as scattered messages and start
              arriving as confirmed bookings.
            </p>

            <ul className="mt-10">
              {CAPABILITIES.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={index * 0.05}
                  className="border-t border-white/10 py-6 first:border-t-0 first:pt-0"
                >
                  <h3 className="font-display text-[1.125rem] font-semibold text-porcelain-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-porcelain-100/60">
                    {item.body}
                  </p>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/manage" variant="on-dark" size="lg" withArrow>
                Open the workspace
              </ButtonLink>
              <span className="text-[0.8125rem] text-porcelain-100/45">
                Onboarding starts with your profile, rooms and rates.
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <WorkspacePreview />
          </div>
        </div>
      </div>
    </Section>
  )
}

/**
 * A designed preview of the management workspace.
 * Illustrative — it shows the shape of the tool, not live data.
 */
function WorkspacePreview() {
  const rows = [
    { time: '09:00', station: 'PH-01', label: 'Reserved session', state: 'confirmed' },
    { time: '10:00', station: 'PH-04', label: 'Deposit received', state: 'confirmed' },
    { time: '12:00', station: 'PH-04', label: 'Awaiting deposit', state: 'pending' },
    { time: '13:00', station: 'Chair 02', label: 'Maintenance block', state: 'blocked' },
    { time: '15:00', station: 'PH-11', label: 'Reserved session', state: 'confirmed' },
  ]

  const stateStyle: Record<string, string> = {
    confirmed: 'bg-teal-600/20 text-sage-200 border-teal-600/40',
    pending: 'bg-warning/20 text-[#E0B472] border-warning/40',
    blocked: 'bg-white/10 text-porcelain-100/70 border-white/15',
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/12 bg-graphite-900 shadow-2xl shadow-black/30">
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </span>
        <p className="text-[0.8125rem] font-medium text-porcelain-100/70">
          Training Lab — Main Branch
        </p>
        <span className="ml-auto rounded-[8px] border border-white/12 px-2.5 py-1 text-[0.6875rem] uppercase tracking-[0.1em] text-porcelain-100/45">
          Preview
        </span>
      </div>

      <div className="sm:grid sm:grid-cols-[10rem_minmax(0,1fr)]">
        {/* Sidebar */}
        <nav
          aria-label="Management sections (preview)"
          className="border-b border-white/10 p-4 sm:border-b-0 sm:border-r"
        >
          <ul className="space-y-1">
            {['Overview', 'Bookings', 'Resources', 'Room layouts', 'Courses', 'Settings'].map(
              (item, index) => (
                <li key={item}>
                  <span
                    className={[
                      'block rounded-[8px] px-3 py-2 text-[0.8125rem]',
                      index === 1
                        ? 'bg-teal-600/20 font-semibold text-sage-200'
                        : 'text-porcelain-100/50',
                    ].join(' ')}
                  >
                    {item}
                  </span>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* Workspace */}
        <div className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-[1.125rem] font-semibold">Today&rsquo;s bookings</h3>
            <p className="tnum text-[0.75rem] text-porcelain-100/45">
              14 reservations · 2 awaiting deposit
            </p>
          </div>

          <ul className="mt-5 space-y-2">
            {rows.map((row) => (
              <li
                key={`${row.time}-${row.station}`}
                className="flex flex-wrap items-center gap-3 rounded-[10px] border border-white/8 bg-white/[0.03] px-3.5 py-2.5"
              >
                <span className="tnum w-12 shrink-0 text-[0.8125rem] text-porcelain-100/55">
                  {row.time}
                </span>
                <span className="w-16 shrink-0 text-[0.8125rem] font-semibold text-porcelain-50">
                  {row.station}
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-porcelain-100/55">
                  {row.label}
                </span>
                <span
                  className={[
                    'shrink-0 rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
                    stateStyle[row.state],
                  ].join(' ')}
                >
                  {row.state === 'confirmed'
                    ? 'Confirmed'
                    : row.state === 'pending'
                      ? 'On hold'
                      : 'Blocked'}
                </span>
              </li>
            ))}
          </ul>

          {/* Room plan fragment */}
          <div className="mt-6 rounded-[14px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.8125rem] font-semibold text-porcelain-100/80">
                Room layout — 14 stations mapped
              </p>
              <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-porcelain-100/40">
                Edit markers
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 14 }).map((_, index) => (
                <span
                  key={index}
                  className={[
                    'aspect-square rounded-[5px] border',
                    index === 3
                      ? 'border-teal-400 bg-teal-600/40'
                      : index === 8
                        ? 'border-[#B44747]/60 bg-[#B44747]/25'
                        : 'border-white/12 bg-white/[0.04]',
                  ].join(' ')}
                />
              ))}
              <span className="aspect-square rounded-[5px] border border-dashed border-white/15" />
              <span className="aspect-square rounded-[5px] border border-dashed border-white/15" />
            </div>
          </div>

          {/* Metrics */}
          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { term: 'Occupied today', value: '11' },
              { term: 'Deposits pending', value: '2' },
              { term: 'Station utilisation', value: '79%' },
            ].map((metric) => (
              <div
                key={metric.term}
                className="rounded-[12px] border border-white/8 bg-white/[0.03] px-3.5 py-3"
              >
                <dt className="text-[0.6875rem] uppercase tracking-[0.1em] text-porcelain-100/40">
                  {metric.term}
                </dt>
                <dd className="tnum mt-1 font-display text-[1.375rem] font-semibold text-porcelain-50">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <Rule tone="dark" />
          </div>
        </div>
      </div>
    </div>
  )
}
