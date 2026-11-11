'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getSession, signOut, type SessionUser } from '@/lib/platform-api'

/**
 * The services menu.
 *
 * A hover-and-focus panel rather than a generic dropdown, so the three
 * offerings are discoverable without hiding them behind a hover-only control.
 */
const SERVICES = [
  {
    href: '/services/dental-chair',
    name: 'Dental chair rental',
    price: '150 EGP / hour',
    detail: 'A full clinical setup — chair, delivery unit and operating light.',
  },
  {
    href: '/services/phantom-head',
    name: 'Phantom-head training',
    price: '100 EGP / hour',
    detail: 'A manned station you can book, with a room plan you can pick from.',
  },
  {
    href: '/courses',
    name: 'Courses and practical training',
    price: 'Per course',
    detail: 'Programmes and supervised sessions taught by dental facilities.',
  },
]

export function ServicesMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const active = SERVICES.some((service) => pathname.startsWith(service.href))

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className={[
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-200',
          dark
            ? 'text-porcelain-100/80 hover:text-porcelain-50'
            : 'text-graphite-700 hover:text-graphite-900',
        ].join(' ')}
      >
        Services
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-1/2 top-full z-50 w-[26rem] -translate-x-1/2 pt-3"
          role="menu"
          aria-label="Services"
        >
          <div className="overflow-hidden rounded-[16px] border border-stone-300 bg-chalk shadow-xl shadow-graphite-900/10">
            {SERVICES.map((service, index) => (
              <Link
                key={service.href}
                href={service.href}
                role="menuitem"
                className={[
                  'block px-5 py-4 transition-colors duration-200 hover:bg-sage-100',
                  index > 0 ? 'border-t border-stone-200' : '',
                ].join(' ')}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9375rem] font-semibold text-graphite-900">
                    {service.name}
                  </span>
                  <span className="tnum shrink-0 text-[0.75rem] font-medium text-teal-700">
                    {service.price}
                  </span>
                </span>
                <span className="mt-1 block text-[0.8125rem] leading-relaxed text-slate-600">
                  {service.detail}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {active && !open ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-px bg-teal-600"
        />
      ) : null}
    </div>
  )
}

/**
 * The account menu.
 *
 * Shows the signed-in identity and the account pages, or the sign-in and
 * register links when nobody is signed in.
 */
export function AccountMenu({ dark }: { dark: boolean }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const session = await getSession()
        if (!cancelled) setUser(session.user)
      } catch {
        /* signed out or unavailable — the links are shown instead */
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      window.location.href = '/'
    } catch {
      setOpen(false)
    }
  }

  if (!loaded) {
    // A neutral placeholder keeps the header from reflowing when the
    // session resolves.
    return <span aria-hidden="true" className="block h-11 w-24" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className={[
            'rounded-lg px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-200',
            dark
              ? 'text-porcelain-100/85 hover:text-porcelain-50'
              : 'text-graphite-700 hover:text-graphite-900',
          ].join(' ')}
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex h-11 items-center rounded-[12px] bg-teal-700 px-4 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
        >
          Join
        </Link>
      </div>
    )
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const ACCOUNT_LINKS = [
    { href: '/account', label: 'My dashboard' },
    { href: '/account/profile', label: 'My profile' },
    { href: '/account/bookings', label: 'My reservations' },
    { href: '/account/courses', label: 'My courses' },
    { href: '/account/settings', label: 'Account settings' },
  ]

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className={[
          'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200',
          dark ? 'hover:bg-white/10' : 'hover:bg-sage-100',
        ].join(' ')}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={[
              'grid h-8 w-8 place-items-center rounded-full text-[0.75rem] font-semibold',
              dark
                ? 'bg-porcelain-50 text-graphite-900'
                : 'bg-graphite-900 text-porcelain-50',
            ].join(' ')}
          >
            {initials || 'DW'}
          </span>
        )}
        <span className="sr-only">Account menu</span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 w-60 pt-3"
          role="menu"
          aria-label="Account"
        >
          <div className="overflow-hidden rounded-[16px] border border-stone-300 bg-chalk shadow-xl shadow-graphite-900/10">
            <div className="border-b border-stone-200 px-4 py-3">
              <p className="truncate text-[0.875rem] font-semibold text-graphite-900">
                {user.name}
              </p>
              <p className="truncate text-[0.75rem] text-slate-600">{user.email}</p>
            </div>
            <div className="py-1">
              {ACCOUNT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className="block px-4 py-2.5 text-[0.875rem] text-graphite-700 transition-colors duration-200 hover:bg-sage-100 hover:text-graphite-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              role="menuitem"
              className="block w-full border-t border-stone-200 px-4 py-2.5 text-left text-[0.875rem] text-danger transition-colors duration-200 hover:bg-danger/10"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
