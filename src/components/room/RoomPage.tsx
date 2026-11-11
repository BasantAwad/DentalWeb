'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RoomSelector from '@/components/room/RoomSelector'
import type { StationState } from '@/components/room/RoomPlan'
import type { BlueprintStation } from '@/components/room/RoomBlueprintSvg'
import Section, { Eyebrow } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import Breadcrumb from '@/components/ui/Breadcrumb'

/**
 * The room plan experience.
 *
 * A dedicated page rather than a homepage section, because choosing a station
 * is a focused task that deserves the room to itself.
 *
 * Station availability is loaded from the backend. When no date and time are
 * chosen yet, only the static state is known and the page says so.
 */
export default function RoomPage({
  slug,
  initialStations,
  availabilitySource,
}: {
  slug: string
  initialStations: Record<string, StationState>
  availabilitySource: 'live' | 'preview'
}) {
  const [stations, setStations] = useState<Record<string, StationState>>(initialStations)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<BlueprintStation | null>(null)
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/facilities/${slug}/stations`)
      const payload = await response.json()
      if (!response.ok) {
        setMessage(payload.message ?? 'Station availability could not be loaded.')
        return
      }
      if (payload.backend === 'not_configured') {
        setMessage(
          payload.message ?? 'Station availability is not available yet.',
        )
        return
      }
      setStations(payload.stations ?? {})
      setLoaded(true)
    } catch {
      setMessage('Station availability could not be loaded.')
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const handleSelect = (
    station: BlueprintStation,
    _state: StationState | undefined,
  ) => {
    setSelectedStation(station)
    setSelectedStationId(station.id)
    // The backend resource the station maps to — what the booking flow
    // actually reserves. Present in the station payload even before a date
    // and time are chosen.
    setSelectedResourceId(stations[station.id]?.resourceId ?? null)
  }

  const selectedLabel = useMemo(() => {
    if (!selectedStation) return null
    return selectedStation.id
  }, [selectedStation])

  const showPreviewNote = availabilitySource === 'preview' && !loaded

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pt-28 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 78% 12%, rgba(47,119,114,0.18) 0%, rgba(32,37,34,0) 60%)',
          }}
        />
        <div className="page relative">
          <Breadcrumb
            tone="dark"
            items={[
              { href: '/facilities', label: 'Facilities' },
              { href: `/facilities/${slug}`, label: 'Facility' },
              { href: `/facilities/${slug}/room`, label: 'Room plan' },
            ]}
          />

          <div className="mt-7 grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow tone="dark">Training room</Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2rem,4.8vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
                Choose your place in the room.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[0.9375rem] leading-relaxed text-porcelain-100/65">
                Every phantom head station in the training lab, drawn to scale.
                Pick the one you want and it is held for your booking.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Plan ───────────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden !pt-0">
        <div className="page pb-20">
          {showPreviewNote ? (
            <p className="mb-6 flex items-start gap-2.5 rounded-[12px] border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.8125rem] leading-relaxed text-porcelain-100/70">
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
              {message ||
                'Illustrative layout. Live station availability is checked against the facility when you choose a date and time.'}
            </p>
          ) : null}

          <RoomSelector
            stations={stations}
            selectedStationId={selectedStationId}
            onSelect={handleSelect}
          />

          {/* Action */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-white/10 pt-8">
            {selectedLabel ? (
              <p className="text-[0.9375rem] text-porcelain-100/70">
                You have selected{' '}
                <span className="font-semibold text-porcelain-50">{selectedLabel}</span>.
              </p>
            ) : (
              <p className="text-[0.9375rem] text-porcelain-100/50">
                Select a station to continue.
              </p>
            )}

            <div className="ml-auto flex flex-wrap gap-3">
              <ButtonLink href={`/facilities/${slug}`} variant="tertiary-on-dark" size="lg">
                Back to facility
              </ButtonLink>
              <ButtonLink
                href={
                  selectedResourceId
                    ? `/facilities/${slug}/book?service=dummy_head&resource=${selectedResourceId}`
                    : `#`
                }
                variant="on-dark"
                size="lg"
                withArrow
                className={selectedResourceId ? '' : 'pointer-events-none opacity-45'}
              >
                Continue to booking
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
