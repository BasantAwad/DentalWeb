'use client'

import { useState } from 'react'
import { format, addDays, startOfDay, getDay } from 'date-fns'
import Link from 'next/link'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`)
const DEPOSIT_PCT = 50

function buildCalendar(): (Date | null)[][] {
  const today = startOfDay(new Date())
  const days = Array.from({ length: 28 }, (_, i) => addDays(today, i))
  const grid: (Date | null)[][] = []
  let week: (Date | null)[] = Array(getDay(days[0])).fill(null)
  for (const d of days) {
    week.push(d)
    if (week.length === 7) { grid.push(week); week = [] }
  }
  if (week.length) { while (week.length < 7) week.push(null); grid.push(week) }
  return grid
}

export interface RentalItem {
  name: string
  pricePerHour: number
  images: string[]
  description: string
  specs: { label: string; value: string }[]
  includes: string[]
  accentColor?: string
}

export default function RentalBookingPage({ item }: { item: RentalItem }) {
  const calendar = buildCalendar()
  const today = startOfDay(new Date())
  const [activeImage, setActiveImage] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)
  const [duration, setDuration] = useState(1)
  const [confirmed, setConfirmed] = useState(false)

  const accent = item.accentColor ?? '#0ea5a0'
  const totalPrice = item.pricePerHour * duration
  const deposit = Math.ceil(totalPrice * (DEPOSIT_PCT / 100))
  const balance = totalPrice - deposit
  const endHour = selectedHour
    ? `${String(parseInt(selectedHour) + duration).padStart(2, '0')}:00`
    : null

  const isDisabled = (d: Date | null) =>
    !d || d < today || getDay(d) === 5 // Friday closed

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Top bar ── */}
      <div className="border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link href="/chair-rental" className="hover:text-navy transition-colors flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Chair &amp; Dummy Head Rental
            </Link>
            <span>/</span>
            <span className="font-semibold text-navy">{item.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-navy">
            <span className="text-muted font-normal text-xs">From</span>
            {item.pricePerHour} EGP/hr
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-14 items-start">

          {/* ── LEFT: Image panel (sticky) ── */}
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-cream border border-border shadow-sm aspect-[4/3]">
              <img
                src={item.images[activeImage]}
                alt={`${item.name} — view ${activeImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Accent badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
                style={{ background: accent }}
              >
                {item.name}
              </div>
              {/* Nav arrows */}
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + item.images.length) % item.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % item.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex gap-2">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-aqua shadow-sm' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {activeImage === i && (
                      <div className="absolute inset-0 bg-aqua/10" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Description + specs */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <p className="text-sm text-charcoal/70 leading-relaxed">{item.description}</p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2">
                {item.specs.map((s) => (
                  <div key={s.label} className="bg-cream rounded-xl p-3 border border-border">
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">{s.label}</p>
                    <p className="text-xs font-semibold text-navy">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* What's included */}
              <div>
                <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">What&apos;s included</p>
                <ul className="space-y-1.5">
                  {item.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2 text-xs text-charcoal/70">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Calendar + booking details ── */}
          <div className="space-y-5">

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-navy mb-5 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Select a date
                <span className="text-xs font-normal text-muted ml-auto">
                  {format(today, 'MMMM yyyy')}
                </span>
              </h2>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted/60 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="space-y-1">
                {calendar.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1">
                    {week.map((date, di) => {
                      if (!date) return <div key={di} />
                      const disabled = isDisabled(date)
                      const isFri = getDay(date) === 5
                      const isSelected = selectedDate
                        ? format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        : false
                      const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                      return (
                        <button
                          key={di}
                          disabled={disabled}
                          onClick={() => { setSelectedDate(date); setSelectedHour(null) }}
                          className={`relative aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'text-white shadow-md'
                              : disabled
                              ? isFri
                                ? 'bg-red-50/60 text-red-300 cursor-not-allowed text-[10px]'
                                : 'text-muted/25 cursor-not-allowed'
                              : 'bg-white border border-border hover:border-current/30 cursor-pointer hover:shadow-sm'
                          } ${isToday && !isSelected ? 'ring-2 ring-offset-1' : ''}`}
                          style={isSelected ? { background: accent } : {}}
                        >
                          <span>{format(date, 'd')}</span>
                          {isFri && !isSelected && (
                            <span className="text-[8px] text-red-400 leading-none">Closed</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border text-[10px] text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-border" />Available
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: accent }} />Selected
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-50 border border-dashed border-red-300" />Closed
                </div>
              </div>
            </div>

            {/* Time slots */}
            {selectedDate ? (
              <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
                <h2 className="text-base font-semibold text-navy mb-4 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: accent }}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  Start time
                  <span className="text-xs font-normal text-muted ml-auto">
                    {format(selectedDate, 'EEE d MMM')}
                  </span>
                </h2>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {HOURS.map((hour) => {
                    const isSelected = selectedHour === hour
                    return (
                      <button
                        key={hour}
                        onClick={() => setSelectedHour(hour)}
                        className={`py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                          isSelected
                            ? 'text-white border-transparent shadow-md'
                            : 'bg-white border-border hover:border-current/30 text-charcoal hover:shadow-sm cursor-pointer'
                        }`}
                        style={isSelected ? { background: accent } : {}}
                      >
                        {hour}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-border p-6 text-center text-muted text-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-muted/30">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                Select a date to see available time slots
              </div>
            )}

            {/* Duration + summary */}
            {selectedDate && selectedHour && (
              <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-4">
                {/* Duration picker */}
                <div>
                  <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">Session duration</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      disabled={duration <= 1}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-cream disabled:opacity-30 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/>
                      </svg>
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-bold text-navy">{duration}</span>
                      <span className="text-sm text-muted ml-1">hr{duration > 1 ? 's' : ''}</span>
                      <p className="text-[10px] text-muted mt-0.5">
                        {selectedHour} → {endHour}
                      </p>
                    </div>
                    <button
                      onClick={() => setDuration(Math.min(8, duration + 1))}
                      disabled={duration >= 8}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-cream disabled:opacity-30 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  </div>
                  {/* Duration quick-select */}
                  <div className="flex gap-1.5 mt-3">
                    {[1, 2, 3, 4, 6, 8].map((h) => (
                      <button
                        key={h}
                        onClick={() => setDuration(h)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          duration === h
                            ? 'text-white border-transparent'
                            : 'border-border text-muted hover:border-current/30'
                        }`}
                        style={duration === h ? { background: accent } : {}}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>{item.pricePerHour} EGP × {duration} hr{duration > 1 ? 's' : ''}</span>
                    <span>{totalPrice} EGP</span>
                  </div>
                  <div className="flex justify-between font-bold text-navy border-t border-border pt-2">
                    <span>Total</span>
                    <span>{totalPrice} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Deposit due now (50%)</span>
                    <span className="font-bold" style={{ color: accent }}>{deposit} EGP</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Balance payable at clinic</span>
                    <span>{balance} EGP</span>
                  </div>
                </div>

                {/* Deposit info */}
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-2.5 text-xs text-amber-800">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  A <strong>50% deposit ({deposit} EGP)</strong> is required to hold this slot. The remaining {balance} EGP is paid at the clinic.
                </div>

                {/* CTA */}
                {confirmed ? (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-green-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p className="text-sm font-semibold text-green-800">Booking confirmed!</p>
                    <p className="text-xs text-green-600 mt-1">
                      {format(selectedDate, 'EEEE d MMM yyyy')} · {selectedHour}–{endHour} · {item.name}
                    </p>
                    <button
                      onClick={() => { setConfirmed(false); setSelectedDate(null); setSelectedHour(null); setDuration(1) }}
                      className="mt-3 text-xs text-green-700 underline"
                    >
                      Book another slot
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmed(true)}
                    className="w-full py-3.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    style={{ background: accent }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
                    </svg>
                    Pay {deposit} EGP Deposit via Paymob
                  </button>
                )}

                <p className="text-[10px] text-muted text-center">
                  Cancellations within 24h are non-refundable · Secure payment via Paymob
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
