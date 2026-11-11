'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listCourses, type CourseSummary } from '@/lib/platform-api'
import { TRAINING_TYPE_LABEL } from '@/lib/account-types'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

/**
 * Scene — Courses and practical training.
 *
 * The third core service gets an editorial introduction of its own rather
 * than a third card in the rental switcher. It reads as a programme
 * announcement: a statement, a real schedule of upcoming courses, and a way
 * in.
 *
 * The courses shown are the real published courses. When the platform has no
 * database the section says so instead of filling the space with invented
 * programmes.
 */
export default function CoursesShowcase() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const payload = await listCourses({ sort: 'date' })
        if (cancelled) return

        // The endpoint reports an unconfigured backend rather than failing,
        // so the section says so plainly.
        if (payload.backend === 'not_configured') {
          setState('unavailable')
          setMessage(payload.message ?? 'Courses need a configured database.')
          return
        }

        const list = payload.courses ?? []
        setCourses(list.slice(0, 4))
        setState(list.length === 0 ? 'empty' : 'ready')
      } catch (error) {
        if (cancelled) return
        setState('unavailable')
        setMessage(
          error instanceof Error
            ? error.message
            : 'Courses could not be loaded.',
        )
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Section id="courses" theme="dark" className="relative overflow-hidden">
      {/* A soft mineral wash so the dark section is not flat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 78% 12%, rgba(47,119,114,0.20) 0%, rgba(32,37,34,0) 58%)',
        }}
      />

      <div className="page section-y relative">
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-12 lg:col-span-6">
            <Eyebrow tone="dark">Courses and practical training</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
              Learn the science.
              <br />
              Practice the skill.
              <br />
              Build confidence.
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="text-[1.0625rem] leading-relaxed text-porcelain-100/70">
              Dental facilities do not only rent equipment — they teach. Find
              courses and supervised practical sessions offered by the people
              who do the work, and register for them in a few clicks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <ButtonLink href="/courses" variant="on-dark" size="lg" withArrow>
                Explore Courses
              </ButtonLink>
              <ButtonLink href="/facilities" variant="tertiary-on-dark">
                Or find a place to practise
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* The programme schedule */}
        <div className="mt-16 md:mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-sage-200/80">
              Upcoming courses
            </p>
            {state === 'ready' ? (
              <p className="tnum text-[0.8125rem] text-porcelain-100/45">
                {courses.length} listed
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            <Rule tone="dark" />
          </div>

          {state === 'loading' ? (
            <p
              role="status"
              aria-live="polite"
              className="py-10 text-[0.9375rem] text-porcelain-100/50"
            >
              Loading the course schedule…
            </p>
          ) : state === 'unavailable' ? (
            <div className="max-w-xl py-10">
              <p className="text-[0.9375rem] leading-relaxed text-porcelain-100/60">
                {message ||
                  'Courses need a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
              </p>
              <div className="mt-6">
                <ButtonLink href="/services/dental-chair" variant="tertiary-on-dark">
                  Reserve a dental chair meanwhile
                </ButtonLink>
              </div>
            </div>
          ) : state === 'empty' ? (
            <div className="max-w-xl py-10">
              <p className="text-[0.9375rem] leading-relaxed text-porcelain-100/60">
                No courses are published yet. Facilities publish programmes as
                their schedules are confirmed — you can still reserve a chair or
                a phantom-head station today.
              </p>
              <div className="mt-6">
                <ButtonLink href="/services/dental-chair" variant="tertiary-on-dark">
                  Reserve a dental chair
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul>
              {courses.map((course, index) => (
                <Reveal as="li" key={course.id} delay={index * 0.05}>
                  <ScheduleRow course={course} />
                </Reveal>
              ))}
            </ul>
          )}

          {state === 'ready' ? (
            <div className="mt-12">
              <ButtonLink href="/courses" variant="on-dark" withArrow>
                See every course
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

/**
 * A course in the schedule: a date, the programme, and where it happens.
 */
function ScheduleRow({ course }: { course: CourseSummary }) {
  const start = new Date(course.startDt)

  return (
    <article className="group grid-12 items-baseline gap-y-3 border-b border-white/10 py-6">
      <div className="col-span-12 sm:col-span-2">
        <p className="tnum font-display text-[1.125rem] font-semibold text-porcelain-50">
          {start.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })}
        </p>
        <p className="tnum mt-0.5 text-[0.75rem] uppercase tracking-[0.1em] text-porcelain-100/45">
          {start.toLocaleDateString('en-GB', { year: 'numeric' })}
        </p>
      </div>

      <div className="col-span-12 sm:col-span-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {course.subject ? (
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-sage-200/85">
              {course.subject}
            </span>
          ) : null}
          <span className="text-[0.75rem] uppercase tracking-[0.1em] text-porcelain-100/45">
            {TRAINING_TYPE_LABEL[course.trainingType]}
          </span>
        </div>

        <h3 className="mt-1.5 font-display text-[1.25rem] font-semibold leading-snug tracking-[-0.02em]">
          <Link
            href={`/courses/${course.slug}`}
            className="transition-colors hover:text-sage-200"
          >
            {course.title}
          </Link>
        </h3>

        <p className="mt-1 text-[0.8125rem] text-porcelain-100/50">
          {[
            course.instructor ? `with ${course.instructor}` : null,
            course.facility?.name ?? null,
            course.facility?.city ?? null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className="col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-3 sm:justify-end">
        <span className="tnum font-display text-[1.0625rem] font-semibold text-porcelain-50">
          {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
        </span>
        <span
          className={[
            'text-[0.75rem] font-semibold uppercase tracking-[0.08em]',
            course.registration.open ? 'text-sage-200/85' : 'text-porcelain-100/40',
          ].join(' ')}
        >
          {course.registration.open
            ? `${course.seatsRemaining} seat${course.seatsRemaining === 1 ? '' : 's'} left`
            : (course.registration.reason ?? 'Registration closed')}
        </span>
      </div>
    </article>
  )
}
