import Link from 'next/link'

export const metadata = {
  title: 'Chair & Dummy Head Rental — Dental Platform',
  description:
    'Book dental chair or phantom head practice sessions by the hour. Live availability, transparent pricing, and 50% deposit checkout via Paymob.',
}

const ITEMS = [
  {
    href: '/chair-rental/dental-chair',
    name: 'Dental Chair',
    tagline: 'Full clinical setup · by the hour',
    price: 120,
    unit: 'EGP / hour',
    accent: '#1a1a2e',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop&q=85',
    features: [
      'Full articulating dental chair',
      'LED operating light',
      'HVE suction & air/water syringe',
      'Sterile basic instrument tray',
      'Gloves, masks & disposables',
      'Pre-session disinfection',
    ],
    badge: 'Most popular',
  },
  {
    href: '/chair-rental/dummy-head',
    name: 'Dummy Head Practice',
    tagline: 'Phantom head manikin · by the hour',
    price: 180,
    unit: 'EGP / hour',
    accent: '#2d8a5e',
    image: 'https://images.unsplash.com/photo-1598256989514-c2f2aadcf2e9?w=800&h=600&fit=crop&q=85',
    features: [
      'Full phantom head manikin unit',
      'Typodont teeth (28 teeth)',
      'High-speed & low-speed handpieces',
      'Assorted burs, files & reamers',
      'Impression material (one mix)',
      'Suction & spittoon setup',
    ],
    badge: 'Students & OSCE prep',
  },
]

export default function ChairRentalIndexPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-b from-navy to-charcoal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <span className="inline-block px-3 py-1.5 bg-aqua/20 text-aqua text-xs font-semibold rounded-full mb-4">
            Chair &amp; Dummy Head Rental
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            What would you like to book?
          </h1>
          <p className="text-white/65 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Choose between a fully-equipped dental chair or a phantom head practice station.
            Book by the hour with live availability and 50% deposit checkout.
          </p>
        </div>
      </div>

      {/* Choice cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-white rounded-2xl border border-border overflow-hidden hover:border-current/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ '--tw-ring-color': item.accent } as React.CSSProperties}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Badge */}
                <span
                  className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold text-white rounded-full uppercase tracking-wider"
                  style={{ background: item.accent }}
                >
                  {item.badge}
                </span>
                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-2xl font-black leading-none">{item.price}</p>
                  <p className="text-white/60 text-xs">{item.unit}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold text-navy group-hover:text-current transition-colors"
                      style={{ color: undefined }}>
                      {item.name}
                    </h2>
                    <p className="text-xs text-muted">{item.tagline}</p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: item.accent }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                {/* Feature list */}
                <ul className="mt-4 space-y-2">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-charcoal/70">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: item.accent }}>
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA strip */}
                <div
                  className="mt-5 pt-4 border-t border-border flex items-center justify-between text-sm"
                >
                  <div className="text-xs text-muted">
                    50% deposit · paid via Paymob
                  </div>
                  <span
                    className="font-bold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                    style={{ color: item.accent }}
                  >
                    Book now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works strip */}
        <div className="mt-12 grid sm:grid-cols-4 gap-4 text-center">
          {[
            { n: '1', label: 'Choose an item', sub: 'Chair or dummy head' },
            { n: '2', label: 'Pick a date & time', sub: 'From the live calendar' },
            { n: '3', label: 'Set duration', sub: '1–8 hours' },
            { n: '4', label: 'Pay 50% deposit', sub: 'Instant confirmation' },
          ].map((s) => (
            <div key={s.n} className="bg-white rounded-xl border border-border p-4">
              <div className="w-8 h-8 rounded-full bg-cream border border-border text-navy text-xs font-black flex items-center justify-center mx-auto mb-2">
                {s.n}
              </div>
              <p className="text-xs font-semibold text-navy">{s.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Policy note */}
        <div className="mt-8 p-4 bg-cream rounded-xl border border-border text-xs text-muted text-center leading-relaxed">
          Bookings run <strong>Sunday–Thursday</strong> and <strong>Saturday</strong>, 8:00 AM – 7:00 PM.
          Friday is closed. Cancellations made within 24 hours of the session are non-refundable.
          The remaining balance is paid directly at the clinic.
        </div>
      </div>
    </div>
  )
}
