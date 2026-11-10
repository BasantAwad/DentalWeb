import Link from 'next/link'
import { SERVICES } from '@/lib/services-data'

export const metadata = {
  title: 'All Services — Dental Platform',
  description:
    'Browse all dental services: chair rental, dummy head practice, radiography, sterilization, tooth assistance, and general dentistry. Book with a 50% deposit via Paymob.',
}

export default function ServicesIndexPage() {
  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy to-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-aqua/20 text-aqua text-xs font-semibold rounded-full mb-3">
              Platform Services
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              All dental services
            </h1>
            <p className="text-white/70 mt-3 text-base leading-relaxed">
              Every service is bookable online with a 50% deposit via Paymob. Live availability,
              transparent pricing, and instant confirmation — all in Egyptian pounds.
            </p>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-aqua/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
                <div
                  className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                  style={{ background: service.accentColor }}
                >
                  {service.category.replace('_', ' ')}
                </div>
                <span className="absolute top-3 right-3 bg-white/90 text-navy text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {service.duration} min
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <h2 className="text-sm font-bold text-navy group-hover:text-aqua transition-colors mb-1">
                  {service.name}
                </h2>
                <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">
                  {service.shortDescription}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {service.highlights.slice(0, 2).map((h) => (
                    <span key={h} className="px-1.5 py-0.5 bg-cream text-[10px] text-muted rounded border border-border">
                      {h}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-base font-bold text-navy">{service.price} <span className="text-xs font-normal text-muted">EGP</span></p>
                    <p className="text-[10px] text-muted">Deposit: {service.deposit} EGP</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-aqua group-hover:text-aqua-dark group-hover:gap-2 transition-all">
                    View details
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Payment banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-navy rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Pay securely with Paymob</h3>
            <p className="text-white/60 text-sm mt-1">
              All deposits are processed via Paymob — Egypt&apos;s leading payment gateway.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {[
              { icon: 'M3 11a9 9 0 1 1 18 0', label: 'Encrypted' },
              { icon: 'M20 6L9 17l-5-5', label: 'Instant confirm' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs text-white/60">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
                {b.label}
              </div>
            ))}
            <Link
              href="/chair-rental"
              className="px-4 py-2 bg-aqua text-white text-sm font-semibold rounded-xl hover:bg-aqua-dark transition-colors"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
