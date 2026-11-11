'use client'

import Link from 'next/link'

const FOOTER_GROUPS = [
  {
    title: 'Rent',
    links: [
      { href: '/services/dental-chair', label: 'Dental chair · 150 EGP/hr' },
      { href: '/services/phantom-head', label: 'Phantom head · 100 EGP/hr' },
      { href: '/facilities', label: 'Find a facility' },
      { href: '/#how-it-works', label: 'How booking works' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/courses', label: 'Courses & practical training' },
      { href: '/services', label: 'All services' },
      { href: '/facilities', label: 'Facilities' },
      { href: '/about', label: 'About DentalWeb' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/account', label: 'My dashboard' },
      { href: '/account/bookings', label: 'My reservations' },
      { href: '/account/courses', label: 'My courses' },
      { href: '/auth/login', label: 'Sign in' },
      { href: '/auth/register', label: 'Create an account' },
      { href: '/manage', label: 'Facility dashboard' },
      { href: '/manage/courses', label: 'Manage courses' },
    ],
  },
]

export default function SiteFooter() {
  return (
    <footer
      data-section-theme="dark"
      className="relative overflow-hidden bg-graphite-900 text-porcelain-50"
    >
      {/* A single large architectural form that carries into the footer from
          the section above — the transition is a change of scale, not a cut. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-56 h-[38rem] w-[38rem] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #C8D9CF 0%, transparent 68%)' }}
      />

      <div className="page relative pt-20 pb-12 md:pt-28">
        {/* Lead statement */}
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-porcelain-50 text-graphite-900">
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
              <span className="font-display text-lg font-semibold tracking-[-0.02em]">
                DentalWeb
              </span>
            </Link>
            <p className="mt-6 max-w-sm font-display text-[1.375rem] font-medium leading-[1.28] tracking-[-0.02em] text-porcelain-50/90">
              A space to practice.
            </p>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-porcelain-100/55">
              Reserve dental training equipment by the hour from real facilities
              across Egypt — and find courses and supervised practical training
              offered by the same places. Transparent rates, a 50% deposit, and no
              phone calls.
            </p>
          </div>

          {/* Link groups — a measured grid, not a card wall */}
          <div className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {FOOTER_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-porcelain-100/40">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="group inline-flex min-h-11 items-center gap-1.5 py-1.5 text-[0.9375rem] text-porcelain-100/70 transition-colors duration-200 hover:text-porcelain-50"
                      >
                        <span className="h-px w-0 bg-teal-400 transition-all duration-200 group-hover:w-3" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {/* Baseline */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-7 text-[0.8125rem] text-porcelain-100/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DentalWeb. Dental training space rentals.</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <span className="px-2">Prices in EGP · 50% deposit</span>
            {[
              { href: '/about', label: 'Contact' },
              { href: '/about', label: 'Terms' },
              { href: '/about', label: 'Privacy' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-porcelain-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
