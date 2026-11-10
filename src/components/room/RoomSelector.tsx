'use client'

import { useMemo, useState } from 'react'
import RoomPlan, { type StationState, type StationStatus } from '@/components/room/RoomPlan'
import {
  BLUEPRINT_STATIONS,
  type BlueprintStation,
} from '@/components/room/RoomBlueprintSvg'

const STATUS_STYLE: Record<string, { label: string; dot: string; text: string }> = {
  available: { label: 'Available', dot: '#2F7772', text: 'text-teal-700' },
  selected: { label: 'Selected', dot: '#7fc3bc', text: 'text-teal-700' },
  reserved: { label: 'Reserved', dot: '#B44747', text: 'text-danger' },
  maintenance: { label: 'Maintenance', dot: '#929A94', text: 'text-slate-600' },
  'on-hold': { label: 'On hold', dot: '#98601C', text: 'text-warning' },
}

/**
 * The room selector.
 *
 * The plan is the primary interface; a synchronised list is always present
 * for keyboard and screen-reader users. Selecting a station is a separate
 * concern from confirming a booking — the selection only reflects what the
 * backend reports as available.
 */
export default function RoomSelector({
  stations,
  selectedStationId,
  onSelect,
}: {
  stations: Record<string, StationState>
  selectedStationId?: string | null
  onSelect?: (station: BlueprintStation, state: StationState | undefined) => void
}) {
  const [hovered, setHovered] = useState<BlueprintStation | null>(null)

  const selected = useMemo(
    () =>
      BLUEPRINT_STATIONS.find((station) => station.id === selectedStationId) ?? null,
    [selectedStationId],
  )

  const focused = hovered ?? selected
  const focusedId = focused?.id ?? null

  const counts = useMemo(() => {
    let available = 0
    let reserved = 0
    for (const station of BLUEPRINT_STATIONS) {
      const status = stations[station.id]?.status ?? 'available'
      if (status === 'available') available += 1
      if (status === 'reserved') reserved += 1
    }
    return { available, reserved, total: BLUEPRINT_STATIONS.length }
  }, [stations])

  /** The status shown for a station, accounting for the current selection. */
  const statusFor = (stationId: string): StationStatus =>
    selectedStationId === stationId
      ? 'selected'
      : (stations[stationId]?.status ?? 'available')

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      {/* `min-w-0` stops the scrollable plan from forcing the grid track
          wider than the viewport. */}
      <div className="min-w-0">
        <RoomPlan
          stations={stations}
          selectedStationId={selectedStationId}
          onSelect={(station, state) => {
            onSelect?.(station, state)
          }}
        />
        {/* Legend */}
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-porcelain-100/65">
          {(['available', 'selected', 'reserved', 'maintenance'] as const).map((status) => (
            <li key={status} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: STATUS_STYLE[status].dot }}
              />
              {STATUS_STYLE[status].label}
            </li>
          ))}
        </ul>
      </div>

      {/* Detail panel */}
      <div className="min-w-0 space-y-5">
        <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-porcelain-100/45">
            {focused ? 'Station' : 'Selected station'}
          </p>

          {focused && focusedId ? (
            <>
              <p className="mt-3 font-display text-[1.5rem] font-semibold text-porcelain-50">
                {stations[focused.id]?.label ?? focused.id}
              </p>
              <p className="mt-1 text-[0.8125rem] text-porcelain-100/55">
                {focused.zoneLabel}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_STYLE[statusFor(focusedId!)].dot }}
                />
                <span
                  className={[
                    'text-[0.8125rem] font-semibold',
                    STATUS_STYLE[statusFor(focusedId!)].text,
                  ].join(' ')}
                >
                  {STATUS_STYLE[statusFor(focusedId!)].label}
                </span>
              </div>

              {focusedId && stations[focusedId]?.reason ? (
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-porcelain-100/60">
                  {stations[focusedId]?.reason}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-porcelain-100/60">
              Hover a station to inspect it, or choose one from the list.
            </p>
          )}

          <p className="mt-5 border-t border-white/10 pt-4 text-[0.75rem] text-porcelain-100/45">
            {counts.available} of {counts.total} stations available
            {counts.reserved > 0 ? ` · ${counts.reserved} reserved` : ''}
          </p>
        </div>

        {/* Accessible list */}
        <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-porcelain-100/45">
            All stations
          </p>
          <ul className="mt-4 space-y-1">
            {BLUEPRINT_STATIONS.map((station) => {
              const state = stations[station.id]
              const isSelected = selectedStationId === station.id
              const status = statusFor(station.id)
              const style = STATUS_STYLE[status]
              const selectable = status === 'available' || status === 'selected'

              return (
                <li key={station.id}>
                  <button
                    type="button"
                    disabled={!selectable}
                    onClick={() => onSelect?.(station, state)}
                    onPointerEnter={() => setHovered(station)}
                    onPointerLeave={() =>
                      setHovered((current) =>
                        current?.id === station.id ? null : current,
                      )
                    }
                    onFocus={() => setHovered(station)}
                    onBlur={() =>
                      setHovered((current) =>
                        current?.id === station.id ? null : current,
                      )
                    }
                    aria-pressed={Boolean(isSelected)}
                    className={[
                      'flex w-full items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-colors duration-200',
                      isSelected
                        ? 'border-teal-400/60 bg-teal-600/20'
                        : selectable
                          ? 'border-transparent hover:border-white/15 hover:bg-white/[0.06]'
                          : 'cursor-not-allowed opacity-55',
                    ].join(' ')}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: style.dot }}
                      />
                      <span className="min-w-0">
                        <span className="block text-[0.875rem] font-semibold text-porcelain-50">
                          {state?.label ?? station.id}
                        </span>
                        <span className="block text-[0.6875rem] text-porcelain-100/45">
                          {station.zoneLabel}
                        </span>
                      </span>
                    </span>
                    <span
                      className={[
                        'shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
                        style.text,
                      ].join(' ')}
                    >
                      {style.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
