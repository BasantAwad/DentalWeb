'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  createCourse,
  listCourseEnrollments,
  listManagedCourses,
  listManagedFacilities,
  updateCourse,
  type CourseEnrollment,
  type ManagedCourse,
  type ManagedFacility,
} from '@/lib/platform-api'
import { TRAINING_TYPE_LABEL } from '@/lib/account-types'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import CourseForm from '@/components/manage/CourseForm'

type Status = 'loading' | 'ready' | 'signed-out' | 'forbidden' | 'unavailable'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  upcoming: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_TONE: Record<string, string> = {
  draft: 'border-stone-300 bg-stone-200/60 text-slate-600',
  upcoming: 'border-teal-600/30 bg-teal-100 text-teal-700',
  ongoing: 'border-warning/30 bg-warning/10 text-warning',
  completed: 'border-success/30 bg-success/10 text-success',
  cancelled: 'border-danger/30 bg-danger/10 text-danger',
}

/**
 * Course management for facility owners.
 *
 * Every action here writes to the platform: courses are created, edited,
 * published and archived against the facility the owner manages, and the
 * registrations come from the database.
 */
export default function CourseManager() {
  const [courses, setCourses] = useState<ManagedCourse[]>([])
  const [facilities, setFacilities] = useState<ManagedFacility[]>([])
  const [facilityFilter, setFacilityFilter] = useState('')
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment[]>>({})
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    try {
      const payload = await listManagedCourses()
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Course management needs a configured database.')
        return
      }
      setCourses(payload.courses ?? [])
      setStatus('ready')
    } catch (err) {
      const apiError = err as { code?: string; message?: string }
      if (apiError.code === 'authentication_required') {
        setStatus('signed-out')
        return
      }
      if (apiError.code === 'not_authorised') {
        setStatus('forbidden')
        setMessage(apiError.message ?? '')
        return
      }
      setStatus('unavailable')
      setMessage(apiError.message ?? 'Courses could not be loaded.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // The facilities this account may teach in, used to filter the list.
  useEffect(() => {
    let cancelled = false
    void listManagedFacilities()
      .then((payload) => {
        if (!cancelled) setFacilities(payload.facilities ?? [])
      })
      .catch(() => {
        if (!cancelled) setFacilities([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggleEnrollments = async (course: ManagedCourse) => {
    if (expanded === course.id) {
      setExpanded(null)
      return
    }
    setExpanded(course.id)
    try {
      const payload = await listCourseEnrollments(course.id)
      setEnrollments((current) => ({ ...current, [course.id]: payload.enrollments ?? [] }))
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'Registrations could not be loaded.',
      )
    }
  }

  const publish = async (course: ManagedCourse, publishNow: boolean) => {
    try {
      await updateCourse(course.id, { publish: publishNow })
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'The course could not be saved.')
    }
  }

  const setStatus_ = async (course: ManagedCourse, next: string) => {
    try {
      await updateCourse(course.id, { status: next })
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'The course could not be saved.')
    }
  }

  const totals = useMemo(
    () => ({
      published: courses.filter((course) => course.status === 'upcoming').length,
      drafts: courses.filter((course) => course.status === 'draft').length,
      enrolled: courses.reduce((sum, course) => sum + course.seatsTaken, 0),
    }),
    [courses],
  )

  const visibleCourses = facilityFilter
    ? courses.filter((course) => course.clinicId === facilityFilter)
    : courses

  if (status === 'loading') {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
            Loading your courses…
          </p>
        </div>
      </Section>
    )
  }

  if (status === 'signed-out') {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              Sign in to manage your courses
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              Course management is limited to the facilities you own or manage.
            </p>
            <div className="mt-7">
              <ButtonLink href="/auth/login" variant="primary">
                Sign in
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  if (status === 'forbidden') {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              No facility to manage
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message ||
                'Your account is not a member of any facility. Ask the owner to add you.'}
            </p>
          </div>
        </div>
      </Section>
    )
  }

  if (status === 'unavailable') {
    return (
      <Section theme="porcelain" className="pt-32">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              Course management is not available
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message ||
                'Course management needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
            </p>
            <div className="mt-7">
              <ButtonLink href="/manage" variant="primary">
                Back to the workspace
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <>
      <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-36">
        <div className="page">
          <div className="grid-12 items-end gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>Facility workspace</Eyebrow>
              <h1 className="mt-5 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-graphite-900">
                Courses
              </h1>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-graphite-700">
                Publish the programmes your facility teaches. Set the schedule,
                the capacity and the price — students register against them
                directly.
              </p>
            </div>
            <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
              <ButtonLink href="/manage" variant="secondary" size="lg">
                Back to workspace
              </ButtonLink>
              <button
                type="button"
                onClick={() => setCreating((open) => !open)}
                className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
              >
                {creating ? 'Close the form' : 'Create a course'}
              </button>
            </div>
          </div>

          {/* Totals */}
          <dl className="mt-12 grid grid-cols-3 gap-x-8 gap-y-6 border-y border-stone-300 py-6">
            {[
              { term: 'Published', value: totals.published },
              { term: 'Drafts', value: totals.drafts },
              { term: 'Students enrolled', value: totals.enrolled },
            ].map((metric) => (
              <div key={metric.term}>
                <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                  {metric.term}
                </dt>
                <dd className="tnum mt-1.5 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* Creation form */}
      {creating ? (
        <Section theme="chalk" className="relative overflow-hidden">
          <div className="page py-14">
            <CourseForm onCreated={load} />
          </div>
        </Section>
      ) : null}

      {/* The course list */}
      <Section theme="chalk" className="relative overflow-hidden">
        <div className="page pb-16">
          {message ? (
            <p
              role="alert"
              className="mb-6 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] text-danger"
            >
              {message}
            </p>
          ) : null}

          {/* Facility filter */}
          {facilities.length > 1 ? (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <label
                htmlFor="course-facility-filter"
                className="text-[0.8125rem] font-semibold text-graphite-900"
              >
                Facility
              </label>
              <select
                id="course-facility-filter"
                value={facilityFilter}
                onChange={(event) => setFacilityFilter(event.target.value)}
                className="h-10 rounded-[10px] border border-stone-300 bg-white px-3 text-[0.875rem] text-graphite-700 focus:border-teal-600 focus:outline-none"
              >
                <option value="">All facilities</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {visibleCourses.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-stone-300 bg-porcelain-100/60 px-6 py-12 text-center">
              <p className="font-display text-[1.25rem] font-semibold text-graphite-900">
                No courses yet
              </p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-slate-600">
                Create a course to publish a programme, or open an existing
                draft to finish it.
              </p>
              <div className="mt-7">
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="inline-flex h-12 items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
                >
                  Create a course
                </button>
              </div>
            </div>
          ) : (
            <ul>
              {visibleCourses.map((course) => (
                <li key={course.id} className="border-b border-stone-300 py-8">
                  <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span
                          className={[
                            'rounded-full border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
                            STATUS_TONE[course.status] ?? STATUS_TONE.draft,
                          ].join(' ')}
                        >
                          {STATUS_LABEL[course.status] ?? course.status}
                        </span>
                        <span className="text-[0.75rem] uppercase tracking-[0.1em] text-slate-600">
                          {TRAINING_TYPE_LABEL[course.trainingType]}
                        </span>
                      </div>

                      <h2 className="mt-2.5 font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900">
                        {course.slug ? (
                          <Link
                            href={`/courses/${course.slug}`}
                            className="transition-colors hover:text-teal-700"
                          >
                            {course.title}
                          </Link>
                        ) : (
                          course.title
                        )}
                      </h2>

                      <p className="mt-1 text-[0.8125rem] text-slate-600">
                        {[
                          course.facilityName,
                          course.instructor
                            ? `with ${course.instructor}`
                            : null,
                          `${course.sessionCount} session${course.sessionCount === 1 ? '' : 's'}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>

                      <p className="tnum mt-2 text-[0.875rem] text-graphite-900">
                        {new Date(course.startDt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
                        {' · '}
                        {course.seatsTaken}/{course.capacity} enrolled
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleEnrollments(course)}
                        className="inline-flex min-h-10 items-center rounded-[10px] border border-stone-300 bg-white px-4 text-[0.8125rem] font-medium text-graphite-700 transition-colors duration-200 hover:border-teal-600/50"
                      >
                        {expanded === course.id ? 'Hide students' : 'View students'}
                      </button>
                      {course.status === 'draft' ? (
                        <button
                          type="button"
                          onClick={() => publish(course, true)}
                          className="inline-flex min-h-10 items-center rounded-[10px] bg-teal-700 px-4 text-[0.8125rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
                        >
                          Publish
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => publish(course, false)}
                            className="inline-flex min-h-10 items-center rounded-[10px] border border-stone-300 bg-white px-4 text-[0.8125rem] font-medium text-graphite-700 transition-colors duration-200 hover:border-stone-300 hover:bg-porcelain-100"
                          >
                            Unpublish
                          </button>
                          {course.status === 'upcoming' ? (
                            <button
                              type="button"
                              onClick={() => setStatus_(course, 'completed')}
                              className="inline-flex min-h-10 items-center rounded-[10px] border border-stone-300 bg-white px-4 text-[0.8125rem] font-medium text-graphite-700 transition-colors duration-200 hover:border-teal-600/50"
                            >
                              Mark completed
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Registrations */}
                  {expanded === course.id ? (
                    <div className="mt-6 rounded-[14px] border border-stone-300 bg-porcelain-100 p-5">
                      {enrollments[course.id] === undefined ? (
                        <p className="text-[0.875rem] text-slate-600">
                          Loading registrations…
                        </p>
                      ) : enrollments[course.id].length === 0 ? (
                        <p className="text-[0.875rem] text-slate-600">
                          No students have registered yet.
                        </p>
                      ) : (
                        <table className="w-full text-left text-[0.8125rem]">
                          <thead>
                            <tr className="border-b border-stone-300 text-[0.6875rem] uppercase tracking-[0.1em] text-slate-600">
                              <th scope="col" className="pb-2 font-semibold">
                                Student
                              </th>
                              <th scope="col" className="pb-2 font-semibold">
                                Academic
                              </th>
                              <th scope="col" className="pb-2 font-semibold">
                                Registered
                              </th>
                              <th scope="col" className="pb-2 font-semibold">
                                Payment
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {enrollments[course.id].map((enrolment) => (
                              <tr key={enrolment.id} className="border-b border-stone-200 last:border-b-0">
                                <td className="py-3 pr-4 align-top">
                                  <span className="block font-medium text-graphite-900">
                                    {enrolment.studentName}
                                  </span>
                                  {enrolment.studentEmail ? (
                                    <span className="block text-[0.75rem] text-slate-600">
                                      {enrolment.studentEmail}
                                    </span>
                                  ) : null}
                                  {enrolment.studentPhone ? (
                                    <span className="block text-[0.75rem] text-slate-600">
                                      {enrolment.studentPhone}
                                    </span>
                                  ) : null}
                                </td>
                                <td className="py-3 pr-4 align-top text-graphite-700">
                                  {enrolment.university ?? '—'}
                                  {enrolment.academicLevel ? (
                                    <span className="block text-[0.75rem] text-slate-600">
                                      {enrolment.academicLevel.replace(/_/g, ' ')}
                                    </span>
                                  ) : null}
                                </td>
                                <td className="tnum py-3 pr-4 align-top text-graphite-700">
                                  {new Date(enrolment.registeredAt).toLocaleDateString(
                                    'en-GB',
                                    { day: 'numeric', month: 'short', year: 'numeric' },
                                  )}
                                </td>
                                <td className="py-3 align-top">
                                  <span className="font-medium text-graphite-900">
                                    {enrolment.paymentStatus === 'not_required'
                                      ? 'Not required'
                                      : enrolment.paymentStatus === 'paid'
                                        ? `Paid · ${enrolment.paymentAmount} EGP`
                                        : `Pending · ${enrolment.paymentAmount} EGP`}
                                  </span>
                                  <span className="block text-[0.75rem] text-slate-600">
                                    {enrolment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  )
}
