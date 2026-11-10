'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// Demo clinic data — in production these come from Supabase
const clinics = [
  {
    id: 'demo-1',
    name: 'Alexandria Dental Center',
    slug: 'alexandria-dental-center',
    logo_url: 'https://images.unsplash.com/photo-1629283440839-c12108cf86f9?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1559981272-8218-fbd16d21a71f?w=1200&h=400&fit=crop',
    description: 'Full-service dental clinic offering general dentistry, radiography, sterilization services, chair and dummy head rental for students, and dental education courses.',
    address: '8 Ahmed Orabi Street',
    city: 'Alexandria',
    phone: '+20 3 480 1234',
    email: 'info@alexdental.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#0ea5a0',
    deposit_pct: 50,
    services_count: 12,
    courses_count: 3,
    reviews: 4.8,
    review_count: 124,
    tags: ['Radiography', 'Chair Rental', 'Courses', 'Sterilization'],
  },
  {
    id: 'demo-2',
    name: 'Cairo Smile Institute',
    slug: 'cairo-smile-institute',
    logo_url: 'https://images.unsplash.com/photo-1579829366248-204fe84135da?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1622248802460-657312086dc9?w=1200&h=400&fit=crop',
    description: 'Modern dental education center and clinic focused on practical training, sterilization reprocessing, and student chair access.',
    address: '22 Salah Salem Street',
    city: 'Cairo',
    phone: '+20 2 2290 5678',
    email: 'contact@cairosmile.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#1a1a2e',
    deposit_pct: 50,
    services_count: 9,
    courses_count: 5,
    reviews: 4.6,
    review_count: 89,
    tags: ['Chair Rental', 'Dummy Head', 'Education', 'Sterilization'],
  },
  {
    id: 'demo-3',
    name: 'Nile Delta Dental Hub',
    slug: 'nile-delta-dental-hub',
    logo_url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=120&h=120&fit=crop&crop=center',
    cover_image_url: 'https://images.unsplash.com/photo-1606861896094-2e6a1ac2d5f4?w=1200&h=400&fit=crop',
    description: 'Community-focused dental clinic and training center providing instrument sterilization, radiography, and hands-on dummy head practice for students.',
    address: '15 Orabi Square',
    city: 'Port Said',
    phone: '+20 69 888 9900',
    email: 'hello@niledelta.example.com',
    timezone: 'Africa/Cairo',
    brand_color: '#2d8a5e',
    deposit_pct: 50,
    services_count: 7,
    courses_count: 2,
    reviews: 4.9,
    review_count: 56,
    tags: ['Radiography', 'Dummy Head', 'Sterilization'],
  },
]

const CITIES = ['All cities', ...Array.from(new Set(clinics.map(c => c.city)))]

export default function ClinicsPage() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('All cities')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating')

  const filtered = useMemo(() => {
    let list = [...clinics]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    if (city !== 'All cities') {
      list = list.filter(c => c.city === city)
    }
    list.sort((a, b) =>
      sortBy === 'rating' ? b.reviews - a.reviews : b.review_count - a.review_count
    )
    return list
  }, [search, city, sortBy])

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-b from-navy to-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-aqua/20 text-aqua text-xs font-semibold rounded-full mb-3">
              Multi-Clinic Discovery
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Explore dental clinics &amp; training centers
            </h1>
            <p className="text-white/70 mt-3 text-base leading-relaxed">
              Browse certified clinics across Egypt. Compare services, hours, resources, and prices.
              Book appointments, rent chairs, enroll in courses — all from one place.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Search + filters */}
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm mb-8 animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clinics, services, cities…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
              />
            </div>

            {/* City filter */}
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white text-charcoal"
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white text-charcoal"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="reviews">Sort: Most Reviews</option>
            </select>

            <span className="text-xs text-muted ml-auto">
              {filtered.length} clinic{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Clinic cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((clinic, i) => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.slug}`}
              className="group block bg-white rounded-xl border border-border overflow-hidden hover:border-aqua/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={clinic.cover_image_url}
                  alt={clinic.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  <div
                    className="px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: clinic.brand_color }}
                  >
                    {clinic.city}
                  </div>
                </div>
                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-navy shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {clinic.reviews}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-2">
                  {clinic.logo_url && (
                    <img
                      src={clinic.logo_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-navy group-hover:text-aqua truncate transition-colors">
                      {clinic.name}
                    </h3>
                    <p className="text-xs text-muted truncate">{clinic.address}, {clinic.city}</p>
                  </div>
                </div>

                <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-2 mb-4">
                  {clinic.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {clinic.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-cream text-[10px] text-muted rounded border border-border">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex flex-wrap gap-3 text-xs text-muted">
                    <span>{clinic.services_count} services</span>
                    <span>{clinic.courses_count} courses</span>
                    <span>{clinic.review_count} reviews</span>
                  </div>
                  <span className="text-xs font-medium text-aqua group-hover:text-aqua-dark transition-colors flex items-center gap-1">
                    View clinic
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-muted/30">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <p className="text-base font-medium text-navy mb-1">No clinics found</p>
            <p className="text-sm">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => { setSearch(''); setCity('All cities') }}
              className="mt-4 text-xs text-aqua hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
