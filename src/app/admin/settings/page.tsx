'use client'

import { useState } from 'react'
import AdminLayout from '@/app/admin/layout'

const depositOptions = [
  { value: '50', label: '50% of total (default)' },
  { value: '25', label: '25% of total' },
  { value: '100', label: '100% upfront' },
  { value: 'custom', label: 'Custom fixed amount' },
]

const cancellationOptions = [
  { hours: 24, label: '24 hours (default)' },
  { hours: 48, label: '48 hours' },
  { hours: 72, label: '72 hours' },
  { hours: 0, label: 'No refund (all cancellations non-refundable)' },
]

export default function AdminSettingsPage() {
  const [clinicName, setClinicName] = useState('Alexandria Dental Center')
  const [clinicPhone, setClinicPhone] = useState('+20 3 480 1234')
  const [clinicEmail, setClinicEmail] = useState('info@alexdental.example.com')
  const [clinicAddress, setClinicAddress] = useState('8 Ahmed Orabi Street, Alexandria, Egypt')
  const [brandColor, setBrandColor] = useState('#0ea5a0')
  const [depositPct, setDepositPct] = useState('50')
  const [cancellationHours, setCancellationHours] = useState('24')
  const [timezone, setTimezone] = useState('Africa/Cairo')
  const [paymobEnabled, setPaymobEnabled] = useState(true)
  const [paymobEnv, setPaymobEnv] = useState('sandbox')

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Settings</h1>
          <p className="text-sm text-muted mt-0.5">Configure clinic profile, branding, policies, and payment settings.</p>
        </div>

        {/* Clinic profile */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Clinic Profile
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Clinic name</label>
              <input
                type="text"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Phone</label>
              <input
                type="text"
                value={clinicPhone}
                onChange={e => setClinicPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Email</label>
              <input
                type="email"
                value={clinicEmail}
                onChange={e => setClinicEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Address</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={e => setClinicAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Brand color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={e => setBrandColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Booking policies */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Booking Policies
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Deposit rule</label>
              <p className="text-xs text-muted mb-2">The minimum percentage or fixed amount a user must pay online before a booking is confirmed.</p>
              <select
                value={depositPct}
                onChange={e => setDepositPct(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              >
                {depositOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Cancellation cutoff</label>
              <p className="text-xs text-muted mb-2">Bookings cancelled within this many hours of the appointment are non-refundable.</p>
              <select
                value={cancellationHours}
                onChange={e => setCancellationHours(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              >
                {cancellationOptions.map(opt => (
                  <option key={opt.hours} value={opt.hours}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Timezone</label>
              <p className="text-xs text-muted mb-2">All booking times are normalized to this timezone. Recommended: Africa/Cairo for Egypt.</p>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
              >
                <option value="Africa/Cairo">Africa/Cairo (Egypt)</option>
                <option value="Africa/Alexandria">Africa/Alexandria</option>
                <option value="Asia/Riyadh">Asia/Riyadh</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </section>

        {/* Paymob */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <path d="M1 10h22"/>
            </svg>
            Payment — Paymob
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">Paymob integration</p>
                <p className="text-xs text-muted mt-0.5">Paymob is the initial payment provider. Credentials are stored server-side and never exposed to the browser.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymobEnabled}
                  onChange={e => setPaymobEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-9 h-5 bg-border rounded-full peer peer-checked:bg-aqua peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${paymobEnabled ? 'peer-checked:bg-aqua' : ''}`} />
              </label>
            </div>

            {paymobEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-aqua/30">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">Environment</label>
                  <select
                    value={paymobEnv}
                    onChange={e => setPaymobEnv(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
                  >
                    <option value="sandbox">Sandbox (testing)</option>
                    <option value="production">Production (live)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1">Integration ID</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  API keys are stored securely server-side. Never paste production keys in a demo environment.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Staff roles */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Staff Roles
          </h2>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="space-y-3">
              {[
                { role: 'Clinic Owner', desc: 'Full access to their own clinic. Can manage all settings, staff, bookings, and payments.', permissions: 'All' },
                { role: 'Manager', desc: 'Can manage services, resources, bookings, and availability. Cannot change clinic settings or delete records.', permissions: 'Book, manage, view' },
                { role: 'Staff', desc: 'Can view bookings, create phone bookings, add blocks, and update sterilization jobs.', permissions: 'View, book, block' },
              ].map(role => (
                <div key={role.role} className="p-3 bg-cream rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-navy">{role.role}</span>
                    <span className="text-[10px] text-muted bg-white px-1.5 py-0.5 rounded border border-border">{role.permissions}</span>
                  </div>
                  <p className="text-xs text-muted">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-charcoal transition-colors shadow-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Settings
          </button>
          <span className="text-[10px] text-muted">Changes are applied immediately to the clinic profile.</span>
        </div>
      </div>
    </AdminLayout>
  )
}
