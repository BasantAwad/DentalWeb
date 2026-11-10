'use client'

import AdminLayout from '@/app/admin/layout'
import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AdminBookingsPage() {
  const statuses = ['all', 'pending', 'held', 'confirmed', 'completed', 'cancelled', 'no_show']
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const demoBookings = [
    { ref: 'BK-260902-A7X9K2', patient: 'Eman Hassan', service: 'Chair Rental', start: 'Today, 10:00', end: '12:00', duration: '2 hrs', status: 'confirmed', deposit: 'Paid', resource: 'Chair 1', source: 'web' },
    { ref: 'BK-260902-B3T8M1', patient: 'Omar Farouk', service: 'Dummy Head Practice', start: 'Today, 11:30', end: '12:30', duration: '1 hr', status: 'confirmed', deposit: 'Paid', resource: 'Dummy Head Alpha', source: 'web' },
    { ref: 'BK-260902-C5K2P9', patient: 'Sara Mohamed', service: 'General Dentistry', start: 'Today, 14:00', end: '14:45', duration: '45 min', status: 'confirmed', deposit: 'Paid', resource: 'Chair 1', source: 'web' },
    { ref: 'BK-260902-D8L4Q3', patient: 'Ahmed Kamal', service: 'Dental Radiography', start: 'Today, 15:30', end: '16:00', duration: '30 min', status: 'held', deposit: 'Pending', resource: 'Digital X-Ray Room', source: 'web' },
    { ref: 'BK-260902-E1N7R6', patient: 'Nourhan Ali', service: 'Sterilization', start: 'Today, 16:00', end: '17:00', duration: '1 hr', status: 'scheduled', deposit: 'Paid', resource: 'Chair 2', source: 'web' },
    { ref: 'BK-260901-F2H9T4', patient: 'Walid Said', service: 'Instrument Reprocessing', start: 'Yesterday, 17:00', end: '18:00', duration: '1 hr', status: 'completed', deposit: 'Paid', resource: 'Chair 2', source: 'phone' },
    { ref: 'BK-260901-G4J2R8', patient: 'Lina Laila', service: 'Chair Rental', start: 'Yesterday, 14:00', end: '16:00', duration: '2 hrs', status: 'cancelled', deposit: 'Refunded', resource: 'Chair 1', source: 'web' },
    { ref: 'BK-260901-H6K3M2', patient: 'Tarek Ashraf', service: 'Dummy Head Practice', start: 'Yesterday, 10:00', end: '12:00', duration: '2 hrs', status: 'no_show', deposit: 'Retained', resource: 'Dummy Head Alpha', source: 'walk_in' },
    { ref: 'BK-260902-J8N5P1', patient: 'Youssef Tarek', service: 'Tooth Assistance', start: 'Today, 13:00', end: '13:30', duration: '30 min', status: 'pending', deposit: 'Pending', resource: '—', source: 'web' },
    { ref: 'BK-260902-K2L7Q4', patient: 'Mai Adel', service: 'General Dentistry', start: 'Today, 18:00', end: '18:45', duration: '45 min', status: 'pending', deposit: 'Pending', resource: 'Chair 2', source: 'admin' },
  ]

  const filtered = demoBookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (search && !b.ref.toLowerCase().includes(search.toLowerCase()) && !b.patient.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    held: 'bg-amber-100 text-amber-700 border-amber-200',
    pending: 'bg-blue-100 text-blue-700 border-blue-200',
    scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-navy/10 text-navy border-navy/20',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    no_show: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">Bookings</h1>
            <p className="text-sm text-muted mt-0.5">Manage appointments, deposits, and booking status.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm font-medium bg-white border border-border rounded-lg hover:bg-cream transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Filter
            </button>
            <button className="px-3 py-2 text-sm font-medium bg-navy text-white rounded-lg hover:bg-charcoal transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New booking
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference or patient..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
            />
          </div>
          <div className="flex gap-1">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-charcoal border-border hover:border-aqua/30'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Reference</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Resource</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Deposit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Source</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(b => (
                  <tr key={b.ref} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-aqua font-medium">{b.ref}</td>
                    <td className="px-4 py-3 text-navy font-medium">{b.patient}</td>
                    <td className="px-4 py-3 text-charcoal/80">{b.service}</td>
                    <td className="px-4 py-3 text-charcoal/80">{b.start}</td>
                    <td className="px-4 py-3 text-charcoal/80">{b.resource}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        b.deposit === 'Paid' ? 'text-green-700 bg-green-50' :
                        b.deposit === 'Refunded' ? 'text-amber-700 bg-amber-50' :
                        b.deposit === 'Retained' ? 'text-gray-600 bg-gray-100' :
                        'text-blue-700 bg-blue-50'
                      }`}>
                        {b.deposit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{b.source}</td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-cream rounded transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-40">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              No bookings found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted">
          <span>Showing {filtered.length} of {demoBookings.length} bookings</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border border-border rounded hover:bg-cream disabled:opacity-40" disabled>Previous</button>
            <span className="px-2 py-1">1 / 1</span>
            <button className="px-2 py-1 border border-border rounded hover:bg-cream disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
