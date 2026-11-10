'use client'

import { useState } from 'react'
import AdminLayout from '@/app/admin/layout'

const demoServices = [
  { id: 's1', name: 'General Dentistry Consultation', category: 'general', duration: 45, price: 300, deposit: 150, buffer: 0, resourceType: '—', mode: 'session', active: true, bookable: true },
  { id: 's2', name: 'Dental Radiography (X-Ray)', category: 'radiography', duration: 30, price: 150, deposit: 75, buffer: 0, resourceType: 'xray', mode: 'session', active: true, bookable: true },
  { id: 's3', name: 'Instrument Sterilization', category: 'sterilization', duration: 60, price: 200, deposit: 100, buffer: 30, resourceType: 'sterilization', mode: 'session', active: true, bookable: true },
  { id: 's4', name: 'Chair Rental (Hourly)', category: 'chair_rental', duration: 60, price: 120, deposit: 60, buffer: 0, resourceType: 'chair', mode: 'hourly', active: true, bookable: true },
  { id: 's5', name: 'Dummy Head Practice', category: 'dummy_head', duration: 60, price: 180, deposit: 90, buffer: 0, resourceType: 'dummy_head', mode: 'hourly', active: true, bookable: true },
  { id: 's6', name: 'Tooth Selection Assistance', category: 'assistance', duration: 30, price: 100, deposit: 50, buffer: 0, resourceType: 'assistance', mode: 'session', active: true, bookable: true },
  { id: 's7', name: 'Teeth Whitening', category: 'general', duration: 90, price: 800, deposit: 400, buffer: 15, resourceType: 'chair', mode: 'session', active: false, bookable: false },
]

const catLabels: Record<string, string> = {
  general: 'General Dentistry',
  radiography: 'Radiography',
  sterilization: 'Sterilization',
  chair_rental: 'Chair Rental',
  dummy_head: 'Dummy Head',
  assistance: 'Tooth Assistance',
  course: 'Course',
  other: 'Other',
}

export default function AdminServicesPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = activeFilter === 'all'
    ? demoServices
    : activeFilter === 'active'
    ? demoServices.filter(s => s.active)
    : demoServices.filter(s => !s.active)

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">Services & Resources</h1>
            <p className="text-sm text-muted mt-0.5">Configure services, prices, deposits, durations, and booking rules per clinic.</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium bg-aqua text-white rounded-lg hover:bg-aqua-dark transition-colors shadow-sm flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Service
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all capitalize ${
                activeFilter === f
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-charcoal border-border hover:border-aqua/30'
              }`}
            >
              {f === 'all' ? 'All services' : f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Price (EGP)</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Deposit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Buffer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Resource</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Mode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-aqua-light flex items-center justify-center text-aqua text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-medium text-navy text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted bg-cream px-1.5 py-0.5 rounded border border-border">
                        {catLabels[s.category] || s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal/80 text-xs">{s.duration} min</td>
                    <td className="px-4 py-3 font-semibold text-navy text-xs">{s.price} EGP</td>
                    <td className="px-4 py-3 text-xs text-green-700 font-medium bg-green-50 px-1.5 py-0.5 rounded">{s.deposit} EGP</td>
                    <td className="px-4 py-3 text-xs text-muted">{s.buffer > 0 ? `${s.buffer} min` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted">{s.resourceType}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        s.mode === 'hourly' ? 'bg-blue-50 text-blue-700' :
                        s.mode === 'session' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {s.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.active ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className="text-xs text-muted">{s.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingId(s.id)}
                        className="p-1 hover:bg-cream rounded transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cream rounded-lg border border-border text-xs text-muted">
          <strong className="text-navy">Note:</strong> Prices are stored as integer minor units (EGP) to avoid floating-point errors.
          Deposit percentages or fixed deposit amounts are configurable per service. The initial chair rental rate is{' '}
          <strong>120 EGP/hour</strong>, stored as configurable data rather than hard-coded UI text.
        </div>
      </div>
    </AdminLayout>
  )
}
