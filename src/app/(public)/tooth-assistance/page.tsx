'use client'

import { useState } from 'react'

// FDI tooth notation — upper and lower arches
const UPPER_TEETH = [
  { id: '18', label: '18', name: 'Upper Right Third Molar',    type: 'molar' },
  { id: '17', label: '17', name: 'Upper Right Second Molar',   type: 'molar' },
  { id: '16', label: '16', name: 'Upper Right First Molar',    type: 'molar' },
  { id: '15', label: '15', name: 'Upper Right Second Premolar',type: 'premolar' },
  { id: '14', label: '14', name: 'Upper Right First Premolar', type: 'premolar' },
  { id: '13', label: '13', name: 'Upper Right Canine',         type: 'canine' },
  { id: '12', label: '12', name: 'Upper Right Lateral Incisor',type: 'incisor' },
  { id: '11', label: '11', name: 'Upper Right Central Incisor',type: 'incisor' },
  { id: '21', label: '21', name: 'Upper Left Central Incisor', type: 'incisor' },
  { id: '22', label: '22', name: 'Upper Left Lateral Incisor', type: 'incisor' },
  { id: '23', label: '23', name: 'Upper Left Canine',          type: 'canine' },
  { id: '24', label: '24', name: 'Upper Left First Premolar',  type: 'premolar' },
  { id: '25', label: '25', name: 'Upper Left Second Premolar', type: 'premolar' },
  { id: '26', label: '26', name: 'Upper Left First Molar',     type: 'molar' },
  { id: '27', label: '27', name: 'Upper Left Second Molar',    type: 'molar' },
  { id: '28', label: '28', name: 'Upper Left Third Molar',     type: 'molar' },
]

const LOWER_TEETH = [
  { id: '48', label: '48', name: 'Lower Right Third Molar',    type: 'molar' },
  { id: '47', label: '47', name: 'Lower Right Second Molar',   type: 'molar' },
  { id: '46', label: '46', name: 'Lower Right First Molar',    type: 'molar' },
  { id: '45', label: '45', name: 'Lower Right Second Premolar',type: 'premolar' },
  { id: '44', label: '44', name: 'Lower Right First Premolar', type: 'premolar' },
  { id: '43', label: '43', name: 'Lower Right Canine',         type: 'canine' },
  { id: '42', label: '42', name: 'Lower Right Lateral Incisor',type: 'incisor' },
  { id: '41', label: '41', name: 'Lower Right Central Incisor',type: 'incisor' },
  { id: '31', label: '31', name: 'Lower Left Central Incisor', type: 'incisor' },
  { id: '32', label: '32', name: 'Lower Left Lateral Incisor', type: 'incisor' },
  { id: '33', label: '33', name: 'Lower Left Canine',          type: 'canine' },
  { id: '34', label: '34', name: 'Lower Left First Premolar',  type: 'premolar' },
  { id: '35', label: '35', name: 'Lower Left Second Premolar', type: 'premolar' },
  { id: '36', label: '36', name: 'Lower Left First Molar',     type: 'molar' },
  { id: '37', label: '37', name: 'Lower Left Second Molar',    type: 'molar' },
  { id: '38', label: '38', name: 'Lower Left Third Molar',     type: 'molar' },
]

// Tooth shape SVG heights by type (for arch curve illusion)
const TOOTH_HEIGHT: Record<string, number> = {
  molar: 36,
  premolar: 30,
  canine: 34,
  incisor: 28,
}

// Tooth widths
const TOOTH_WIDTH: Record<string, number> = {
  molar: 28,
  premolar: 22,
  canine: 20,
  incisor: 18,
}

function ToothSVG({ type, selected, hovered }: { type: string; selected: boolean; hovered: boolean }) {
  const fill = selected ? '#0ea5a0' : hovered ? '#38d9c9' : '#f5f0e8'
  const stroke = selected ? '#0c8a85' : hovered ? '#0ea5a0' : '#d8cfc4'
  const rootFill = selected ? '#0c8a85' : hovered ? '#0ea5a0' : '#e8e0d4'

  if (type === 'molar') {
    return (
      <svg viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Crown */}
        <path d="M4 18 Q4 6 14 6 Q24 6 24 18 L22 28 Q21 32 14 32 Q7 32 6 28 Z"
          fill={fill} stroke={stroke} strokeWidth="1.2" />
        {/* Cusps */}
        <path d="M8 10 Q11 6 14 6" stroke={stroke} strokeWidth="0.8" fill="none" />
        <path d="M20 10 Q17 6 14 6" stroke={stroke} strokeWidth="0.8" fill="none" />
        <path d="M6 20 Q8 16 12 17" stroke={stroke} strokeWidth="0.6" fill="none" />
        <path d="M22 20 Q20 16 16 17" stroke={stroke} strokeWidth="0.6" fill="none" />
        {/* Root 1 */}
        <path d="M8 30 Q7 38 9 42" stroke={rootFill} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Root 2 */}
        <path d="M20 30 Q21 38 19 42" stroke={rootFill} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Highlight */}
        {(selected || hovered) && (
          <ellipse cx="14" cy="14" rx="4" ry="3" fill="white" opacity="0.25" />
        )}
      </svg>
    )
  }

  if (type === 'premolar') {
    return (
      <svg viewBox="0 0 22 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M3 16 Q3 6 11 6 Q19 6 19 16 L18 26 Q17 30 11 30 Q5 30 4 26 Z"
          fill={fill} stroke={stroke} strokeWidth="1.2" />
        <path d="M7 9 Q11 6 15 9" stroke={stroke} strokeWidth="0.7" fill="none" />
        <path d="M4 20 Q8 16 11 18" stroke={stroke} strokeWidth="0.6" fill="none" />
        <path d="M8 28 Q8 36 10 40" stroke={rootFill} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M14 28 Q14 36 12 40" stroke={rootFill} strokeWidth="4" strokeLinecap="round" fill="none" />
        {(selected || hovered) && (
          <ellipse cx="11" cy="13" rx="3" ry="2.5" fill="white" opacity="0.25" />
        )}
      </svg>
    )
  }

  if (type === 'canine') {
    return (
      <svg viewBox="0 0 20 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M3 16 Q3 5 10 5 Q17 5 17 16 L15 26 Q13 31 10 31 Q7 31 5 26 Z"
          fill={fill} stroke={stroke} strokeWidth="1.2" />
        {/* Cusp tip */}
        <path d="M7 8 Q10 4 13 8" stroke={stroke} strokeWidth="0.8" fill="none" />
        <path d="M10 30 Q10 39 10 44" stroke={rootFill} strokeWidth="5" strokeLinecap="round" fill="none" />
        {(selected || hovered) && (
          <ellipse cx="10" cy="13" rx="3" ry="2.5" fill="white" opacity="0.25" />
        )}
      </svg>
    )
  }

  // incisor
  return (
    <svg viewBox="0 0 18 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M2 16 Q2 6 9 6 Q16 6 16 16 L15 25 Q14 29 9 29 Q4 29 3 25 Z"
        fill={fill} stroke={stroke} strokeWidth="1.2" />
      {/* Mamelons hint */}
      <path d="M4 9 Q6 6 9 6 Q12 6 14 9" stroke={stroke} strokeWidth="0.7" fill="none" />
      <path d="M9 28 Q9 37 9 41" stroke={rootFill} strokeWidth="4" strokeLinecap="round" fill="none" />
      {(selected || hovered) && (
        <ellipse cx="9" cy="13" rx="2.5" ry="2" fill="white" opacity="0.25" />
      )}
    </svg>
  )
}

function ArchRow({
  teeth,
  arch,
  selected,
  onToggle,
  visible,
}: {
  teeth: typeof UPPER_TEETH
  arch: 'upper' | 'lower'
  selected: string[]
  onToggle: (id: string) => void
  visible: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (!visible) return null

  // For upper arch: roots point UP (crown at bottom), for lower: roots point DOWN
  // We flip the SVG for upper arch
  const isUpper = arch === 'upper'

  return (
    <div className={`flex items-${isUpper ? 'end' : 'start'} justify-center gap-px`}
      style={{ minHeight: 80 }}>
      {teeth.map((tooth) => {
        const isSelected = selected.includes(tooth.id)
        const isHovered = hovered === tooth.id
        const h = TOOTH_HEIGHT[tooth.type]
        const w = TOOTH_WIDTH[tooth.type]

        return (
          <button
            key={tooth.id}
            onClick={() => onToggle(tooth.id)}
            onMouseEnter={() => setHovered(tooth.id)}
            onMouseLeave={() => setHovered(null)}
            title={`${tooth.label} — ${tooth.name}`}
            aria-label={tooth.name}
            className="relative flex flex-col items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-1 rounded"
            style={{ width: w, flexShrink: 0 }}
          >
            {/* FDI number — top for lower, bottom for upper */}
            {!isUpper && (
              <span className={`text-[9px] font-bold mb-0.5 transition-colors ${isSelected ? 'text-aqua' : 'text-muted/60'}`}>
                {tooth.label}
              </span>
            )}

            <div
              style={{
                height: h,
                width: w,
                transform: isUpper ? 'scaleY(-1)' : undefined,
              }}
              className="transition-transform duration-150 group-hover:scale-105"
            >
              <ToothSVG type={tooth.type} selected={isSelected} hovered={isHovered} />
            </div>

            {isUpper && (
              <span className={`text-[9px] font-bold mt-0.5 transition-colors ${isSelected ? 'text-aqua' : 'text-muted/60'}`}>
                {tooth.label}
              </span>
            )}

            {/* Selected pulse ring */}
            {isSelected && (
              <span className="absolute inset-0 rounded border-2 border-aqua/50 animate-pulse pointer-events-none" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// Sketchfab embed for reference view
function SketchfabEmbed({ arch }: { arch: 'upper' | 'lower' }) {
  const modelId = arch === 'upper'
    ? '9ce1e3bacd9e467fa3c77a952211b455'
    : '8b33f2d6d44647af9d915e81278a3969'
  const title = arch === 'upper'
    ? 'Anatomical Upper Teeth Dental Model - 3D Sculpt'
    : 'Anatomical Lower Teeth Dental Model - 3D Sculpt'

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border shadow-sm bg-[#1a1a2e]"
      style={{ aspectRatio: '16/9' }}>
      <iframe
        title={title}
        frameBorder={0}
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${modelId}/embed?autostart=1&preload=1&transparent=1&ui_theme=dark&camera=0&ui_infos=0&ui_controls=1&ui_watermark_link=0`}
        className="w-full h-full"
        style={{ minHeight: 300 }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent px-3 py-2 pointer-events-none">
        <p className="text-[10px] text-white/60">
          {title} — drag to rotate, scroll to zoom
        </p>
      </div>
    </div>
  )
}

export default function ToothAssistancePage() {
  const [archChoice, setArchChoice] = useState<'upper' | 'lower' | 'both'>('both')
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [apptType, setApptType] = useState('In-person consultation')
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [viewTab, setViewTab] = useState<'selector' | 'upper3d' | 'lower3d'>('selector')

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const clearAll = () => setSelected([])

  const visibleTeeth =
    archChoice === 'upper' ? UPPER_TEETH.map(t => t.id) :
    archChoice === 'lower' ? LOWER_TEETH.map(t => t.id) :
    [...UPPER_TEETH.map(t => t.id), ...LOWER_TEETH.map(t => t.id)]

  const filteredSelected = selected.filter(id => visibleTeeth.includes(id))

  const confirmSubmit = () => { setSubmitted(true); setShowConfirm(false) }

  const ARCH_VIEWS = [
    { id: 'selector', label: 'Interactive Selector', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )},
    { id: 'upper3d', label: 'Upper Arch 3D', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6l1 1a1 1 0 0 0 1.4 0l1-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
      </svg>
    )},
    { id: 'lower3d', label: 'Lower Arch 3D', icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3-6l-1-1a1 1 0 0 0-1.4 0l-1 1c-1.5 1.5-3 3.5-3 6a7 7 0 0 0 7 7z"/>
      </svg>
    )},
  ] as const

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-ivory to-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-aqua-light text-aqua-dark text-xs font-semibold rounded-full mb-3">
              Tooth Selection Assistance
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">
              Choose the teeth you need help with
            </h1>
            <p className="text-charcoal/70 mt-3 text-base leading-relaxed">
              Select an arch, then click on teeth in the interactive selector below.
              Switch to the 3D reference view to see anatomically accurate models.
              Add notes and submit your request for a dentist consultation.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href="https://en.wikipedia.org/wiki/FDI_world_dental_numbering_system"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-aqua transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                FDI tooth notation guide
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left panel ── */}
          <div className="lg:col-span-3 space-y-4 animate-fade-in">
            {/* Arch selector + view tabs */}
            <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-3 items-center">
              <div className="flex gap-1">
                {(['upper', 'lower', 'both'] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => setArchChoice(a)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      archChoice === a
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white text-charcoal border-border hover:border-aqua/30'
                    }`}
                  >
                    {a === 'upper' ? 'Upper' : a === 'lower' ? 'Lower' : 'Both'}
                  </button>
                ))}
              </div>

              <div className="h-5 w-px bg-border hidden sm:block" />

              {/* View tabs */}
              <div className="flex gap-1 flex-wrap">
                {ARCH_VIEWS.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setViewTab(v.id as typeof viewTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      viewTab === v.id
                        ? 'bg-aqua text-white border-aqua shadow-sm'
                        : 'bg-white text-charcoal border-border hover:border-aqua/30'
                    }`}
                  >
                    {v.icon}
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="flex-1" />
              <button
                onClick={clearAll}
                disabled={selected.length === 0}
                className="px-3 py-1.5 text-xs font-medium text-muted border border-border rounded-lg hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* ── Interactive dental selector ── */}
            {viewTab === 'selector' && (
              <div className="bg-gradient-to-b from-[#f8f6f2] to-cream rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-white/60">
                  <span className="text-xs font-medium text-muted flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Click teeth to select · hover for name
                  </span>
                  {filteredSelected.length > 0 && (
                    <span className="text-xs font-semibold text-aqua bg-aqua-light px-2 py-0.5 rounded-full">
                      {filteredSelected.length} selected
                    </span>
                  )}
                </div>

                <div className="px-4 py-6 space-y-2">
                  {/* Quadrant labels */}
                  <div className="flex justify-between px-2 mb-1">
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Right</span>
                    <span className="text-[10px] text-muted font-medium uppercase tracking-wider">Left</span>
                  </div>

                  {/* Upper arch */}
                  {(archChoice === 'upper' || archChoice === 'both') && (
                    <div className="space-y-1">
                      <div className="text-center text-[10px] font-semibold text-aqua/70 uppercase tracking-widest">
                        — Upper Arch —
                      </div>
                      <ArchRow
                        teeth={UPPER_TEETH}
                        arch="upper"
                        selected={selected}
                        onToggle={toggle}
                        visible
                      />
                    </div>
                  )}

                  {/* Midline separator */}
                  {archChoice === 'both' && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[9px] font-semibold text-muted/50 uppercase tracking-widest">Midline</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* Lower arch */}
                  {(archChoice === 'lower' || archChoice === 'both') && (
                    <div className="space-y-1">
                      <ArchRow
                        teeth={LOWER_TEETH}
                        arch="lower"
                        selected={selected}
                        onToggle={toggle}
                        visible
                      />
                      <div className="text-center text-[10px] font-semibold text-navy/40 uppercase tracking-widest">
                        — Lower Arch —
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="px-4 pb-4 flex flex-wrap gap-4 text-xs text-muted border-t border-border pt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded border border-[#d8cfc4]" style={{ background: '#f5f0e8' }} />
                    Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#0ea5a0]" />
                    Selected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#38d9c9]" />
                    Hovered
                  </div>
                </div>
              </div>
            )}

            {/* ── Sketchfab 3D Reference Views ── */}
            {viewTab === 'upper3d' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6l1 1a1 1 0 0 0 1.4 0l1-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
                  </svg>
                  <span className="text-sm font-semibold text-navy">Upper Arch — Anatomical 3D Reference</span>
                </div>
                <SketchfabEmbed arch="upper" />
                <p className="text-[11px] text-muted px-1">
                  Model by{' '}
                  <a href="https://sketchfab.com/sanboku" target="_blank" rel="noopener noreferrer" className="text-aqua hover:underline">
                    Hayashiya Samboku
                  </a>{' '}
                  on Sketchfab. Use the Interactive Selector tab to choose teeth for your request.
                </p>
              </div>
            )}

            {viewTab === 'lower3d' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                    <path d="M12 22a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3-6l-1-1a1 1 0 0 0-1.4 0l-1 1c-1.5 1.5-3 3.5-3 6a7 7 0 0 0 7 7z"/>
                  </svg>
                  <span className="text-sm font-semibold text-navy">Lower Arch — Anatomical 3D Reference</span>
                </div>
                <SketchfabEmbed arch="lower" />
                <p className="text-[11px] text-muted px-1">
                  Model by{' '}
                  <a href="https://sketchfab.com/sanboku" target="_blank" rel="noopener noreferrer" className="text-aqua hover:underline">
                    Hayashiya Samboku
                  </a>{' '}
                  on Sketchfab. Use the Interactive Selector tab to choose teeth for your request.
                </p>
              </div>
            )}

            {/* Selection feedback bar */}
            {filteredSelected.length > 0 && (
              <div className="p-3 bg-aqua-light rounded-lg text-xs text-aqua-dark flex items-center justify-between border border-aqua/20">
                <span>
                  <strong>{filteredSelected.length}</strong> tooth{filteredSelected.length > 1 ? 's' : ''} selected
                  {archChoice !== 'both' ? ` in the ${archChoice} arch` : ''}
                </span>
                <button onClick={clearAll} className="text-aqua-dark/60 hover:text-aqua-dark underline">
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="lg:col-span-2 space-y-5 animate-slide-up stagger-2">
            {/* Selected teeth chip list */}
            {filteredSelected.length > 0 ? (
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  Selected teeth ({filteredSelected.length})
                </h2>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filteredSelected.map(id => {
                    const tooth = [...UPPER_TEETH, ...LOWER_TEETH].find(t => t.id === id)
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        title={`Remove ${tooth?.name}`}
                        className="group flex items-center gap-1 px-2 py-1 bg-navy text-white text-xs font-bold rounded-md hover:bg-danger transition-colors"
                      >
                        {id}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  Click a tooth chip to remove it. A dentist will review your selection and schedule a consultation.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted/40">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  No teeth selected yet
                </h2>
                <p className="text-xs text-muted mb-2">
                  Switch to the Interactive Selector tab and click teeth to begin.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted mt-3 p-2.5 bg-cream rounded-lg border border-border">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  FDI notation: 1X = upper right, 2X = upper left, 3X = lower left, 4X = lower right
                </div>
              </div>
            )}

            {/* Form / confirm / success */}
            {showConfirm ? (
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-navy mb-4">Confirm your request</h2>
                <div className="space-y-2 text-sm divide-y divide-border">
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Arch</span>
                    <span className="font-medium text-navy capitalize">{archChoice}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Teeth selected</span>
                    <span className="font-medium text-navy">{filteredSelected.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted">Appointment type</span>
                    <span className="font-medium text-navy">{apptType}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted">Notes</span>
                      <span className="font-medium text-navy text-right max-w-[180px] text-xs">{notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-cream transition-colors">
                    Edit
                  </button>
                  <button onClick={confirmSubmit} className="flex-1 px-3 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-charcoal transition-colors shadow-sm">
                    Submit Request
                  </button>
                </div>
              </div>
            ) : submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-green-800">Request submitted!</h2>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  A dentist will review your tooth selection and contact you to schedule a consultation.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setSelected([]); setNotes('') }}
                  className="mt-4 text-xs text-green-700 underline hover:text-green-900"
                >
                  Start a new request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-navy mb-4">Request details</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1.5">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. I'm experiencing sensitivity in these teeth, particularly when drinking cold liquids..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua resize-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted block mb-1.5">Preferred appointment type</label>
                    <select
                      value={apptType}
                      onChange={e => setApptType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
                    >
                      <option>In-person consultation</option>
                      <option>Video consultation</option>
                      <option>Phone consultation</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={filteredSelected.length === 0}
                  className="w-full mt-4 py-3 bg-aqua text-white text-sm font-semibold rounded-lg hover:bg-aqua-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-aqua/20 flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"/><path d="M22 2L15 22l-5-7-3 7-2-5"/>
                  </svg>
                  Submit Assistance Request
                  {filteredSelected.length > 0 && ` (${filteredSelected.length} teeth)`}
                </button>
                <p className="text-[10px] text-muted text-center mt-2">
                  This request does not collect identifiable patient clinical records. A dentist will follow up with you directly.
                </p>
              </div>
            )}

            {/* How it works */}
            <div className="text-xs text-muted bg-cream rounded-lg p-3.5 border border-border">
              <strong className="text-navy">How it works:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Select Upper, Lower, or Both arches</li>
                <li>Click teeth in the interactive selector to select/deselect</li>
                <li>View anatomical 3D models with the 3D tabs for reference</li>
                <li>Add notes and choose your appointment type</li>
                <li>Submit — a dentist reviews and contacts you</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
