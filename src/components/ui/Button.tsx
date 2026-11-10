'use client'

import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tertiary-on-dark'
  | 'on-dark'
export type ButtonSize = 'md' | 'lg'

const BASE =
  'group inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-teal-700 text-white hover:-translate-y-px hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-900/20 active:translate-y-0 focus-visible:outline-teal-700',
  secondary:
    'border border-stone-300 bg-transparent text-graphite-900 hover:bg-sage-100 hover:border-stone-300 focus-visible:outline-teal-600',
  tertiary:
    'px-0 text-teal-700 hover:text-teal-600 hover:gap-2.5 focus-visible:outline-teal-600',
  'tertiary-on-dark':
    'px-0 text-porcelain-100/85 hover:text-porcelain-50 hover:gap-2.5 focus-visible:outline-porcelain-50',
  'on-dark':
    'bg-porcelain-50 text-graphite-900 hover:-translate-y-px hover:bg-white hover:shadow-lg hover:shadow-black/25 active:translate-y-0 focus-visible:outline-porcelain-50',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'h-12 px-5 text-[0.9375rem]',
  lg: 'h-[52px] px-6 text-[0.9375rem]',
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  withArrow?: boolean
}

function Arrow() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:translate-x-0.5"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  withArrow = false,
  onClick,
  ...rest
}: CommonProps & {
  href: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
} & Record<string, unknown>) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[BASE, VARIANTS[variant], SIZES[size], className].join(' ')}
      {...rest}
    >
      {children}
      {withArrow ? <Arrow /> : null}
    </Link>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  withArrow = false,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={[BASE, VARIANTS[variant], SIZES[size], className].join(' ')}
      {...rest}
    >
      {children}
      {withArrow ? <Arrow /> : null}
    </button>
  )
}
