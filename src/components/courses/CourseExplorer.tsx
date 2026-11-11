'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  listCourses,
  type CourseFacets,
  type CourseSummary,
} from '@/lib/platform-api'
import { TRAINING_TYPE_LABEL } from '@/lib/account-types'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const ACADEMIC_LEVEL_LABEL: Record<string, string> = {
  first_year: 'First year',
  second_year: 'Second year',
  third_year: 'Third year',
  fourth_year: 'Fourth year',
  fifth_year: 'Fifth year',
  postgraduate: 'Postgraduate',
  resident: 'Resident',
  other: 'Other',
}

const SORTS = [
  { key: 'date', label: 'Soonest first' },
  { key: 'price', label: 'Price, low to high' },
  { key: 'price-desc', label: 'Price, high to low' },
] as const

type Status = 'loading' | 'ready' | 'empty' | 'unavailable'

/**
 * Course discovery.
 *
 * An editorial browsing experience: a strong introduction, a featured course,
 * then a filtered list. The filters and the URL stay in step so a search can
 * be shared.
 */
export default function CourseExplorer() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [facets, setFacets] = useState<CourseFacets>({
    subjects: [],
    levels: [],
    types: [],
    cities: [],
    facilities: [],
  })
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [type, setType] = useState('')
  const [city, setCity] = useState('')
  const [facility, setFacility] = useState('')
  const [registration, setRegistration] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<(typeof SORTS)[number]['key']>('date')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const payload = await listCourses({
        q: query.trim() || undefined,
        subject: subject || undefined,
        level: level || undefined,
        type: type || undefined,
        city: city || undefined,
        clinicId: facility || undefined,
        registration: (registration || undefined) as
          | 'open'
          | 'full'
          | 'closed'
          | undefined,
        from: from || undefined,
        to: to || undefined,
        sort,
      })
      setCourses(payload.courses ?? [])
      setFacets(
        payload.facets ?? {
          subjects: [],
          levels: [],
          types: [],
          cities: [],
          facilities: [],
        },
      )
      // The endpoint reports an unconfigured backend rather than failing, so
      // the page says so plainly instead of claiming there are no courses.
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Courses need a configured database.')
        return
      }
      setStatus((payload.courses ?? []).length === 0 ? 'empty' : 'ready')
    } catch (error) {
      setStatus('unavailable')
      setMessage(
        error instanceof Error ? error.message : 'Courses could not be loaded.',
      )
    }
  }, [query, subject, level, type, city, facility, registration, from, to, sort])

  useEffect(() => {
    void load()
  }, [load])

  // Keep the filters shareable.
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (subject) params.set('subject', subject)
    if (level) params.set('level', level)
    if (type) params.set('type', type)
    if (city) params.set('city', city)
    if (facility) params.set('clinicId', facility)
    if (registration) params.set('registration', registration)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (sort !== 'date') params.set('sort', sort)
    const next = params.toString()
    window.history.replaceState(
      null,
      '',
      next ? `/courses?${next}` : '/courses',
    )
  }, [
    query,
    subject,
    level,
    type,
    city,
    facility,
    registration,
    from,
    to,
    sort,
  ])

  const featured = courses[0]
  const rest = courses.slice(1)

  const activeFilters = [
    subject,
    level,
    type,
    city,
    facility,
    registration,
    from,
    to,
  ].filter(Boolean).length

  const clearFilters = () => {
    setSubject('')
    setLevel('')
    setType('')
    setCity('')
    setFacility('')
    setRegistration('')
    setFrom('')
    setTo('')
  }

  return (
    <>
      {/* ── Introduction ─────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 24% 8%, rgba(47,119,114,0.22) 0%, rgba(32,37,34,0) 62%)',
          }}
        />

        <div className="page relative">
          <div className="grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow tone="dark">Courses and practical training</Eyebrow>
              <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
                Learn the science.
                <br />
                Practice the skill.
                <br />
                Build confidence.
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="text-[1.0625rem] leading-relaxed text-porcelain-100/70">
                Dental facilities teach what they practise. Find the courses and
                supervised practical sessions running near you, from the people
                who do the work.
              </p>
              <div className="mt-7">
                <ButtonLink href="/services/phantom-head" variant="on-dark" withArrow>
                  Need equipment instead?
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-10 md:py-12">
          <div className="grid-12 gap-y-5">
            {/* Search */}
            <div className="col-span-12 lg:col-span-5">
              <label htmlFor="course-search" className="sr-only">
                Search courses
              </label>
              <div className="relative">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  id="course-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, topic or instructor"
                  className="h-12 w-full rounded-[10px] border border-stone-300 bg-white pl-11 pr-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30"
                />
              </div>
            </div>

            {/* Filter controls */}
            <div className="col-span-12 flex flex-wrap items-center gap-2 lg:col-span-7 lg:justify-end">
              {facets.subjects.length > 0 ? (
                <FilterSelect
                  label="Subject"
                  value={subject}
                  onChange={setSubject}
                  options={facets.subjects}
                />
              ) : null}
              {facets.levels.length > 0 ? (
                <FilterSelect
                  label="Level"
                  value={level}
                  onChange={setLevel}
                  options={facets.levels}
                  labelFor={(v) => ACADEMIC_LEVEL_LABEL[v] ?? v}
                />
              ) : null}
              {facets.types.length > 0 ? (
                <FilterSelect
                  label="Format"
                  value={type}
                  onChange={setType}
                  options={facets.types}
                  labelFor={(v) => TRAINING_TYPE_LABEL[v] ?? v}
                />
              ) : null}
              {facets.cities.length > 0 ? (
                <FilterSelect
                  label="Location"
                  value={city}
                  onChange={setCity}
                  options={facets.cities}
                />
              ) : null}
              {facets.facilities.length > 0 ? (
                <>
                  <label htmlFor="filter-facility" className="sr-only">
                    Filter by facility
                  </label>
                  <select
                    id="filter-facility"
                    value={facility}
                    onChange={(event) => setFacility(event.target.value)}
                    className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
                  >
                    <option value="">Facility</option>
                    {facets.facilities.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
              {facets.facilities.length > 0 ? (
                <>
                  <label htmlFor="filter-registration" className="sr-only">
                    Filter by registration status
                  </label>
                  <select
                    id="filter-registration"
                    value={registration}
                    onChange={(event) => setRegistration(event.target.value)}
                    className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
                  >
                    <option value="">Registration</option>
                    <option value="open">Open</option>
                    <option value="full">Full</option>
                    <option value="closed">Closed</option>
                  </select>
                </>
              ) : null}

              {/* Upcoming dates */}
              <div className="flex items-center gap-1.5">
                <label htmlFor="course-from" className="sr-only">
                  Courses starting on or after
                </label>
                <input
                  id="course-from"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-10 rounded-[10px] border border-stone-300 bg-white px-2.5 text-[0.8125rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
                />
                <span aria-hidden="true" className="text-slate-400">
                  –
                </span>
                <label htmlFor="course-to" className="sr-only">
                  Courses starting on or before
                </label>
                <input
                  id="course-to"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-10 rounded-[10px] border border-stone-300 bg-white px-2.5 text-[0.8125rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <label htmlFor="course-sort" className="sr-only">
                Sort courses
              </label>
              <select
                id="course-sort"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as (typeof SORTS)[number]['key'])
                }
                className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>

              {activeFilters > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-10 items-center text-[0.8125rem] font-medium text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
                >
                  Clear {activeFilters} filter{activeFilters === 1 ? '' : 's'}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page py-14 md:py-20">
          {status === 'loading' ? (
            <p
              role="status"
              aria-live="polite"
              className="py-20 text-center text-[0.9375rem] text-slate-600"
            >
              Loading courses…
            </p>
          ) : status === 'unavailable' ? (
            <div className="mx-auto max-w-xl py-14 text-center">
              <p className="font-display text-[1.5rem] font-semibold text-graphite-900">
                Courses are not connected yet
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                {message ||
                  'Courses need a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
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
                {activeFilters > 0 || query.trim()
                  ? 'No courses match that search'
                  : 'No courses are published yet'}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
                {activeFilters > 0 || query.trim()
                  ? 'Try a different subject, level or format.'
                  : 'Facilities publish programmes as their schedules are confirmed. You can still reserve a chair or a phantom-head station today.'}
              </p>
              {activeFilters > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
                >
                  Clear the filters
                </button>
              ) : (
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/facilities" variant="primary" size="md">
                    Explore facilities
                  </ButtonLink>
                  <ButtonLink href="/services/phantom-head" variant="secondary" size="md">
                    Phantom-head training
                  </ButtonLink>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Featured course */}
              {featured ? (
                <Reveal>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-teal-700">
                    Featured
                  </p>
                  <FeaturedCourse course={featured} />
                </Reveal>
              ) : null}

              {/* The rest */}
              {rest.length > 0 ? (
                <div className="mt-16">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]">
                      All upcoming courses
                    </h2>
                    <p className="tnum text-[0.8125rem] text-slate-600">
                      {courses.length} course{courses.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="mt-6">
                    <Rule />
                  </div>

                  <ul>
                    {rest.map((course, index) => (
                      <Reveal as="li" key={course.id} delay={index * 0.04}>
                        <CourseRow course={course} />
                      </Reveal>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>
    </>
  )
}

/**
 * The featured course gets a wide, image-led composition.
 */
function FeaturedCourse({ course }: { course: CourseSummary }) {
  return (
    <article className="group mt-5 grid-12 overflow-hidden rounded-[22px] border border-stone-300 bg-porcelain-100 lg:min-h-[26rem]">
      <div className="col-span-12 lg:col-span-6">
        {course.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.imageUrl}
            alt=""
            className="h-full min-h-[16rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full min-h-[16rem] w-full items-center justify-center bg-sage-100"
            style={{
              backgroundImage:
                'radial-gradient(120% 90% at 30% 20%, rgba(255,255,255,0.9) 0%, rgba(200,217,207,0.7) 60%, rgba(47,119,114,0.35) 100%)',
            }}
          />
        )}
      </div>

      <div className="col-span-12 flex flex-col justify-center p-7 lg:col-span-6 lg:p-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {course.subject ? (
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-teal-700">
              {course.subject}
            </span>
          ) : null}
          <span className="text-[0.75rem] uppercase tracking-[0.12em] text-slate-600">
            {TRAINING_TYPE_LABEL[course.trainingType]}
          </span>
        </div>

        <h3 className="mt-4 font-display text-[clamp(1.625rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          <Link href={`/courses/${course.slug}`} className="transition-colors hover:text-teal-700">
            {course.title}
          </Link>
        </h3>

        {course.description ? (
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-700">
            {course.description}
          </p>
        ) : null}

        <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-stone-300 pt-6 sm:grid-cols-4">
          {[
            { term: 'Starts', value: formatCourseDate(course.startDt) },
            { term: 'Instructor', value: course.instructor ?? 'To be announced' },
            { term: 'Facility', value: course.facility?.name ?? '—' },
            { term: 'Seats', value: `${course.seatsRemaining} left` },
          ].map((item) => (
            <div key={item.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-slate-600">
                {item.term}
              </dt>
              <dd className="mt-1 text-[0.9375rem] font-medium text-graphite-900">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <span className="tnum font-display text-[1.5rem] font-semibold text-graphite-900">
            {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
          </span>
          <ButtonLink href={`/courses/${course.slug}`} variant="primary" withArrow>
            View course
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}

/**
 * A course in the list: an editorial row rather than a card.
 */
function CourseRow({ course }: { course: CourseSummary }) {
  return (
    <article className="group grid-12 items-start gap-y-4 border-b border-stone-300 py-8">
      <div className="col-span-12 sm:col-span-2 lg:col-span-2">
        <p className="tnum font-display text-[1.125rem] font-semibold text-graphite-900">
          {formatCourseDate(course.startDt)}
        </p>
        <p className="mt-1 text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
          {formatCourseTime(course.startDt)}
        </p>
      </div>

      <div className="col-span-12 sm:col-span-6 lg:col-span-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {course.subject ? (
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-teal-700">
              {course.subject}
            </span>
          ) : null}
          <span className="text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
            {TRAINING_TYPE_LABEL[course.trainingType]}
          </span>
          {course.sessionCount > 0 ? (
            <span className="text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
              {course.sessionCount} session{course.sessionCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 font-display text-[1.25rem] font-semibold leading-snug tracking-[-0.02em]">
          <Link href={`/courses/${course.slug}`} className="transition-colors hover:text-teal-700">
            {course.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-[0.8125rem] text-slate-600">
          {[
            course.instructor ? `with ${course.instructor}` : null,
            course.facility?.name ?? null,
            course.facility?.city ?? null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      <div className="col-span-12 flex flex-wrap items-center gap-x-8 gap-y-3 sm:col-span-4 lg:col-span-3 lg:col-start-10 lg:flex-col lg:items-end lg:gap-2">
        <span className="tnum font-display text-[1.125rem] font-semibold text-graphite-900">
          {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
        </span>
        <span
          className={[
            'text-[0.75rem] font-semibold uppercase tracking-[0.08em]',
            course.registration.open ? 'text-teal-700' : 'text-slate-600',
          ].join(' ')}
        >
          {course.registration.open
            ? `${course.seatsRemaining} seat${course.seatsRemaining === 1 ? '' : 's'} left`
            : (course.registration.reason ?? 'Registration closed')}
        </span>
        <Link
          href={`/courses/${course.slug}`}
          className="text-[0.875rem] font-semibold text-graphite-900 underline decoration-stone-300 underline-offset-[6px] transition-colors hover:decoration-teal-600"
        >
          View course
        </Link>
      </div>
    </article>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labelFor,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  labelFor?: (value: string) => string
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Filter by {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labelFor ? labelFor(option) : option}
          </option>
        ))}
      </select>
    </>
  )
}

export function formatCourseDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCourseTime(value: string): string {
  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
