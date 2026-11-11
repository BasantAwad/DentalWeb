'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSectionTheme } from './ThemeProvider'
import { AccountMenu, ServicesMenu } from './AccountMenu'

const NAV_LINKS = [
  { href: '/facilities', label: 'Facilities' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/manage', label: 'For facilities' },
]

/** The three core services, repeated in the mobile menu. */
const MOBILE_SERVICES = [
  { href: '/services/dental-chair', name: 'Dental chair rental', price: '150 EGP/hr' },
  { href: '/services/phantom-head', name: 'Phantom-head training', price: '100 EGP/hr' },
  { href: '/courses', name: 'Courses and practical training', price: 'Per course' },
]

const ACCOUNT_LINKS = [
  { href: '/account', label: 'Dashboard' },
  { href: '/account/bookings', label: 'Reservations' },
  { href: '/account/courses', label: 'My courses' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/settings', label: 'Settings' },
]

/**
 * Public navigation.
 *
 * The nav adapts to the theme of the section currently in view so it stays
 * legible across the light/dark narrative without flashing.
 */
export default function SiteHeader() {
  const { activeTheme, scrolled } = useSectionTheme()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const dark = activeTheme === 'dark'

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? dark
            ? 'border-b border-white/10 bg-graphite-900/80 backdrop-blur-xl'
            : 'border-b border-stone-300/70 bg-porcelain-100/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div className="page">
        <div className="flex h-16 items-center justify-between gap-6 md:h-20">
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="DentalWeb — home"
          >
            <span
              className={[
                'grid h-9 w-9 place-items-center rounded-[10px] transition-colors duration-300',
                dark ? 'bg-porcelain-50 text-graphite-900' : 'bg-graphite-900 text-porcelain-50',
              ].join(' ')}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 20V9.5a8 8 0 0 1 16 0V20" />
                <path d="M8.5 20v-6.5a3.5 3.5 0 0 1 7 0V20" />
              </svg>
            </span>
            <span
              className={[
                'font-display text-[1.0625rem] font-semibold tracking-[-0.02em] transition-colors duration-300 md:text-lg',
                dark ? 'text-porcelain-50' : 'text-graphite-900',
              ].join(' ')}
            >
              DentalWeb
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'relative rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-200',
                    dark
                      ? 'text-porcelain-100/80 hover:text-porcelain-50'
                      : 'text-graphite-700 hover:text-graphite-900',
                  ].join(' ')}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-teal-600" />
                  ) : null}
                </Link>
              )
            })}
            <ServicesMenu dark={dark} />
          </nav>

          {/* Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/facilities"
              className={[
                'group inline-flex h-11 items-center gap-2 rounded-[12px] bg-teal-700 px-5 text-[0.9375rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-900/20',
              ].join(' ')}
            >
              Explore spaces
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
            </Link>
            <AccountMenu dark={dark} />
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={[
              'grid h-11 w-11 place-items-center rounded-[10px] border transition-colors duration-200 lg:hidden',
              dark
                ? 'border-white/20 text-porcelain-50'
                : 'border-stone-300 text-graphite-900',
            ].join(' ')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={[
          'fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto px-5 pb-8 pt-24 lg:hidden',
          dark ? 'bg-graphite-900' : 'bg-porcelain-100',
        ].join(' ')}
      >
        <nav className="flex flex-col" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={[
                'border-b py-4 font-display text-2xl font-medium transition-colors',
                dark
                  ? 'border-white/10 text-porcelain-50'
                  : 'border-stone-300 text-graphite-900',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* The three services, grouped so none of them is hidden */}
        <nav className="mt-8" aria-label="Services">
          <p
            className={[
              'text-[0.6875rem] font-semibold uppercase tracking-[0.16em]',
              dark ? 'text-porcelain-100/40' : 'text-slate-500',
            ].join(' ')}
          >
            Services
          </p>
          <ul className="mt-3">
            {MOBILE_SERVICES.map((service) => (
              <li key={service.href}>
                <Link
                  href={service.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    'flex items-baseline justify-between gap-4 border-b py-3 transition-colors',
                    dark
                      ? 'border-white/10 text-porcelain-50/85'
                      : 'border-stone-300 text-graphite-900',
                  ].join(' ')}
                >
                  <span className="text-[0.9375rem] font-medium">{service.name}</span>
                  <span
                    className={[
                      'tnum shrink-0 text-[0.75rem]',
                      dark ? 'text-sage-200' : 'text-teal-700',
                    ].join(' ')}
                  >
                    {service.price}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* The account area */}
        <nav className="mt-8" aria-label="Account">
          <p
            className={[
              'text-[0.6875rem] font-semibold uppercase tracking-[0.16em]',
              dark ? 'text-porcelain-100/40' : 'text-slate-500',
            ].join(' ')}
          >
            Your account
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    'inline-flex min-h-11 items-center text-[0.9375rem] font-medium transition-colors',
                    dark
                      ? 'text-porcelain-100/75 hover:text-porcelain-50'
                      : 'text-graphite-700 hover:text-graphite-900',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 pt-8">
          <Link
            href="/facilities"
            onClick={() => setMenuOpen(false)}
            className="inline-flex h-12 items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white"
          >
            Explore spaces
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setMenuOpen(false)}
            className={[
              'inline-flex h-12 items-center justify-center rounded-[12px] border text-[0.9375rem] font-medium',
              dark
                ? 'border-white/25 text-porcelain-50'
                : 'border-stone-300 text-graphite-900',
            ].join(' ')}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
