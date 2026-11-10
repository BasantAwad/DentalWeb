/**
 * Extracts the supplied room blueprint (dental_dummy_head_lab_blueprint.html)
 * into:
 *   1. public/models/rooms/dummy-head-lab-blueprint.svg  (verbatim SVG source, reference copy)
 *   2. src/components/room/RoomBlueprintSvg.tsx           (inline JSX version with stable station ids)
 *
 * The script never alters path geometry — it only:
 *   - extracts the <svg> element
 *   - converts SVG attribute names to their JSX equivalents
 *   - annotates the 14 phantom-head station groups with stable ids
 *   - computes the head-centre coordinates used by the interactive overlay
 *
 * Run: node scripts/extract-blueprint.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceFile = path.join(root, 'dental_dummy_head_lab_blueprint.html')
const html = fs.readFileSync(sourceFile, 'utf8')

const svgStart = html.indexOf('<svg id="blueprint-svg"')
const svgEnd = html.indexOf('</svg>', svgStart) + '</svg>'.length
if (svgStart === -1 || svgEnd === -1) {
  throw new Error('Could not locate #blueprint-svg in the source blueprint')
}
let svg = html.slice(svgStart, svgEnd)

// ---------------------------------------------------------------------------
// 1. Station metadata — derived from the blueprint's own transform values.
//    Station ids follow the labels visible on the supplied plan (PH-01 … PH-14).
// ---------------------------------------------------------------------------
const stationsBlockStart = svg.indexOf('<g id="dental-workstations">')
const stationsBlockEnd = svg.indexOf('<g id="wall-equipment">')
if (stationsBlockStart === -1 || stationsBlockEnd === -1) {
  throw new Error('Could not locate the dental-workstations group')
}
const stationBlock = svg.slice(stationsBlockStart, stationsBlockEnd)
const transforms = [...stationBlock.matchAll(/<g transform="translate\((-?[\d.]+),\s*(-?[\d.]+)\)\s*rotate\((-?[\d.]+)\)">/g)].map(
  (m) => ({ x: Number(m[1]), y: Number(m[2]), rot: Number(m[3]) }),
)

if (transforms.length !== 14) {
  throw new Error(`Expected 14 phantom-head stations, found ${transforms.length}`)
}

/** The mannequin head inside #phantom-head-unit is centred ~67 units along local -Y. */
const HEAD_LOCAL_Y = -67
function headCentre(t) {
  const rad = (t.rot * Math.PI) / 180
  const cos = Math.round(Math.cos(rad))
  const sin = Math.round(Math.sin(rad))
  const lx = 0
  const ly = HEAD_LOCAL_Y
  return {
    x: Math.round(t.x + (lx * cos - ly * sin)),
    y: Math.round(t.y + (lx * sin + ly * cos)),
  }
}

/**
 * Station grouping follows the blueprint's own layout:
 *   PH-01…PH-07  top counter
 *   PH-08…PH-10  left wall counter
 *   PH-11…PH-14  bottom counter
 */
const GROUPS = [
  { from: 0, to: 6, zone: 'top-counter', label: 'Top counter' },
  { from: 7, to: 9, zone: 'left-wall', label: 'Left wall counter' },
  { from: 10, to: 13, zone: 'bottom-counter', label: 'Bottom counter' },
]

const stations = transforms.map((t, i) => {
  const id = `PH-${String(i + 1).padStart(2, '0')}`
  const group = GROUPS.find((g) => i >= g.from && i <= g.to)
  if (!group) throw new Error(`No zone group for station index ${i}`)
  const head = headCentre(t)
  return {
    index: i + 1,
    id,
    label: id,
    zone: group.zone,
    zoneLabel: group.label,
    transform: { x: t.x, y: t.y, rot: t.rot },
    head,
  }
})

// ---------------------------------------------------------------------------
// 2. Annotate station groups with stable ids + head coordinates.
// ---------------------------------------------------------------------------
let stationCursor = 0
svg = svg.replace(
  /<g transform="translate\((-?[\d.]+),\s*(-?[\d.]+)\)\s*rotate\((-?[\d.]+)\)">/g,
  (match, x, y, rot) => {
    // Only the first 14 matches belong to the workstation group.
    if (stationCursor >= stations.length) return match
    const station = stations[stationCursor++]
    return (
      `<g id="station-${station.id.toLowerCase()}" ` +
      `data-station-id="${station.id}" ` +
      `data-resource-key="phantom-head-${station.id.toLowerCase()}" ` +
      `data-zone="${station.zone}" ` +
      `data-head-x="${station.head.x}" data-head-y="${station.head.y}" ` +
      `class="plan-station" transform="translate(${x}, ${y}) rotate(${rot})">`
    )
  },
)

// ---------------------------------------------------------------------------
// 3. SVG -> JSX attribute conversion.
// ---------------------------------------------------------------------------
const ATTR_MAP = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-miterlimit': 'strokeMiterlimit',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'pattern-transform': 'patternTransform',
  'patternUnits': 'patternUnits',
  'markerWidth': 'markerWidth',
  'markerHeight': 'markerHeight',
}

/**
 * Literal colours in the source plan are rewritten as CSS custom properties.
 *
 * This is required because `<use>` creates a shadow tree: an attribute
 * selector such as `[fill="#38bdf8"]` never matches inside it, so every
 * symbol (phantom heads, stools, lamps) would keep its original colour.
 * Referencing a variable works in both the light DOM and the shadow tree.
 */
const COLOR_MAP = {
  '#38bdf8': 'var(--plan-line)',
  '#0b1326': 'var(--plan-bg)',
  '#1e293b': 'var(--plan-fill)',
  '#334155': 'var(--plan-fill-2)',
  '#475569': 'var(--plan-metal-3)',
  '#64748b': 'var(--plan-metal)',
  '#94a3b8': 'var(--plan-metal-2)',
  '#cbd5e1': 'var(--plan-soft)',
  '#f59e0b': 'var(--plan-accent)',
  '#ef4444': 'var(--plan-gums)',
  '#dc2626': 'var(--plan-gums-dark)',
  '#ffffff': 'var(--plan-teeth)',
  '#0284c7': 'var(--plan-fill-2)',
  '#22c55e': 'var(--plan-accent)',
  'rgba(30, 58, 138, 0.3)': 'rgba(127, 195, 188, 0.1)',
  'rgba(56, 189, 248, 0.12)': 'rgba(200, 217, 207, 0.14)',
  'url(#wall-hatch)': 'url(#wall-hatch)',
}

function toJsx(source) {
  let out = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/class=/g, 'className=')
    .replace(/\bxmlns:xlink=/g, 'xmlnsXlink=')

  // Replace colour literals with CSS custom property references.
  for (const [literal, variable] of Object.entries(COLOR_MAP)) {
    if (variable === literal) continue
    out = out.split(`"${literal}"`).join(`"${variable}"`)
  }

  out = out.replace(/([a-zA-Z-]+)=/g, (full, name) => {
    const mapped = ATTR_MAP[name]
    return mapped ? `${mapped}=` : full
  })

  return out
}

// ---------------------------------------------------------------------------
// 4. Emissive files.
// ---------------------------------------------------------------------------

// 4a. Reference copy of the untouched blueprint, for the asset guide + future
//     3D room authoring. The reference copy keeps original colours.
const referenceSvg = svg.replace(/ class="plan-station"/g, '').replace(
  / id="station-[a-z0-9-]+" data-station-id="[^"]*" data-resource-key="[^"]*" data-zone="[^"]*" data-head-x="[^"]*" data-head-y="[^"]*"/g,
  '',
)
const outDir = path.join(root, 'public', 'models', 'rooms')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'dummy-head-lab-blueprint.svg'), referenceSvg, 'utf8')

// 4b. Inline JSX component used by the room selector / homepage room scene.
//     Colours are resolved to CSS custom properties so the plan can be
//     re-themed and so `<use>` shadow trees inherit the variables.
const jsx = toJsx(svg)
  .replace('<svg id="blueprint-svg"', '<svg\n      id="blueprint-svg"\n      xmlns="http://www.w3.org/2000/svg"')
  .replace('viewBox="0 0 1600 1100"', 'viewBox="0 0 1600 1100"\n      preserveAspectRatio="xMidYMid meet"')

const component = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: dental_dummy_head_lab_blueprint.html (supplied room blueprint)
 * Regenerate: node scripts/extract-blueprint.mjs
 *
 * Geometry is preserved verbatim from the source plan. The only changes are:
 *   - JSX attribute names
 *   - stable ids / data attributes on the 14 phantom-head stations
 *
 * Station ids (PH-01 … PH-14) and their zones come from the plan itself:
 *   PH-01…PH-07  top counter
 *   PH-08…PH-10  left wall counter
 *   PH-11…PH-14  bottom counter
 */
export const BLUEPRINT_VIEWBOX = '0 0 1600 1100'

export interface BlueprintStation {
  index: number
  id: string
  label: string
  zone: 'top-counter' | 'left-wall' | 'bottom-counter'
  zoneLabel: string
  /** Station mount point, in blueprint user units. */
  transform: { x: number; y: number; rot: number }
  /** Centre of the mannequin head, in blueprint user units. */
  head: { x: number; y: number }
}

export const BLUEPRINT_STATIONS: BlueprintStation[] = ${JSON.stringify(stations, null, 2)}

/**
 * The plan geometry as a reusable <g>.
 * Embed this inside any SVG that uses the ${'{'}0 0 1600 1100{'}'} viewBox so
 * interaction layers can be registered in the same coordinate space.
 */
export function BlueprintGeometry() {
  return (<g>${jsx.replace(/^[\s\S]*?>/, '').replace(/<\/svg>$/, '')}
    </g>
  )
}

/** Standalone rendering of the blueprint, without an interaction layer. */
export default function RoomBlueprintSvg(props: { className?: string }) {
  return (
    <svg
      id="blueprint-svg"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 1600 1100"
      preserveAspectRatio="xMidYMid meet"
      className={props.className}
      role="img"
      aria-label="Architectural plan of the dental dummy head laboratory with fourteen phantom head stations"
    >${jsx.replace(/^[\s\S]*?>/, '').replace(/<\/svg>$/, '')}
    </svg>
  )
}
`

const componentDir = path.join(root, 'src', 'components', 'room')
fs.mkdirSync(componentDir, { recursive: true })
fs.writeFileSync(path.join(componentDir, 'RoomBlueprintSvg.tsx'), component, 'utf8')

console.log(`Extracted ${stations.length} stations.`)
console.log(stations.map((s) => `${s.id} ${s.zone.padEnd(15)} head=(${s.head.x}, ${s.head.y})`).join('\n'))
