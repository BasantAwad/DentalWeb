'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Dashboard', exact: true },
  { href: '/account/profile', label: 'My profile' },
  { href: '/account/bookings', label: 'My reservations' },
  { href: '/account/courses', label: 'My courses' },
  { href: '/account/settings', label: 'Settings' },
]

/**
 * The account shell.
 *
 * A quieter, more functional layout than the cinematic public pages: a
 * persistent sidebar on desktop, a scrollable tab strip on mobile.
 */
export default function AccountShell({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description?: string
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-[70svh] bg-porcelain-100">
      <div className="page py-28 md:py-32">
        <header className="max-w-2xl">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-teal-700">
            Your account
          </p>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-graphite-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-graphite-700">
              {description}
            </p>
          ) : null}
        </header>

        <div className="mt-12 grid-12 gap-y-10">
          {/* Navigation */}
          <nav aria-label="Account sections" className="col-span-12 lg:col-span-3">
            <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
              {ACCOUNT_LINKS.map((link) => {
                const active = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href)
                return (
                  <li key={link.href} className="shrink-0 lg:shrink">
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'inline-flex min-h-11 items-center whitespace-nowrap rounded-[10px] px-4 text-[0.9375rem] font-medium transition-colors duration-200 lg:block',
                        active
                          ? 'bg-graphite-900 text-porcelain-50'
                          : 'text-graphite-700 hover:bg-sage-100',
                      ].join(' ')}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
