// Admin PWA Layout — installable staff operations shell
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// Demo admin sidebar nav
const adminNav = [
  {
    section: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: '📊' },
      { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
      { href: '/admin/calendar', label: 'Calendar', icon: '🗓️' },
      { href: '/admin/availability', label: 'Availability', icon: '⚙️' },
    ],
  },
  {
    section: 'Services',
    items: [
      { href: '/admin/services', label: 'Services & Prices', icon: '🦷' },
      { href: '/admin/resources', label: 'Resources', icon: '🪑' },
      { href: '/admin/courses', label: 'Courses', icon: '📚' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/admin/sterilization', label: 'Sterilization', icon: '🧪' },
      { href: '/admin/tooth-requests', label: 'Tooth Requests', icon: '🦷' },
      { href: '/admin/payments', label: 'Payments', icon: '💰' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
      { href: '/admin/reports', label: 'Reports', icon: '📈' },
      { href: '/admin/audit', label: 'Audit Log', icon: '📋' },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [online, setOnline] = useState(true)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    const check = async () => {
      if ('serviceWorker' in navigator && 'install' in window) {
        try {
          const deferred = window.matchMedia('(display-mode: standalone)')
          setInstalled(deferred.matches)
          deferred.addEventListener('change', e => setInstalled(e.matches))
        } catch {}
      }
    }
    check()
    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstalled(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy text-white px-4 py-2 flex items-center justify-between border-b border-navy/20">
        <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="text-sm font-semibold">Admin Panel</span>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={online ? 'text-green-400' : 'text-red-400'}>
            {online ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-full w-64 bg-navy text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-aqua flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M6 6h12M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold">Dental Admin</p>
            <p className="text-[10px] text-white/50">Staff Operations PWA</p>
          </div>
        </div>

        {/* Install prompt */}
        <div className="px-4 py-2 mx-2 mb-2 bg-white/5 rounded-lg text-[10px] text-white/60 flex items-center gap-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
          {installed ? 'Installed' : 'Installable PWA'}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {adminNav.map(group => (
            <div key={group.section}>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest px-2 mb-1.5">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                        {item.href === '/admin' && (
                          <span className="ml-auto text-[10px] bg-aqua/20 text-aqua px-1.5 py-0.5 rounded-full"> LIVE</span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Connection status footer */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{online ? 'Connected' : 'Offline — booking writes require connection'}</span>
          </div>
          <div className="mt-1.5 text-[10px] text-white/30">
            Install from browser for desktop launch.
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0 overflow-hidden">
        {/* Top bar (desktop) */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-border">
          <div>
            <h1 className="text-sm font-semibold text-navy">
              {adminNav
                .flatMap(g => g.items)
                .find(i => pathname.startsWith(i.href))?.label || 'Admin'}
            </h1>
            <p className="text-[10px] text-muted mt-0.5">{today} · Africa/Cairo</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={online ? 'text-green-600' : 'text-red-500'}>
                {online ? '●' : '○'} {online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-aqua text-white flex items-center justify-center text-[10px] font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-cream p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
