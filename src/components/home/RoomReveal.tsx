'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import RoomPlan, { type StationState } from '@/components/room/RoomPlan'
import {
  BLUEPRINT_STATIONS,
  type BlueprintStation,
} from '@/components/room/RoomBlueprintSvg'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Scene 4 — The room.
 *
 * A teaser on the homepage: the real plan, at real proportions, with the
 * stations you can actually pick. The full selection experience — with
 * station details, live availability and the path into booking — lives on the
 * facility's own room page.
 */
export default function RoomReveal({
  slug,
  stations,
  availabilitySource,
}: {
  slug?: string
  stations: Record<string, StationState>
  availabilitySource: 'live' | 'preview'
}) {
  const [selected, setSelected] = useState<BlueprintStation | null>(null)

  const stationId = selected?.id ?? null

  const counts = useMemo(() => {
    let available = 0
    for (const station of BLUEPRINT_STATIONS) {
      if ((stations[station.id]?.status ?? 'available') === 'available') available += 1
    }
    return { available, total: BLUEPRINT_STATIONS.length }
  }, [stations])

  return (
    <Section id="room" theme="dark" className="relative overflow-hidden">
      <div className="page section-y">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-12 lg:col-span-6">
            <Eyebrow tone="dark">Room selection</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Choose your place in the room.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="text-[1.0625rem] leading-relaxed text-porcelain-100/65">
              Every phantom head station in the training lab, drawn to scale.
              Pick the one you want and it is held for your booking.
            </p>
          </div>
        </div>

        <div className="mt-12 grid-12 gap-y-10">
          {/* The plan */}
          <div className="col-span-12 min-w-0 lg:col-span-8">
            {availabilitySource === 'preview' ? (
              <p className="mb-5 flex items-start gap-2.5 rounded-[12px] border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.8125rem] leading-relaxed text-porcelain-100/70">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-sage-200"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                Illustrative layout. Live station availability is checked against
                the facility when you choose a date and time.
              </p>
            ) : null}

            <RoomPlan
              stations={stations}
              selectedStationId={stationId}
              onSelect={(station) => setSelected(station)}
            />
          </div>

          {/* Side notes */}
          <div className="col-span-12 min-w-0 lg:col-span-3 lg:col-start-10">
            <Reveal>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-porcelain-100/45">
                {selected ? 'Selected' : 'The room'}
              </p>
              <p className="mt-3 font-display text-[1.75rem] font-semibold text-porcelain-50">
                {selected ? selected.id : `${counts.total} stations`}
              </p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-porcelain-100/60">
                {selected
                  ? `${selected.zoneLabel}. This station is reserved for you once the deposit is verified.`
                  : `${counts.available} currently available. Each one is a separate, bookable unit.`}
              </p>

              <ul className="mt-6 space-y-2 text-[0.8125rem] text-porcelain-100/60">
                {[
                  { label: 'Available', color: '#2F7772' },
                  { label: 'Selected', color: '#7fc3bc' },
                  { label: 'Reserved', color: '#B44747' },
                  { label: 'Maintenance', color: '#929A94' },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {slug ? (
                  <ButtonLink
                    href={`/facilities/${slug}/room`}
                    variant="on-dark"
                    withArrow
                  >
                    Open the full room plan
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/facilities" variant="on-dark" withArrow>
                    Find a facility
                  </ButtonLink>
                )}
              </div>

              <p className="mt-4 text-[0.8125rem] leading-relaxed text-porcelain-100/45">
                Prefer a list? Every station is listed with its status on the
                facility&rsquo;s room page.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
