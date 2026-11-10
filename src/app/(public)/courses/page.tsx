'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

interface CourseSummary {
  id: string
  title: string
  description: string
  instructor: string | null
  syllabus: string | null
  startDt: string
  endDt: string
  capacity: number
  priceEgp: number
  depositEgp: number | null
  imageUrl: string | null
  facility: { id: string; name: string; slug: string; city: string } | null
}

type Status = 'loading' | 'ready' | 'empty' | 'unavailable'

/**
 * Courses.
 *
 * Courses are published by facilities and carry their own instructor, dates,
 * capacity and price. Nothing here is fabricated by the platform, and there
 * is no fake enrolment state — a course becomes enrolled only through the
 * booking engine.
 */
export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/courses')
      const payload = await response.json()
      if (!response.ok) {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Courses could not be loaded.')
        return
      }
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Courses are not available yet.')
        return
      }
      const list: CourseSummary[] = payload.courses ?? []
      setCourses(list)
      setStatus(list.length === 0 ? 'empty' : 'ready')
    } catch (error) {
      setStatus('unavailable')
      setMessage(
        error instanceof Error ? error.message : 'Courses could not be loaded.',
      )
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-44">
        <div className="page">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Education</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
                Courses and
                <br />
                workshops.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                Practical programmes published by the facilities that run them.
                Capacity is limited and confirmed by the facility.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── List ───────────────────────────────────────────────────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          {status === 'loading' ? (
            <p role="status" aria-live="polite" className="py-20 text-center text-[0.9375rem] text-slate-600">
              Loading courses…
            </p>
          ) : status === 'unavailable' ? (
            <div className="mx-auto max-w-xl py-14 text-center">
              <p className="font-display text-[1.5rem] font-semibold text-graphite-900">
                Courses are not connected yet
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                {message}
              </p>
              <div className="mt-7">
                <ButtonLink href="/facilities" variant="secondary">
                  Browse facilities instead
                </ButtonLink>
              </div>
            </div>
          ) : status === 'empty' ? (
            <div className="mx-auto max-w-xl py-14 text-center">
              <p className="font-display text-[1.5rem] font-semibold text-graphite-900">
                No courses are scheduled
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                Facilities publish their own programmes. Check back, or explore
                what you can book by the hour.
              </p>
              <div className="mt-7">
                <ButtonLink href="/services/dental-chair" variant="primary">
                  Explore rental services
                </ButtonLink>
              </div>
            </div>
          ) : (
            <>
              <Rule />
              <ul>
                {courses.map((course, index) => (
                  <li
                    key={course.id}
                    className="grid-12 items-center gap-y-5 border-b border-stone-300 py-8"
                  >
                    <div className="col-span-12 md:col-span-4 lg:col-span-3">
                      {course.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.imageUrl}
                          alt=""
                          loading="lazy"
                          className="aspect-[4/3] w-full rounded-[14px] object-cover"
                        />
                      ) : (
                        <div className="grid aspect-[4/3] w-full place-items-center rounded-[14px] bg-sage-100 text-[0.6875rem] uppercase tracking-[0.1em] text-slate-600">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-8 lg:col-span-6">
                      <h2 className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-graphite-900">
                        {course.title}
                      </h2>
                      <p className="mt-1.5 text-[0.8125rem] text-slate-600">
                        {[
                          course.instructor ? `with ${course.instructor}` : null,
                          course.facility?.name ?? null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {course.description ? (
                        <p className="mt-3 line-clamp-2 text-[0.9375rem] leading-relaxed text-graphite-700">
                          {course.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-[0.8125rem] text-slate-600">
                        {new Date(course.startDt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        —{' '}
                        {new Date(course.endDt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {course.capacity} places
                      </p>
                    </div>

                    <div className="col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 lg:col-span-3 lg:justify-end">
                      <span className="tnum text-[1.0625rem] font-semibold text-teal-700">
                        {course.priceEgp} EGP
                      </span>
                      {course.facility ? (
                        <Link
                          href={`/facilities/${course.facility.slug}`}
                          className="text-[0.9375rem] font-semibold text-graphite-900 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-teal-600"
                        >
                          View facility
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Section>
    </>
  )
}
