'use client'

import Link from 'next/link'

/**
 * Breadcrumb trail.
 *
 * The links are real navigation, so they carry a comfortable touch target
 * even though the trail itself is visually small.
 */
export default function Breadcrumb({
  items,
  tone = 'light',
  className = '',
}: {
  items: { href: string; label: string }[]
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={[
        'flex flex-wrap items-center gap-x-1 gap-y-1 text-[0.8125rem]',
        tone === 'dark' ? 'text-porcelain-100/50' : 'text-slate-600',
        className,
      ].join(' ')}
    >
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <span key={item.href + item.label} className="flex items-center gap-1">
            {last ? (
              <span
                aria-current="page"
                className={[
                  'inline-flex min-h-11 items-center',
                  tone === 'dark' ? 'text-porcelain-100/85' : 'text-graphite-900',
                ].join(' ')}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center transition-colors hover:text-graphite-900"
              >
                {item.label}
              </Link>
            )}
            {last ? null : (
              <span aria-hidden="true" className="opacity-40">
                /
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
