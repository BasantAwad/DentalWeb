'use client'

import type { ReactNode } from 'react'

export type SectionTheme = 'light' | 'dark' | 'porcelain' | 'chalk' | 'graphite'

/**
 * Section shell.
 *
 * The homepage is composed from a small vocabulary of layouts rather than one
 * repeated template. This component owns the *environment* — the background,
 * the theme contract and the optional bleed that lets a section flow into the
 * next — while each section owns its own composition.
 */
export default function Section({
  theme = 'light',
  id,
  className = '',
  children,
  bleed = 'none',
  seam = 'none',
  ...rest
}: {
  theme?: SectionTheme
  id?: string
  className?: string
  children: ReactNode
  /**
   * 'none'  — a hard edge between sections
   * 'soft'  — the section fades into the next background
   * 'lift'  — the section overlaps the previous one with a soft shadow
   */
  bleed?: 'none' | 'soft' | 'lift'
  /**
   * An organic seam that softens the boundary with the section above.
   *
   * The value is the *previous* section's background colour: the seam paints a
   * curved tongue of that colour dipping into this section's top edge, so two
   * different backgrounds meet along a curve instead of a straight cut. The
   * page reads as one continuous surface rather than stacked rectangles.
   */
  seam?: 'none' | 'porcelain' | 'chalk' | 'graphite'
} & React.HTMLAttributes<HTMLElement>) {
  const tone = theme === 'dark' || theme === 'graphite' ? 'dark' : 'light'

  const seamColor =
    seam === 'porcelain'
      ? 'text-[#f2f0e9]'
      : seam === 'chalk'
        ? 'text-white'
        : seam === 'graphite'
          ? 'text-graphite-900'
          : ''

  return (
    <section
      id={id}
      data-theme={tone}
      data-section-theme={tone}
      data-bleed={bleed}
      className={[
        'relative isolate',
        theme === 'dark' || theme === 'graphite'
          ? 'bg-graphite-900 text-porcelain-50'
          : theme === 'chalk'
            ? 'bg-chalk text-graphite-900'
            : 'bg-porcelain-100 text-graphite-900',
        bleed === 'lift' ? 'z-10 shadow-[0_-40px_80px_-40px_rgba(32,37,34,0.25)]' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {seam !== 'none' ? (
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-x-0 top-0 block h-12 md:h-20',
            seamColor,
          ].join(' ')}
        >
          <svg
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
            className="block h-full w-full"
            fill="currentColor"
          >
            <path d="M0 0h1440v16c-270 46-530 50-800 28C420 26 180 22 0 46Z" />
          </svg>
        </span>
      ) : null}
      {children}
    </section>
  )
}

/** Small uppercase eyebrow used above section headings. */
export function Eyebrow({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <p
      className={[
        'flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em]',
        tone === 'dark' ? 'text-sage-200/85' : 'text-teal-700',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'block h-px w-8 shrink-0',
          tone === 'dark' ? 'bg-sage-200/50' : 'bg-teal-600/50',
        ].join(' ')}
      />
      {children}
    </p>
  )
}

/**
 * A hairline rule that carries the architectural grid.
 * `fade` variants dissolve at one end so the line reads as a measured
 * continuation rather than a border.
 */
export function Rule({
  tone = 'light',
  fade = 'right',
  className = '',
}: {
  tone?: 'light' | 'dark'
  fade?: 'right' | 'left' | 'both' | 'none'
  className?: string
}) {
  const gradient =
    fade === 'right'
      ? 'to-transparent'
      : fade === 'left'
        ? 'from-transparent'
        : fade === 'both'
          ? 'from-transparent via-transparent to-transparent'
          : ''

  return (
    <span
      aria-hidden="true"
      className={[
        'block h-px w-full bg-gradient-to-r',
        tone === 'dark'
          ? 'from-white/25 to-transparent'
          : 'from-stone-300 to-transparent',
        fade === 'left' ? 'bg-gradient-to-l' : '',
        fade === 'both' ? 'bg-transparent' : '',
        gradient,
        className,
      ].join(' ')}
    />
  )
}

/**
 * A large background word or numeral that bleeds behind the content.
 * Used to carry a section's idea visually without adding a box.
 */
export function BleedWord({
  children,
  tone = 'light',
  className = '',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'pointer-events-none absolute select-none font-display font-semibold leading-[0.75] tracking-[-0.06em]',
        tone === 'dark' ? 'text-white/[0.035]' : 'text-graphite-900/[0.035]',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
