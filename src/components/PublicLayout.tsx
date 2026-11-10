'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'

const NAV_LINKS = [
  { href: '/clinics', label: 'Explore Clinics' },
  { href: '/services', label: 'Services' },
  { href: '/chair-rental', label: 'Chair Rental' },
  { href: '/courses', label: 'Courses' },
  { href: '/tooth-assistance', label: 'Tooth Assistance' },
  { href: '/about', label: 'About' },
]

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center group-hover:bg-charcoal transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6l1 1a1 1 0 0 0 1.4 0l1-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
                  <circle cx="12" cy="11" r="2" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-navy tracking-tight">Dental</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-charcoal hover:text-aqua transition-colors rounded-lg hover:bg-aqua-light/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA + Auth */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/chair-rental"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-charcoal transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                Book Now
              </Link>
              <Link href="/auth/login" className="px-3 py-2 text-sm font-medium text-charcoal hover:text-aqua transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="px-4 py-2 bg-aqua text-white text-sm font-medium rounded-lg hover:bg-aqua-dark transition-colors">
                Get Started
              </Link>
            </div>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-cream transition-colors"
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-ivory animate-scale-in">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-charcoal hover:text-aqua hover:bg-aqua-light/50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2 flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2 text-sm font-medium text-center text-charcoal border border-border rounded-lg hover:bg-cream transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2 bg-aqua text-white text-sm font-medium rounded-lg text-center hover:bg-aqua-dark transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-cream mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6l1 1a1 1 0 0 0 1.4 0l1-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-navy">Dental</span>
              </Link>
              <p className="text-xs text-muted leading-relaxed">
                A multi-clinic platform for booking, education, and dental training resources across Egypt.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2">
                {[
                  { href: '/clinics', label: 'Explore Clinics' },
                  { href: '/services', label: 'Services' },
                  { href: '/chair-rental', label: 'Chair Rental' },
                  { href: '/courses', label: 'Courses' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-aqua transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Resources</h4>
              <ul className="space-y-2">
                {[
                  { href: '/tooth-assistance', label: 'Tooth Assistance' },
                  { href: '/about', label: 'About Us' },
                  { href: '/auth/login', label: 'Sign In' },
                  { href: '/auth/register', label: 'Create Account' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-aqua transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                ].map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-aqua transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted">
            <p>© {new Date().getFullYear()} Dental Platform. Multi-tenant clinic booking &amp; education.</p>
            <p>Powered by Next.js + Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
