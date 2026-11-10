'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  BlueprintGeometry,
  BLUEPRINT_STATIONS,
  type BlueprintStation,
} from '@/components/room/RoomBlueprintSvg'

export type StationStatus = 'available' | 'selected' | 'reserved' | 'maintenance' | 'on-hold'

export interface StationState {
  /** Stable backend resource identifier. */
  resourceId: string
  status: StationStatus
  label?: string
  /** Customer-safe explanation when the station cannot be selected. */
  reason?: string
}

export interface RoomPlanProps {
  /** Availability keyed by station id. A missing entry means "not yet known". */
  stations: Record<string, StationState>
  /**
   * The station that is currently selected, by blueprint station id.
   *
   * Selection is expressed against the blueprint's own station ids, because
   * the plan is what the visitor sees. The mapping from a station to a
   * backend resource id lives in `stations[].resourceId` and is what the
   * booking API receives.
   */
  selectedStationId?: string | null
  onSelect?: (station: BlueprintStation, state: StationState | undefined) => void
  className?: string
  /** Show the zoom/pan toolbar. */
  showControls?: boolean
}

const STATUS_STYLE: Record<
  StationStatus,
  { fill: string; stroke: string; label: string; selectable: boolean }
> = {
  available: {
    fill: 'rgba(47,119,114,0.9)',
    stroke: '#7fc3bc',
    label: 'Available',
    selectable: true,
  },
  selected: {
    fill: '#2F7772',
    stroke: '#C8D9CF',
    label: 'Selected',
    selectable: true,
  },
  reserved: {
    fill: 'rgba(180,71,71,0.92)',
    stroke: '#B44747',
    label: 'Reserved',
    selectable: false,
  },
  maintenance: {
    fill: 'rgba(146,154,148,0.92)',
    stroke: '#929A94',
    label: 'Maintenance',
    selectable: false,
  },
  'on-hold': {
    fill: 'rgba(152,96,28,0.92)',
    stroke: '#98601C',
    label: 'On hold',
    selectable: false,
  },
}

const MARKER_RADIUS = 20

/**
 * The interactive room plan.
 *
 * The supplied blueprint is rendered verbatim; availability is expressed by
 * an overlay of markers so the plan's own geometry is never altered.
 *
 * Hover and selection are visually distinct: hovering lifts a station and
 * shows its details, selecting keeps it highlighted and outlined.
 */
export default function RoomPlan({
  stations,
  selectedStationId,
  onSelect,
  className = '',
  showControls = true,
}: RoomPlanProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const viewBox = useMemo(() => {
    const w = 1600 / zoom
    const h = 1100 / zoom
    return `${(1600 - w) / 2 + pan.x} ${(1100 - h) / 2 + pan.y} ${w} ${h}`
  }, [zoom, pan])

  const reset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const zoomBy = (factor: number) => {
    setZoom((z) => Math.min(3, Math.max(1, Number((z * factor).toFixed(3)))))
  }

  const statusOf = (station: BlueprintStation): StationStatus => {
    if (selectedStationId === station.id) return 'selected'
    return stations[station.id]?.status ?? 'available'
  }

  return (
    <div className={className}>
      <div className="relative min-w-0 overflow-hidden rounded-[18px] border border-stone-300 bg-graphite-900">
        {/* On narrow screens the plan is shown at a minimum width inside a
            scroll container, so station hit targets stay finger-sized. The
            synchronised list beside it remains the primary alternative. */}
        <div className="overflow-x-auto overscroll-x-contain">
          <div
            className="plan-root relative aspect-[16/11] w-full min-w-[680px] select-none"
            style={{
              cursor: dragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onPointerDown={(event) => {
            dragOrigin.current = {
              x: event.clientX,
              y: event.clientY,
              panX: pan.x,
              panY: pan.y,
            }
            setDragging(true)
            const target = event.target as Element
            if (typeof target.setPointerCapture === 'function') {
              target.setPointerCapture(event.pointerId)
            }
          }}
          onPointerMove={(event) => {
            if (!dragging) return
            const scale = 1600 / zoom / 900
            setPan({
              x: dragOrigin.current.panX - (event.clientX - dragOrigin.current.x) * scale,
              y: dragOrigin.current.panY - (event.clientY - dragOrigin.current.y) * scale,
            })
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onPointerLeave={() => {
            setDragging(false)
            setHovered(null)
          }}
        >
          <svg
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full"
            role="group"
            aria-label="Interactive room plan with selectable phantom head stations"
          >
            <BlueprintGeometry />

            {BLUEPRINT_STATIONS.map((station) => {
              const state = stations[station.id]
              const status = statusOf(station)
              const style = STATUS_STYLE[status]
              const isHovered = hovered === station.id
              const isSelected = status === 'selected'

              return (
                <g
                  key={station.id}
                  transform={`translate(${station.head.x} ${station.head.y})`}
                  style={{
                    cursor: style.selectable ? 'pointer' : 'not-allowed',
                    transition: 'opacity 180ms ease',
                  }}
                  onPointerEnter={() => setHovered(station.id)}
                  onPointerLeave={() =>
                    setHovered((current) => (current === station.id ? null : current))
                  }
                  onClick={(event) => {
                    event.stopPropagation()
                    if (style.selectable) onSelect?.(station, state)
                  }}
                  role="button"
                  tabIndex={style.selectable ? 0 : -1}
                  aria-label={`${station.id} — ${style.label}${state?.reason ? `, ${state.reason}` : ''}`}
                  aria-pressed={isSelected}
                  onKeyDown={(event) => {
                    if (!style.selectable) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect?.(station, state)
                    }
                  }}
                >
                  {/* Generous invisible hit target for touch. */}
                  <circle r={40} fill="transparent" />

                  {/* Hover halo — distinct from the selected outline */}
                  {isHovered && !isSelected ? (
                    <circle r={MARKER_RADIUS + 7} fill="none" stroke="#C8D9CF" strokeWidth={1.5} opacity={0.7} />
                  ) : null}

                  {/* Selected outline */}
                  {isSelected ? (
                    <>
                      <circle r={MARKER_RADIUS + 7} fill="none" stroke="#C8D9CF" strokeWidth={3.5} />
                      <circle r={MARKER_RADIUS + 12} fill="none" stroke="#2F7772" strokeWidth={1.5} opacity={0.6} />
                    </>
                  ) : null}

                  <circle
                    r={MARKER_RADIUS}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Status glyph — never colour alone */}
                  {isSelected ? (
                    <path
                      d="M-7 0 L-2 5.5 L8 -6.5"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={3.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : status === 'reserved' ? (
                    <g>
                      <rect x={-6} y={-1.5} width={12} height={11} rx={2} fill="none" stroke="#FFFFFF" strokeWidth={2} />
                      <path d="M-3.5 -1.5 v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none" stroke="#FFFFFF" strokeWidth={2} />
                    </g>
                  ) : status === 'maintenance' ? (
                    <path
                      d="M-6 6 L6 -6 M6 6 L-6 -6"
                      stroke="#202522"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  ) : status === 'on-hold' ? (
                    <circle r={5} fill="none" stroke="#FFFFFF" strokeWidth={2.4} />
                  ) : (
                    <circle r={4.5} fill="#FFFFFF" opacity={0.95} />
                  )}

                  {/* Station label */}
                  <text
                    y={MARKER_RADIUS + 19}
                    textAnchor="middle"
                    fontSize={16}
                    fontFamily="Manrope, Inter, sans-serif"
                    fontWeight={700}
                    fill="#F2F0E9"
                    stroke="#202522"
                    strokeWidth={4}
                    paintOrder="stroke"
                  >
                    {station.id}
                  </text>
                </g>
              )
            })}
          </svg>
          </div>
        </div>

        {showControls ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-[10px] bg-graphite-900/85 p-1.5 backdrop-blur-sm">
            <PlanButton label="Zoom out" onClick={() => zoomBy(0.85)}>
              <path d="M5 12h14" />
            </PlanButton>
            <PlanButton label="Reset view" onClick={reset}>
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </PlanButton>
            <PlanButton label="Zoom in" onClick={() => zoomBy(1.18)}>
              <path d="M12 5v14M5 12h14" />
            </PlanButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function PlanButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-sage-200 transition-colors duration-200 hover:bg-white/10"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
