import Link from 'next/link'
import AdminLayout from '@/app/admin/layout'

export default function AdminDashboardPage() {
  // Demo stats
  const stats = [
    { label: "Today's bookings", value: '14', change: '+3 vs yesterday', icon: '📅', color: 'text-aqua' },
    { label: 'Deposits collected', value: '12,400 EGP', change: '+18% today', icon: '💰', color: 'text-green-600' },
    { label: 'Occupancy (chairs)', value: '72%', change: '3 of 4 chairs active', icon: '🪑', color: 'text-amber-600' },
    { label: 'Pending requests', value: '5', change: '2 tooth + 3 sterilization', icon: '📋', color: 'text-navy' },
  ]

  const upcomingBookings = [
    { ref: 'BK-260902-A7X9K2', patient: 'User Demo', service: 'Chair Rental', start: 'Today, 10:00', duration: '2 hrs', status: 'confirmed', deposit: 'Paid' },
    { ref: 'BK-260902-B3T8M1', patient: 'User Demo', service: 'Dummy Head Practice', start: 'Today, 11:30', duration: '1 hr', status: 'confirmed', deposit: 'Paid' },
    { ref: 'BK-260902-C5K2P9', patient: 'User Demo', service: 'General Dentistry', start: 'Today, 14:00', duration: '45 min', status: 'confirmed', deposit: 'Paid' },
    { ref: 'BK-260902-D8L4Q3', patient: 'User Demo', service: 'X-Ray', start: 'Today, 15:30', duration: '30 min', status: 'held', deposit: 'Pending' },
    { ref: 'BK-260902-E1N7R6', patient: 'User Demo', service: 'Sterilization', start: 'Today, 16:00', duration: '1 hr', status: 'scheduled', deposit: 'Paid' },
  ]

  const recentActivity = [
    { action: 'Booking confirmed', detail: 'BK-260902-A7X9K2 — Chair Rental, 10:00', time: '2 min ago', by: 'System (Paymob callback)' },
    { action: 'Deposit received', detail: '1250 EGP for Course: Radiography Intro', time: '15 min ago', by: 'Paymob' },
    { action: 'Phone booking created', detail: 'BK-260901-F2H9T4 — Walk-in cleaning, 17:00', time: '1 hour ago', by: 'Dr. Sarah (staff)' },
    { action: 'Block added', detail: 'Maintenance block: Chair 2, 12:00–13:00', time: '2 hours ago', by: 'Eng. Youssef' },
    { action: 'Tooth request received', detail: 'New request: Upper arch, teeth 16, 17, 26', time: '3 hours ago', by: 'New user' },
  ]

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    held: 'bg-amber-100 text-amber-700',
    pending: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-gray-100 text-gray-600',
    completed: 'bg-navy/10 text-navy',
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of today&apos;s activity across your clinic.</p>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs font-semibold ${stat.color}`}>{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Today&apos;s bookings
              </h2>
              <Link href="/admin/bookings" className="text-xs text-aqua hover:text-aqua-dark font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {upcomingBookings.map(booking => (
                <div key={booking.ref} className="flex items-center justify-between px-5 py-3 hover:bg-cream/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'held' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{booking.patient}</p>
                      <p className="text-xs text-muted truncate">{booking.service} · {booking.start} · {booking.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                    <span className="text-[10px] text-muted">{booking.deposit}</span>
                    <span className="text-xs font-mono text-muted hidden sm:inline">{booking.ref}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-navy flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Recent activity
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map(item => (
                <div key={item.action} className="px-5 py-3 hover:bg-cream/50 transition-colors">
                  <p className="text-xs font-medium text-navy">{item.action}</p>
                  <p className="text-[11px] text-muted mt-0.5 truncate">{item.detail}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-muted">{item.time}</span>
                    <span className="text-[10px] text-muted">{item.by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-navy mb-4">Quick actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/admin/bookings?new=true', label: 'New booking', icon: '➕', color: 'bg-aqua-light text-aqua' },
              { href: '/admin/calendar', label: 'Open calendar', icon: '🗓️', color: 'bg-green-100 text-green-700' },
              { href: '/admin/availability', label: 'Block hours', icon: '🚫', color: 'bg-amber-100 text-amber-700' },
              { href: '/admin/services', label: 'Manage services', icon: '🦷', color: 'bg-purple-100 text-purple-700' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-aqua/30 hover:shadow-sm transition-all ${action.color.split(' ')[0]}`}
              >
                <span className="text-sm">{action.icon}</span>
                <span className="text-sm font-medium text-navy">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Installation info */}
        <div className="bg-navy text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <h2 className="text-sm font-semibold">Staff Operations PWA</h2>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-2xl">
            This admin panel is an installable Progressive Web App. You can add it to your desktop, launch it
            from an application icon, and work in a focused operations interface. Booking writes and payment
            operations require a live connection and will never be shown as completed offline.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded">Installable</span>
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded">Offline shell</span>
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded">Role-based access</span>
            <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded">Connection state UI</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
