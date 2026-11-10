'use client'

import { useMemo, useState } from 'react'

/**
 * Interactive dental arch / typodont.
 *
 * Every tooth is an independently interactive element with its own stable FDI
 * identifier. Hover and selection are visually distinct, and the selection is
 * held in the parent component so it can be submitted with a booking.
 *
 * The geometry is a temporary procedural typodont — a real per-tooth model
 * can replace it later without changing the selection contract, because the
 * contract is the FDI code, not the mesh.
 *
 * Tooth crowns follow real morphology: flat-edged incisors, pointed canines,
 * bicuspid premolars and four-cusped molars, set into a gum band.
 */

export type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar'

export interface ToothDefinition {
  /** FDI two-digit code. */
  code: string
  name: string
  type: ToothType
  arch: 'upper' | 'lower'
  quadrant: 1 | 2 | 3 | 4
}

const UPPER: ToothDefinition[] = [
  { code: '18', name: 'Upper right third molar', type: 'molar', arch: 'upper', quadrant: 1 },
  { code: '17', name: 'Upper right second molar', type: 'molar', arch: 'upper', quadrant: 1 },
  { code: '16', name: 'Upper right first molar', type: 'molar', arch: 'upper', quadrant: 1 },
  { code: '15', name: 'Upper right second premolar', type: 'premolar', arch: 'upper', quadrant: 1 },
  { code: '14', name: 'Upper right first premolar', type: 'premolar', arch: 'upper', quadrant: 1 },
  { code: '13', name: 'Upper right canine', type: 'canine', arch: 'upper', quadrant: 1 },
  { code: '12', name: 'Upper right lateral incisor', type: 'incisor', arch: 'upper', quadrant: 1 },
  { code: '11', name: 'Upper right central incisor', type: 'incisor', arch: 'upper', quadrant: 1 },
  { code: '21', name: 'Upper left central incisor', type: 'incisor', arch: 'upper', quadrant: 2 },
  { code: '22', name: 'Upper left lateral incisor', type: 'incisor', arch: 'upper', quadrant: 2 },
  { code: '23', name: 'Upper left canine', type: 'canine', arch: 'upper', quadrant: 2 },
  { code: '24', name: 'Upper left first premolar', type: 'premolar', arch: 'upper', quadrant: 2 },
  { code: '25', name: 'Upper left second premolar', type: 'premolar', arch: 'upper', quadrant: 2 },
  { code: '26', name: 'Upper left first molar', type: 'molar', arch: 'upper', quadrant: 2 },
  { code: '27', name: 'Upper left second molar', type: 'molar', arch: 'upper', quadrant: 2 },
  { code: '28', name: 'Upper left third molar', type: 'molar', arch: 'upper', quadrant: 2 },
]

const LOWER: ToothDefinition[] = [
  { code: '48', name: 'Lower right third molar', type: 'molar', arch: 'lower', quadrant: 4 },
  { code: '47', name: 'Lower right second molar', type: 'molar', arch: 'lower', quadrant: 4 },
  { code: '46', name: 'Lower right first molar', type: 'molar', arch: 'lower', quadrant: 4 },
  { code: '45', name: 'Lower right second premolar', type: 'premolar', arch: 'lower', quadrant: 4 },
  { code: '44', name: 'Lower right first premolar', type: 'premolar', arch: 'lower', quadrant: 4 },
  { code: '43', name: 'Lower right canine', type: 'canine', arch: 'lower', quadrant: 4 },
  { code: '42', name: 'Lower right lateral incisor', type: 'incisor', arch: 'lower', quadrant: 4 },
  { code: '41', name: 'Lower right central incisor', type: 'incisor', arch: 'lower', quadrant: 4 },
  { code: '31', name: 'Lower left central incisor', type: 'incisor', arch: 'lower', quadrant: 3 },
  { code: '32', name: 'Lower left lateral incisor', type: 'incisor', arch: 'lower', quadrant: 3 },
  { code: '33', name: 'Lower left canine', type: 'canine', arch: 'lower', quadrant: 3 },
  { code: '34', name: 'Lower left first premolar', type: 'premolar', arch: 'lower', quadrant: 3 },
  { code: '35', name: 'Lower left second premolar', type: 'premolar', arch: 'lower', quadrant: 3 },
  { code: '36', name: 'Lower left first molar', type: 'molar', arch: 'lower', quadrant: 3 },
  { code: '37', name: 'Lower left second molar', type: 'molar', arch: 'lower', quadrant: 3 },
  { code: '38', name: 'Lower left third molar', type: 'molar', arch: 'lower', quadrant: 3 },
]

export const TEETH: ToothDefinition[] = [...UPPER, ...LOWER]

export function getTooth(code: string): ToothDefinition | undefined {
  return TEETH.find((tooth) => tooth.code === code)
}

/** Crown width, in typodont units. */
const WIDTH: Record<ToothType, number> = {
  incisor: 30,
  canine: 31,
  premolar: 29,
  molar: 38,
}

/** Crown length, in typodont units. */
const HEIGHT: Record<ToothType, number> = {
  incisor: 44,
  canine: 48,
  premolar: 38,
  molar: 34,
}

/** Number of cusps along the biting edge. */
const CUSPS: Record<ToothType, number> = {
  incisor: 1,
  canine: 1,
  premolar: 2,
  molar: 4,
}

/**
 * Builds a crown outline.
 *
 * Local space: the neck is at y = 0 and the crown's biting edge is at y = h,
 * with cusps pointing towards +y. The neck end is flat because it sits under
 * the gum.
 */
function crownPath(width: number, height: number, type: ToothType): string {
  const half = width / 2
  const neck = height * 0.42
  const edge = height
  const cusps = CUSPS[type]
  const depth = type === 'incisor' ? 0 : type === 'canine' ? height * 0.2 : height * 0.13

  let path = `M ${-half} 0 L ${-half} ${neck}`

  if (type === 'incisor') {
    // A flat, slightly rounded biting edge.
    path += ` L ${-half} ${edge - 5} Q ${-half} ${edge} ${-half + 5} ${edge}`
    path += ` L ${half - 5} ${edge} Q ${half} ${edge} ${half} ${edge - 5}`
  } else {
    // A scalloped edge: each cusp is a quadratic bulge towards +y.
    const step = width / cusps
    for (let i = 0; i < cusps; i += 1) {
      const from = -half + i * step
      const to = from + step
      const mid = (from + to) / 2
      path += ` L ${from} ${edge - depth * 0.35}`
      path += ` Q ${mid} ${edge + depth} ${to} ${edge - depth * 0.35}`
    }
  }

  path += ` L ${half} ${neck} L ${half} 0 Z`
  return path
}

/** The gum band that the teeth are set into. */
const GUM = '#D98C86'
const GUM_SHADE = '#C47872'
const ENAMEL = '#FBF7EE'
const ENAMEL_SHADE = '#E6DFCF'

interface ArchTeethProps {
  arch: 'upper' | 'lower'
  selected: string[]
  hovered: string | null
  onHover: (code: string | null) => void
  onToggle: (code: string) => void
}

/**
 * Computes the arch curve and each tooth's position.
 *
 * The upper arch crowns hang down from a curve near the top of the band; the
 * lower arch crowns rise from a curve near the bottom. The two bands meet in
 * the middle so the arches read as one mouth.
 */
function archGeometry(arch: 'upper' | 'lower') {
  const teeth = arch === 'upper' ? UPPER : LOWER
  const count = teeth.length
  const centre = count / 2
  const rise = 64
  // The two arches are separated by the natural occlusal gap, so the crowns
  // never collide in the middle.
  const base = arch === 'upper' ? 104 : 216

  const items = teeth.map((tooth, index) => {
    const offset = index - centre + 0.5
    const ratio = Math.abs(offset) / centre
    // Parabolic arch: the front teeth sit at the centre, the molars curve
    // back toward the ends.
    const neckY =
      arch === 'upper' ? base - rise * ratio * ratio : base + rise * ratio * ratio
    return {
      tooth,
      x: 310 + offset * 38,
      neckY,
      width: WIDTH[tooth.type],
      height: HEIGHT[tooth.type],
    }
  })

  return { items, gumPath: gumPathFor(items) }
}

/** A smooth band that follows the tooth necks exactly. */
function gumPathFor(
  items: { x: number; neckY: number }[],
): string {
  if (items.length === 0) return ''
  const first = items[0]
  let path = `M ${first.x - 22} ${first.neckY}`
  for (let i = 1; i < items.length; i += 1) {
    const previous = items[i - 1]
    const current = items[i]
    const midX = (previous.x + current.x) / 2
    const midY = (previous.neckY + current.neckY) / 2
    path += ` Q ${previous.x} ${previous.neckY} ${midX} ${midY}`
  }
  const last = items[items.length - 1]
  path += ` Q ${last.x} ${last.neckY} ${last.x + 22} ${last.neckY}`
  return path
}

function ArchTeeth({
  arch,
  selected,
  hovered,
  onHover,
  onToggle,
}: ArchTeethProps) {
  const { items, gumPath } = archGeometry(arch)
  // Upper crowns point down, lower crowns point up.
  const flip = arch === 'lower' ? -1 : 1

  return (
    <>
      {/* Gum ridge, drawn behind the teeth */}
      <path
        d={gumPath}
        fill="none"
        stroke={GUM}
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={gumPath}
        fill="none"
        stroke={GUM_SHADE}
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.22}
        transform={arch === 'upper' ? 'translate(0 -6)' : 'translate(0 6)'}
      />

      {items.map(({ tooth, x, neckY, width, height }) => {
        const isSelected = selected.includes(tooth.code)
        const isHovered = hovered === tooth.code

        return (
          <g
            key={tooth.code}
            transform={`translate(${x} ${neckY})`}
            onPointerEnter={() => onHover(tooth.code)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onToggle(tooth.code)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToggle(tooth.code)
              }
            }}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${tooth.code} — ${tooth.name}${isSelected ? ', selected' : ''}`}
            className="cursor-pointer outline-none"
          >
            {/* Generous hit target — the whole tooth column is tappable */}
            <rect
              x={-width / 2 - 5}
              y={flip === 1 ? -6 : -height - 6}
              width={width + 10}
              height={height + 12}
              fill="transparent"
            />

            {/* Crown — flipped vertically for the lower arch */}
            <g transform={flip === -1 ? 'scale(1,-1)' : undefined}>
              <path
                d={crownPath(width, height, tooth.type)}
                fill={isSelected ? '#2F7772' : ENAMEL}
                stroke={isSelected ? '#1d4f4b' : ENAMEL_SHADE}
                strokeWidth={isSelected ? 2 : 1.2}
                strokeLinejoin="round"
                className="transition-all duration-150"
              />

              {/* Selected checkmark — never colour alone */}
              {isSelected ? (
                <path
                  d={`M ${-width / 6} ${height * 0.66} L ${-width / 14} ${height * 0.78} L ${width / 5} ${height * 0.54}`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Hover ring — distinct from the selected fill */}
              {isHovered && !isSelected ? (
                <path
                  d={crownPath(width + 5, height + 5, tooth.type)}
                  fill="none"
                  stroke="#2F7772"
                  strokeOpacity={0.55}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ) : null}
            </g>

            {/* A soft gum collar where the tooth meets the ridge */}
            <path
              d={`M ${-width / 2 - 1} ${flip === 1 ? -4 : -10} L ${width / 2 + 1} ${flip === 1 ? -4 : -10} L ${width / 2 + 1} ${flip === 1 ? 10 : 4} L ${-width / 2 - 1} ${flip === 1 ? 10 : 4} Z`}
              fill={isSelected ? '#1d4f4b' : GUM}
              opacity={isSelected ? 0.85 : 0.95}
            />

            {/* FDI code */}
            <text
              y={arch === 'upper' ? -24 : 26}
              textAnchor="middle"
              fontSize={12}
              fontFamily="Inter, sans-serif"
              fontWeight={600}
              fill="currentColor"
              fillOpacity={isSelected ? 0.95 : 0.6}
            >
              {tooth.code}
            </text>
          </g>
        )
      })}
    </>
  )
}

/**
 * The complete mouth: both arches in one coordinate space so the upper and
 * lower teeth meet correctly.
 */
function Mouth({
  selected,
  onToggle,
  className,
}: {
  selected: string[]
  onToggle: (code: string) => void
  className?: string
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <svg
      viewBox="-20 -34 660 366"
      className={className}
      role="group"
      aria-label="Dental arch — upper and lower teeth"
    >
      <ArchTeeth
        arch="upper"
        selected={selected}
        hovered={hovered}
        onHover={setHovered}
        onToggle={onToggle}
      />
      <ArchTeeth
        arch="lower"
        selected={selected}
        hovered={hovered}
        onHover={setHovered}
        onToggle={onToggle}
      />
    </svg>
  )
}

export interface ToothSelectorProps {
  selected: string[]
  onToggle: (code: string) => void
  onClear?: () => void
  className?: string
}

/**
 * The complete tooth selection control: both arches plus the selected list.
 */
export default function ToothSelector({
  selected,
  onToggle,
  onClear,
  className = '',
}: ToothSelectorProps) {
  return (
    <div className={className}>
      {/* On narrow screens the arch is shown at a minimum width inside a
          scroll container, so each tooth stays comfortably tappable. */}
      <div className="overflow-x-auto overscroll-x-contain">
        <Mouth
          selected={selected}
          onToggle={onToggle}
          className="w-full min-w-[620px] text-graphite-900"
        />
      </div>

      {/* Selection summary */}
      <div className="mt-8 border-t border-stone-300 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Selected teeth
          </p>
          {selected.length > 0 && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-11 items-center text-[0.8125rem] font-medium text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {selected.length === 0 ? (
          <p className="mt-3 text-[0.9375rem] text-slate-600">
            No teeth selected. You can continue without selecting any.
          </p>
        ) : (
          <>
            <ul className="mt-4 flex flex-wrap gap-2">
              {selected.map((code) => {
                const tooth = getTooth(code)
                return (
                  <li key={code}>
                    <button
                      type="button"
                      onClick={() => onToggle(code)}
                      aria-label={`Remove tooth ${code}${tooth ? `, ${tooth.name}` : ''}`}
                      className="group flex min-h-11 items-center gap-2 rounded-[8px] border border-teal-600/40 bg-teal-100 px-3 py-1.5 text-[0.8125rem] font-semibold text-graphite-900 transition-colors duration-200 hover:border-danger/50 hover:bg-danger/10"
                    >
                      <span className="tnum">{code}</span>
                      <span className="text-slate-600 group-hover:text-danger">
                        {tooth ? tooth.type : ''}
                      </span>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden="true"
                        className="text-slate-500 group-hover:text-danger"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-slate-600">
              This tells the facility what you plan to work on so they can prepare
              the station. It is not a diagnosis and no clinical record is kept.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
