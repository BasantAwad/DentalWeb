'use client'

import { useState } from 'react'
import Link from 'next/link'

const courses = [
  {
    id: 'c1',
    title: 'Introduction to Dental Radiography',
    instructor: 'Dr. Sarah Mahmoud',
    description: 'Fundamentals of digital intraoral and panoramic radiography, radiation safety, image interpretation, and clinical positioning.',
    start: '2026-10-12',
    end: '2026-10-16',
    capacity: 20,
    enrolled: 14,
    price: 2500,
    deposit: 1250,
    image: 'https://images.unsplash.com/photo-1628506091411-8b73e1e1d8ae?w=400&h=220&fit=crop',
    category: 'Radiography',
    tags: ['X-ray', 'Safety', 'Clinical'],
  },
  {
    id: 'c2',
    title: 'Operative Dentistry Hands-On Workshop',
    instructor: 'Prof. Ahmed Hassan',
    description: 'Practical workshop covering cavity preparation, matrix placement, composite placement, and finishing techniques on dummy heads.',
    start: '2026-11-04',
    end: '2026-11-08',
    capacity: 12,
    enrolled: 9,
    price: 4800,
    deposit: 2400,
    image: 'https://images.unsplash.com/photo-1584308666744-24d23f27f203?w=400&h=220&fit=crop',
    category: 'Operative',
    tags: ['Hands-on', 'Composite', 'Prosthetic'],
  },
  {
    id: 'c3',
    title: 'Endodontics for General Dentists',
    instructor: 'Dr. Mona El-Sayed',
    description: 'Modern endodontic protocols, access cavity design, working length determination, rotary instrumentation, and obturation.',
    start: '2026-12-02',
    end: '2026-12-05',
    capacity: 16,
    enrolled: 16,
    price: 5200,
    deposit: 2600,
    image: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=220&fit=crop',
    category: 'Endodontics',
    tags: ['Root Canal', 'Rotary', 'Advanced'],
  },
  {
    id: 'c4',
    title: 'Sterilization & Infection Control Intensive',
    instructor: 'Eng. Youssef Kamal',
    description: 'Comprehensive course on instrument reprocessing cycles, autoclave validation, documentation, and infection control protocols.',
    start: '2026-09-28',
    end: '2026-09-30',
    capacity: 25,
    enrolled: 22,
    price: 1800,
    deposit: 900,
    image: 'https://images.unsplash.com/photo-1621746872564-c50ca471a8a1?w=400&h=220&fit=crop',
    category: 'Infection Control',
    tags: ['Sterilization', 'Protocol', 'Compliance'],
  },
  {
    id: 'c5',
    title: 'Digital Dentistry & Intraoral Scanning',
    instructor: 'Dr. Reem Ashraf',
    description: 'Introduction to intraoral scanners, STL data management, basic digital workflow for crowns, and chairside design principles.',
    start: '2027-01-11',
    end: '2027-01-14',
    capacity: 15,
    enrolled: 6,
    price: 3200,
    deposit: 1600,
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=220&fit=crop',
    category: 'Digital',
    tags: ['Scanning', 'CAD', 'Workflow'],
  },
  {
    id: 'c6',
    title: 'Pediatric Dentistry Clinical Skills',
    instructor: 'Dr. Layla Mostafa',
    description: 'Behavior guidance, minimally invasive techniques, sealants, and pediatric restorative procedures for general practitioners.',
    start: '2027-02-08',
    end: '2027-02-11',
    capacity: 18,
    enrolled: 8,
    price: 3600,
    deposit: 1800,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=220&fit=crop',
    category: 'Pediatric',
    tags: ['Pediatric', 'Behavior', 'Preventive'],
  },
]

export default function CoursesPage() {
  const [activeCat, setActiveCat] = useState('all')
  const [enrolledCourse, setEnrolledCourse] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))]

  const filtered = activeCat === 'all'
    ? courses
    : courses.filter(c => c.category === activeCat)

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-b from-navy to-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-block px-2.5 py-1 bg-aqua/20 text-aqua text-xs font-semibold rounded-full mb-3">
              Education & Training
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dental courses & workshops</h1>
            <p className="text-white/70 mt-3 text-base leading-relaxed">
              Enroll in practical dental education courses with real dates, expert instructors, and limited seats.
              Pay a deposit online to reserve your spot. Courses use the same booking and payment engine as
              chair rental.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-in">
          <h2 className="text-lg font-semibold text-navy">All courses</h2>
          <span className="text-sm text-muted">({courses.length} available)</span>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  activeCat === cat
                    ? 'bg-aqua text-white border-aqua shadow-sm'
                    : 'bg-white text-charcoal border-border hover:border-aqua/30'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => {
            const spotsLeft = course.capacity - course.enrolled
            const isFull = spotsLeft <= 0
            const isEnrolled = enrolledCourse === course.id

            return (
              <div
                key={course.id}
                className={`group bg-white rounded-xl border border-border overflow-hidden hover:border-aqua/30 shadow-sm hover:shadow-lg transition-all animate-fade-in ${isFull ? 'opacity-70' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-navy rounded-full uppercase tracking-wider">
                    {course.category}
                  </span>
                  {/* Seats badge */}
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isFull ? 'bg-red-500 text-white' : spotsLeft <= 3 ? 'bg-amber-500 text-white' : 'bg-white/90 text-navy'
                  }`}>
                    {isFull ? 'Full' : `${spotsLeft} seats left`}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-navy group-hover:text-aqua transition-colors leading-snug mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted mb-1">by {course.instructor}</p>
                  <p className="text-xs text-charcoal/70 leading-relaxed line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <span>{new Date(course.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {new Date(course.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-cream text-[10px] text-muted rounded border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price + enroll */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <span className="text-xs text-muted">Price</span>
                      <p className="text-sm font-bold text-navy">{course.price} EGP</p>
                      <p className="text-[10px] text-muted">Deposit: {course.deposit} EGP ({Math.round(course.deposit/course.price*100)}%)</p>
                    </div>
                    {isEnrolled ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Enrolled
                      </span>
                    ) : isFull ? (
                      <span className="text-xs font-medium text-red-500">Waitlist</span>
                    ) : (
                      <button
                        onClick={() => setEnrolledCourse(course.id)}
                        className="px-3 py-1.5 bg-aqua text-white text-xs font-semibold rounded-lg hover:bg-aqua-dark transition-colors"
                      >
                        Enroll now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="text-sm">No courses in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
