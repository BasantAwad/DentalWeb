'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AboutPage() {
  const values = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: 'Trust & Safety',
      desc: 'Every booking is protected by secure payment processing and conflict-safe availability. Clinics configure their own policies, and the platform enforces them consistently.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: 'Multi-Clinic, One Platform',
      desc: 'Different clinics, different brands, one unified booking experience. Each clinic configures its own profile, services, hours, and branding without a code deployment.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      ),
      title: 'Live Availability',
      desc: 'Availability is calculated from a single source of truth: operating hours, existing bookings, phone bookings, closures, and maintenance blocks. No overselling — ever.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      title: 'Deposit-First Booking',
      desc: 'Users pay a deposit online — at least 50% of the total — before a booking is confirmed. The remaining balance, if any, is payable at the clinic.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6l1 1a1 1 0 0 0 1.4 0l1-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"/>
          <circle cx="12" cy="11" r="2"/>
        </svg>
      ),
      title: 'Tooth Assistance Workflow',
      desc: 'Students and patients can select teeth on an interactive 3D model using FDI notation, add notes, and submit an assistance request — without exposing private clinical records publicly.',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      ),
      title: 'Instrument Sterilization',
      desc: 'Sterilization and reprocessing services with operational turnaround tracking. The system distinguishes booking time from cleaning/reprocessing time so staff can plan realistically.',
    },
  ]

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-b from-ivory to-cream border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-aqua-light text-aqua-dark text-xs font-semibold rounded-full mb-3">
              About the Platform
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">
              A modern platform for dental clinics & education
            </h1>
            <p className="text-charcoal/70 mt-3 text-base leading-relaxed">
              Dental is a multi-tenant booking and education platform built for dental clinics, training centers,
              and practical education facilities across Egypt. Patients and students discover clinics, book
              appointments, rent chairs and dummy heads, enroll in courses, and request tooth-selection assistance
              — all online.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* What we do */}
        <section className="mb-16">
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-4">What we help clinics and students do</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm leading-relaxed text-charcoal/80">
              {[
                'Patients discover certified clinics and compare services, hours, and locations.',
                'Students and patients book appointments, reserve chairs and dummy heads, and pay a deposit online.',
                'Clinics configure their own profile, branding, services, prices, hours, and policies.',
                'Staff manage bookings, availability, courses, sterilization jobs, and payments from an installable admin PWA.',
                'Students select teeth on an interactive 3D model and submit assistance requests for a consultation.',
                'Clinics track sterilization and reprocessing workload with booking time and turnaround windows.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-aqua mt-0.5 shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-navy mb-6">Our approach</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="bg-white rounded-xl border border-border p-5 hover:border-aqua/20 hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="w-9 h-9 rounded-lg bg-aqua-light flex items-center justify-center text-aqua mb-3">
                  {v.icon}
                </div>
                <h3 className="text-sm font-semibold text-navy mb-1">{v.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How booking works */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-navy mb-6">Booking & payment flow</h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            {[
              { n: '01', title: 'Discovery', desc: 'Browse clinics and services on the public platform.' },
              { n: '02', title: 'Select a slot', desc: 'Check live availability and choose a date, time, and resource.' },
              { n: '03', title: 'Pay the deposit', desc: 'Pay at least 50% of the total online via Paymob in EGP.' },
              { n: '04', title: 'Booking confirmed', desc: 'The booking is confirmed automatically once payment succeeds.' },
              { n: '05', title: 'Balance at clinic', desc: 'The remaining balance, if any, is paid when you arrive.' },
            ].map((step, i) => (
              <div key={step.n} className="flex items-start gap-4 p-4 sm:p-5 border-b last:border-b-0">
                <span className="text-2xl font-black text-aqua/20 select-none sm:w-10">{step.n}</span>
                <div>
                  <h3 className="text-sm font-semibold text-navy">{step.title}</h3>
                  <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="text-sm text-muted space-y-2">
          <p><strong>Demo status:</strong> This portfolio showcase uses seed demo data. In production, all clinic
            profiles, services, prices, operating hours, and Paymob integration are configured through the admin
            panel and Supabase backend.</p>
          <p><strong>Payment provider:</strong> Paymob is the initial payment provider, integrated server-side with
            verified callbacks, idempotency, and EGP pricing. Paymob credentials remain server-side and are never
            exposed to the browser.</p>
          <p><strong>3D model credit:</strong> The interactive 3D tooth model on the homepage is based on{' '}
            <a href="https://sketchfab.com/3d-models/maxillary-first-molar-with-cusp-of-carabelli-9117c7a9bf0848f29bc4e85931697e7b" target="_blank" rel="noopener noreferrer" className="text-aqua hover:underline">
              Maxillary First Molar with Cusp of Carabelli
            </a> by{' '}
            <a href="https://sketchfab.com/DundeeDental" target="_blank" rel="noopener noreferrer" className="text-aqua hover:underline">
              University of Dundee, School of Dentistry
            </a>, licensed under{' '}
            <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-aqua hover:underline">
              CC-BY-4.0
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
