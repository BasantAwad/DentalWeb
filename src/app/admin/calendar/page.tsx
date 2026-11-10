'use client'

import { useState, useMemo } from 'react'
import AdminLayout from '@/app/admin/layout'

// Demo: 7 days of calendar data for 2 resources
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function daysAhead(n: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + n)
  return d
}

const resources = [
  { id: 'r1', name: 'Chair 1 — Main Operatory', type: 'chair', capacity: 1 },
  { id: 'r2', name: 'Chair 2 — Sterilization Wing', type: 'chair', capacity: 1 },
  { id: 'r3', name: 'Dummy Head Alpha', type: 'dummy_head', capacity: 1 },
]

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = 8 + i
  return `${String(h).padStart(2, '0')}:00`
})

// Demo bookings for the week
const weekendBookings = [0, 1, 2, 3, 4, 5, 6].flatMap(dayOff => {
  const date = daysAhead(dayOff)
  const dateStr = date.toISOString().split('T')[0]
  const demo = [
    { id: `b${dayOff}1`, start: '09:00', end: '10:30', resource: 'r1', status: 'confirmed', label: 'Chair Rental' },
    { id: `b${dayOff}2`, start: '11:00', end: '12:00', resource: 'r1', status: 'held', label: 'Dummy Head Practice' },
    { id: `b${dayOff}3`, start: '14:00', end: '15:00', resource: 'r2', status: 'confirmed', label: 'X-Ray' },
    { id: `b${dayOff}4`, start: '15:30', end: '16:30', resource: 'r3', status: 'pending', label: 'Tooth Assistance' },
  ]
  // Add some days with no bookings
  if (dayOff === 5) return [] // Friday: fewer
  if (dayOff === 4 && Math.random() > 0.5) return []
  return demo
})

function formatHourDisplay(hour: string): string {
  const [h, m] = hour.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

type CellStatus = 'free' | 'occupied' | 'blocked' | 'partial'

function getCellStatus(bookings: any[], hour: string, resourceId: string): CellStatus {
  const hourNum = parseInt(hour)
  const occupied = bookings.filter(b =>
    b.resource === resourceId &&
    parseInt(b.start.split(':')[0]) <= hourNum &&
    parseInt(b.end.split(':')[0]) > hourNum
  )
  if (occupied.length === 0) return 'free'
  return 'occupied'
}

interface DayColumnProps {
  date: Date
  bookings: any[]
  resource: any
  showLegend?: boolean
}

function DayColumn({ date, bookings, resource, showLegend }: DayColumnProps) {
  const dateStr = date.toISOString().split('T')[0]
  const dayBookings = bookings.filter(b => {
    const d = new Date(date)
    return true // we filter by resource in getCellStatus
  })
  const isPast = date < TODAY
  const isWeekend = date.getDay() === 5 || date.getDay() === 6
  const isSunday = date.getDay() === 0

  return (
    <div className={`flex flex-col border-r border-border last:border-r-0 ${isPast ? 'opacity-40' : ''}`}>
      {/* Day header */}
      <div className={`p-2 text-center border-b border-border ${isWeekend ? 'bg-red-50/30' : isSunday ? 'bg-gray-50/50' : ''}`}>
        <p className={`text-[10px] font-medium ${isWeekend ? 'text-red-500' : 'text-muted'}`}>
          {date.toLocaleDateString('en-GB', { weekday: 'short' })}
        </p>
        <p className="text-sm font-bold text-navy">{date.getDate()}</p>
        <p className="text-[10px] text-muted">{date.toLocaleDateString('en-GB', { month: 'short' })}</p>
      </div>

      {/* Hour grid */}
      <div className="flex-1 grid grid-rows-7 grid-cols-1">
        {HOURS.slice(0, isWeekend ? 7 : isSunday ? 5 : 11).map((hour, hi) => {
          const status = getCellStatus(dayBookings, hour, resource.id)
          const hourBookings = dayBookings.filter(b => b.resource === resource.id && parseInt(b.start.split(':')[0]) === hi + 8)

          return (
            <div
              key={hour}
              className={`border-b border-border last:border-b-0 min-h-[22px] ${status === 'occupied' ? 'bg-aqua/5 hover:bg-aqua/10' : status === 'free' ? 'hover:bg-cream/30' : ''}`}
            >
              {hourBookings.length > 0 && (
                <div className="h-full flex flex-col gap-0.5 px-0.5">
                  {hourBookings.map(b => (
                    <div
                      key={b.id}
                      className={`text-[9px] px-0.5 py-0.5 rounded truncate leading-tight ${
                        b.status === 'confirmed' ? 'bg-green-500 text-white' :
                        b.status === 'held' ? 'bg-amber-500 text-white' :
                        b.status === 'pending' ? 'bg-blue-500 text-white' :
                        'bg-purple-500 text-white'
                      }`}
                      title={`${b.label} · ${b.start}-${b.end} · ${b.status}`}
                    >
                      {b.label.substring(0, 14)}
                    </div>
                  ))}
                </div>
              )}
              {showLegend && status === 'free' && (
                <div className="w-1 h-1 rounded-full bg-border mx-auto mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

      {/* Status indicators at bottom */}
      <div className="px-1.5 py-1 text-[8px] text-muted flex justify-center gap-1">
        {dayBookings.filter(b => b.resource === resource.id).length > 0 && (
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded bg-green-500" />
            {dayBookings.filter(b => b.resource === resource.id && b.status === 'confirmed').length}
          </span>
        )}
        {dayBookings.filter(b => b.resource === resource.id).length > 0 && (
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-1.5 h-1.5 rounded bg-amber-500" />
            {dayBookings.filter(b => b.resource === resource.id && b.status === 'held').length}
          </span>
        )}
      </div>
    </div>
  )
}

export default function AdminCalendarPage() {
  const [selectedResource, setSelectedResource] = useState('r1')
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showNewBooking, setShowNewBooking] = useState(false)

  const currentResource = resources.find(r => r.id === selectedResource)!

  // Legend
  const legend = [
    { color: 'bg-green-500', label: 'Confirmed' },
    { color: 'bg-amber-500', label: 'Held (pending payment)' },
    { color: 'bg-blue-500', label: 'Pending' },
    { color: 'bg-purple-500', label: 'Scheduled' },
    { color: 'bg-red-200', label: 'Block' },
    { color: 'bg-gray-200', label: 'Unavailable' },
  ]

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">Calendar</h1>
            <p className="text-sm text-muted mt-0.5">Day/week view of all resources with conflict-safe booking.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-border rounded-lg p-0.5">
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'week' ? 'bg-navy text-white' : 'text-charcoal hover:bg-cream'}`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'day' ? 'bg-navy text-white' : 'text-charcoal hover:bg-cream'}`}
              >
                Day
              </button>
            </div>
            <button
              onClick={() => setShowNewBooking(true)}
              className="px-3 py-2 text-sm font-medium bg-aqua text-white rounded-lg hover:bg-aqua-dark transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New booking
            </button>
          </div>
        </div>

        {/* Resource selector */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-medium text-navy">Resource:</span>
          {resources.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedResource(r.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                selectedResource === r.id
                  ? 'bg-navy text-white border-navy shadow-sm'
                  : 'bg-white text-charcoal border-border hover:border-aqua/30'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Time column header */}
              <div className="flex">
                <div className="w-16 shrink-0 bg-cream/50 border-r border-border p-2">
                  <p className="text-[8px] text-muted uppercase tracking-wider text-center">Hour</p>
                </div>
                {/* Day columns */}
                <div className="flex">
                  {daysAhead(0).toISOString().split('T')[0]
                    ? [0, 1, 2, 3, 4, 5, 6].map(dayOff => {
                        const date = daysAhead(dayOff)
                        return (
                          <DayColumn
                            key={dayOff}
                            date={date}
                            bookings={weekendBookings}
                            resource={currentResource}
                            showLegend={true}
                          />
                        )
                      })
                    : null}
                </div>
              </div>

              {/* Time rows with labels */}
              <div className="flex border-t border-border">
                <div className="w-16 shrink-0 bg-cream/50 border-r border-border p-2 flex flex-col">
                  {HOURS.slice(0, 11).map(hour => (
                    <div key={hour} className="h-[22px] flex items-center justify-center">
                      <span className="text-[10px] text-muted">{formatHourDisplay(hour)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-1">
                  {HOURS.slice(0, 11).map((hour, hi) => (
                    <div key={hour} className="h-[22px] flex-1 border-b border-border last:border-b-0 min-w-[100px]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted">
          <span className="font-medium text-navy">Legend:</span>
          {legend.map(item => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>

        {/* Conflict warning */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <span>
            <strong>Conflict prevention:</strong> Admin-created bookings and blackout blocks go through the same
            conflict validation as public bookings. You will see a clear conflict message with the currently
            occupied slot before saving. Two users cannot obtain the same chair and time.
          </span>
        </div>
      </div>

      {/* New booking modal */}
      {showNewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl border border-border shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-lg font-bold text-navy mb-4">Create manual booking</h2>
            <p className="text-xs text-muted mb-4">Phone or walk-in bookings go through the same conflict validation as public bookings.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Patient name</label>
                <input type="text" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30" placeholder="Full name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Service</label>
                <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30">
                  <option>Chair Rental (120 EGP/hr)</option>
                  <option>Dummy Head Practice (180 EGP/hr)</option>
                  <option>Dental Radiography (150 EGP)</option>
                  <option>General Dentistry (300 EGP)</option>
                  <option>Instrument Sterilization (200 EGP)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">Start time</label>
                  <input type="time" className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Duration</label>
                <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30">
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                  <option>3 hours</option>
                  <option>Half day</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Source</label>
                <select className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-aqua/30">
                  <option>Phone call</option>
                  <option>Walk-in</option>
                  <option>Admin created</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Conflict check:</strong> The system will validate this slot against existing bookings, holds, and blocks before saving. You will be prompted if there's a conflict.
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowNewBooking(false)} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-cream transition-colors">
                  Cancel
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-navy text-white rounded-lg hover:bg-charcoal transition-colors">
                  Validate & Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
