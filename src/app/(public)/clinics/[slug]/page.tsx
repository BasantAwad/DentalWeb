import Link from 'next/link'
import { notFound } from 'next/navigation'

// Demo clinic data — in production these come from Supabase
const CLINICS = [
  {
    id: 'demo-1',
    name: 'Alexandria Dental Center',
    slug: 'alexandria-dental-center',
    logo_url: 'https://images.unsplash.com/photo-1629283440839-c12108cf86f9?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1559981272-8218-fbd16d21a71f?w=1400&h=500&fit=crop',
    description: 'Full-service dental clinic offering general dentistry, radiography, sterilization services, chair and dummy head rental for students, and dental education courses.',
    address: '8 Ahmed Orabi Street',
    city: 'Alexandria, Egypt',
    phone: '+20 3 480 1234',
    email: 'info@alexdental.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#0ea5a0',
    deposit_pct: 50,
    cancellation_cutoff_hours: 24,
    reviews: 4.8,
    review_count: 124,
    services: [
      { name: 'General Dentistry', price: 300, duration: 45, category: 'general' },
      { name: 'Dental X-Ray', price: 150, duration: 30, category: 'radiography' },
      { name: 'Chair Rental (Hourly)', price: 120, duration: 60, category: 'chair_rental' },
      { name: 'Dummy Head Practice', price: 180, duration: 60, category: 'dummy_head' },
      { name: 'Instrument Sterilization', price: 200, duration: 60, category: 'sterilization' },
      { name: 'Tooth Assistance', price: 100, duration: 30, category: 'assistance' },
    ],
    courses: [
      { title: 'Introduction to Dental Radiography', price: 2500, deposit: 1250, date: '2026-10-12', spots: 6 },
      { title: 'Operative Dentistry Hands-On Workshop', price: 4800, deposit: 2400, date: '2026-11-04', spots: 3 },
      { title: 'Sterilization & Infection Control Intensive', price: 1800, deposit: 900, date: '2026-09-28', spots: 3 },
    ],
    hours: [
      { day: 'Sunday–Thursday', time: '9:00 AM – 6:00 PM' },
      { day: 'Saturday', time: '10:00 AM – 4:00 PM' },
      { day: 'Friday', time: 'Closed' },
    ],
    resources: [
      { name: 'Dental Chair A', type: 'chair', available: true },
      { name: 'Dental Chair B', type: 'chair', available: true },
      { name: 'Dummy Head Station 1', type: 'dummy_head', available: false },
      { name: 'X-Ray Room', type: 'xray', available: true },
    ],
  },
  {
    id: 'demo-2',
    name: 'Cairo Smile Institute',
    slug: 'cairo-smile-institute',
    logo_url: 'https://images.unsplash.com/photo-1579829366248-204fe84135da?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1622248802460-657312086dc9?w=1400&h=500&fit=crop',
    description: 'Modern dental education center and clinic focused on practical training, sterilization reprocessing, and student chair access.',
    address: '22 Salah Salem Street',
    city: 'Cairo, Egypt',
    phone: '+20 2 2290 5678',
    email: 'contact@cairosmile.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#1a1a2e',
    deposit_pct: 50,
    cancellation_cutoff_hours: 24,
    reviews: 4.6,
    review_count: 89,
    services: [
      { name: 'General Dentistry', price: 350, duration: 45, category: 'general' },
      { name: 'Chair Rental (Hourly)', price: 110, duration: 60, category: 'chair_rental' },
      { name: 'Dummy Head Practice', price: 160, duration: 60, category: 'dummy_head' },
      { name: 'Instrument Sterilization', price: 180, duration: 60, category: 'sterilization' },
    ],
    courses: [
      { title: 'Digital Dentistry & Intraoral Scanning', price: 3200, deposit: 1600, date: '2027-01-11', spots: 9 },
      { title: 'Pediatric Dentistry Clinical Skills', price: 3600, deposit: 1800, date: '2027-02-08', spots: 10 },
    ],
    hours: [
      { day: 'Saturday–Thursday', time: '8:00 AM – 7:00 PM' },
      { day: 'Friday', time: 'Closed' },
    ],
    resources: [
      { name: 'Chair 1', type: 'chair', available: true },
      { name: 'Chair 2', type: 'chair', available: false },
      { name: 'Dummy Head Unit A', type: 'dummy_head', available: true },
    ],
  },
  {
    id: 'demo-3',
    name: 'Nile Delta Dental Hub',
    slug: 'nile-delta-dental-hub',
    logo_url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1606861896094-2e6a1ac2d5f4?w=1400&h=500&fit=crop',
    description: 'Community-focused dental clinic and training center providing instrument sterilization, radiography, and hands-on dummy head practice for students.',
    address: '15 Orabi Square',
    city: 'Port Said, Egypt',
    phone: '+20 69 888 9900',
    email: 'hello@niledelta.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#2d8a5e',
    deposit_pct: 50,
    cancellation_cutoff_hours: 24,
    reviews: 4.9,
    review_count: 56,
    services: [
      { name: 'Dental X-Ray', price: 130, duration: 30, category: 'radiography' },
      { name: 'Chair Rental (Hourly)', price: 100, duration: 60, category: 'chair_rental' },
      { name: 'Dummy Head Practice', price: 150, duration: 60, category: 'dummy_head' },
      { name: 'Instrument Sterilization', price: 160, duration: 60, category: 'sterilization' },
    ],
    courses: [
      { title: 'Endodontics for General Dentists', price: 5200, deposit: 2600, date: '2026-12-02', spots: 0 },
      { title: 'Sterilization & Infection Control Intensive', price: 1800, deposit: 900, date: '2026-09-28', spots: 3 },
    ],
    hours: [
      { day: 'Sunday–Thursday', time: '9:00 AM – 5:00 PM' },
      { day: 'Friday–Saturday', time: 'Closed' },
    ],
    resources: [
      { name: 'Training Chair 1', type: 'chair', available: true },
      { name: 'Dummy Head Station', type: 'dummy_head', available: true },
      { name: 'X-Ray Suite', type: 'xray', available: true },
    ],
  },
]

const CATEGORY_ICONS: Record<string, string> = {
  general: '🦷',
  radiography: '🩻',
  chair_rental: '🪑',
  dummy_head: '🎭',
  sterilization: '🧪',
  assistance: '🔍',
}

const RESOURCE_ICONS: Record<string, string> = {
  chair: '🪑',
  dummy_head: '🎭',
  xray: '🩻',
  sterilization: '🧪',
}

export default async function ClinicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clinic = CLINICS.find(c => c.slug === slug)
  if (!clinic) notFound()

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Cover image */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src={clinic.cover_image_url}
          alt={clinic.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/20 to-transparent" />
        {/* Back link */}
        <Link
          href="/clinics"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium hover:bg-white/30 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          All clinics
        </Link>

        {/* Star rating */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="text-sm font-bold text-navy">{clinic.reviews}</span>
          <span className="text-xs text-muted">({clinic.review_count})</span>
        </div>
      </div>

      {/* Clinic identity bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-4 -mt-10 mb-8 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-4 border-white shadow-xl shrink-0 bg-white">
            <img src={clinic.logo_url} alt={clinic.name} className="w-full h-full object-cover" />
          </div>
          <div className="pb-2 min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-navy truncate">{clinic.name}</h1>
            <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {clinic.address}, {clinic.city}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pb-2 shrink-0">
            <a
              href={`/chair-rental`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-charcoal transition-all shadow-lg shadow-navy/10"
            >
              Book Now
            </a>
            <a
              href={`tel:${clinic.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-white text-navy text-sm font-medium rounded-xl hover:border-aqua/40 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.9a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-3">About this clinic</h2>
              <p className="text-charcoal/75 leading-relaxed">{clinic.description}</p>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-lg font-semibold text-navy mb-4">Services & Pricing</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {clinic.services.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:border-aqua/30 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CATEGORY_ICONS[s.category] || '🦷'}</span>
                      <div>
                        <p className="text-sm font-medium text-navy">{s.name}</p>
                        <p className="text-xs text-muted">{s.duration} min</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-navy">{s.price} EGP</p>
                      <p className="text-[10px] text-muted">deposit: {Math.ceil(s.price * clinic.deposit_pct / 100)} EGP</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/chair-rental" className="inline-flex items-center gap-1.5 text-xs text-aqua hover:text-aqua-dark mt-4 font-medium transition-colors">
                Book a service
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            {/* Courses */}
            {clinic.courses.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-navy mb-4">Courses & Training</h2>
                <div className="space-y-3">
                  {clinic.courses.map(c => {
                    const isFull = c.spots === 0
                    return (
                      <div key={c.title} className="flex items-center justify-between p-4 bg-white rounded-xl border border-border hover:border-aqua/30 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-navy truncate">{c.title}</p>
                          <p className="text-xs text-muted mt-0.5">
                            Starts {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-navy">{c.price} EGP</p>
                            <p className="text-[10px] text-muted">dep: {c.deposit} EGP</p>
                          </div>
                          {isFull ? (
                            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">Full</span>
                          ) : (
                            <Link href="/courses" className="text-xs bg-aqua text-white px-3 py-1.5 rounded-lg hover:bg-aqua-dark transition-colors font-medium">
                              {c.spots} left
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs text-aqua hover:text-aqua-dark mt-4 font-medium transition-colors">
                  View all courses
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Quick CTA */}
            <div className="bg-navy text-white rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-2">Ready to book?</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                Pay a {clinic.deposit_pct}% deposit online to reserve your slot instantly.
              </p>
              <Link href="/chair-rental" className="block w-full py-2.5 bg-aqua text-white text-sm font-semibold rounded-lg text-center hover:bg-aqua-dark transition-colors">
                Book a Chair or Service
              </Link>
              <Link href="/tooth-assistance" className="block w-full py-2 border border-white/20 text-white text-xs font-medium rounded-lg text-center hover:bg-white/10 transition-colors mt-2">
                Tooth Assistance Request
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy mb-3">Resources</h3>
              <div className="space-y-2">
                {clinic.resources.map(r => (
                  <div key={r.name} className="flex items-center justify-between">
                    <span className="text-sm text-charcoal flex items-center gap-2">
                      {RESOURCE_ICONS[r.type] || '📦'}
                      {r.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {r.available ? 'Available' : 'In use'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aqua">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                Operating Hours
              </h3>
              <div className="space-y-1.5">
                {clinic.hours.map(h => (
                  <div key={h.day} className="flex justify-between text-xs">
                    <span className="text-muted">{h.day}</span>
                    <span className={`font-medium ${h.time === 'Closed' ? 'text-danger' : 'text-navy'}`}>{h.time}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted mt-3">
                Timezone: {clinic.timezone} · Cancellation within {clinic.cancellation_cutoff_hours}h is non-refundable.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-navy mb-3">Contact</h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.9a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <a href={`tel:${clinic.phone}`} className="hover:text-aqua transition-colors">{clinic.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href={`mailto:${clinic.email}`} className="hover:text-aqua transition-colors truncate">{clinic.email}</a>
                </div>
                <div className="flex items-start gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{clinic.address}, {clinic.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
