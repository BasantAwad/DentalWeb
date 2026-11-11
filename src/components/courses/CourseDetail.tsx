'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  enrollInCourse,
  getCourse,
  type CourseDetailResponse,
} from '@/lib/platform-api'
import {
  ACADEMIC_LEVEL_LABEL,
  PROFESSIONAL_STATUS_LABEL,
  TRAINING_TYPE_LABEL,
} from '@/lib/account-types'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { formatCourseDate, formatCourseTime } from '@/components/courses/CourseExplorer'

type Status = 'loading' | 'ready' | 'not-found' | 'unavailable'

/**
 * A single course.
 *
 * The page is composed as one continuous editorial document — identity,
 * content, schedule and registration — rather than a wall of cards.
 */
export default function CourseDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<CourseDetailResponse | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registered, setRegistered] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const payload = await getCourse(slug)
      setData(payload)
      if (payload.backend === 'not_configured') {
        setStatus('unavailable')
        setMessage(payload.message ?? 'Courses are not available yet.')
        return
      }
      if (!payload.course) {
        setStatus('not-found')
        return
      }
      setStatus('ready')
    } catch (error) {
      setStatus('unavailable')
      setMessage(
        error instanceof Error ? error.message : 'The course could not be loaded.',
      )
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const register = async () => {
    setRegistering(true)
    setRegisterError('')
    try {
      await enrollInCourse(slug)
      setRegistered(true)
      // Refresh so the seat count and enrolment state are accurate.
      await load()
    } catch (error) {
      setRegisterError(
        error instanceof Error
          ? error.message
          : 'Registration could not be completed.',
      )
    } finally {
      setRegistering(false)
    }
  }

  if (status === 'loading') {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
            Loading course
          </h1>
          <p role="status" aria-live="polite" className="mt-3 text-[0.9375rem] text-slate-600">
            Fetching the course details and schedule.
          </p>
        </div>
      </Section>
    )
  }

  if (status !== 'ready' || !data?.course) {
    return (
      <Section theme="porcelain" className="pt-40">
        <div className="page">
          <div className="mx-auto max-w-xl py-12 text-center">
            <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] text-graphite-900">
              {status === 'not-found' ? 'Course not found' : 'This course is unavailable'}
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-600">
              {message ||
                'That course does not exist, or it is no longer published. Browse the courses that are running.'}
            </p>
            <div className="mt-7">
              <ButtonLink href="/courses" variant="primary">
                Explore all courses
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    )
  }

  const course = data.course
  const enrolment = data.enrolment ?? null
  const sessions = data.sessions ?? []
  const isRegistered = Boolean(enrolment) || registered
  const seatsRemaining = course.seatsRemaining

  return (
    <>
      {/* ── Identity ────────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden pt-28 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(100% 80% at 74% 10%, rgba(47,119,114,0.22) 0%, rgba(32,37,34,0) 60%)',
          }}
        />

        <div className="page relative">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[0.8125rem] text-porcelain-100/50"
          >
            <Link href="/courses" className="transition-colors hover:text-porcelain-100">
              Courses
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-porcelain-100/85">{course.title}</span>
          </nav>

          <div className="mt-7 grid-12 items-end gap-y-10">
            <div className="col-span-12 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {course.subject ? (
                  <span className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-sage-200">
                    {course.subject}
                  </span>
                ) : null}
                <span className="text-[0.75rem] uppercase tracking-[0.14em] text-porcelain-100/50">
                  {TRAINING_TYPE_LABEL[course.trainingType]}
                </span>
                {course.academicLevel ? (
                  <span className="text-[0.75rem] uppercase tracking-[0.14em] text-porcelain-100/50">
                    {ACADEMIC_LEVEL_LABEL[course.academicLevel] ?? course.academicLevel}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.035em]">
                {course.title}
              </h1>

              {course.description ? (
                <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-porcelain-100/70">
                  {course.description}
                </p>
              ) : null}
            </div>

            {/* Instructor + facility */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <dl className="space-y-5 border-l border-white/12 pl-6">
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-porcelain-100/45">
                    Instructor
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] font-medium text-porcelain-50">
                    {course.instructor?.name ?? 'To be announced'}
                  </dd>
                  {course.instructor?.qualifications ? (
                    <dd className="mt-1 text-[0.8125rem] leading-relaxed text-porcelain-100/55">
                      {course.instructor.qualifications}
                    </dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-porcelain-100/45">
                    Organised by
                  </dt>
                  <dd className="mt-1.5 text-[0.9375rem] font-medium text-porcelain-50">
                    {course.facility ? (
                      <Link
                        href={`/facilities/${course.facility.slug}`}
                        className="transition-colors hover:text-sage-200"
                      >
                        {course.facility.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </dd>
                  {course.facility?.city ? (
                    <dd className="mt-1 text-[0.8125rem] text-porcelain-100/55">
                      {course.facility.city}
                    </dd>
                  ) : null}
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <Section theme="porcelain" className="relative overflow-hidden">
        <div className="page py-16 md:py-24">
          <div className="grid-12 gap-y-14">
            {/* Learning content */}
            <div className="col-span-12 lg:col-span-7">
              {course.learningObjectives.length > 0 ? (
                <section aria-labelledby="objectives-heading">
                  <Eyebrow>Learning content</Eyebrow>
                  <h2
                    id="objectives-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    What you will be able to do
                  </h2>
                  <ul className="mt-7 space-y-3">
                    {course.learningObjectives.map((objective) => (
                      <li
                        key={objective}
                        className="flex items-start gap-3 border-t border-stone-300 pt-3 text-[0.9375rem] leading-relaxed text-graphite-700"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-teal-600"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {course.topics.length > 0 ? (
                <section aria-labelledby="topics-heading" className="mt-14">
                  <Eyebrow>Topics</Eyebrow>
                  <h2
                    id="topics-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    What the course covers
                  </h2>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {course.topics.map((topic) => (
                      <li
                        key={topic}
                        className="rounded-[8px] border border-stone-300 bg-chalk px-3 py-1.5 text-[0.8125rem] font-medium text-graphite-700"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Theory and practice */}
              {course.theoreticalComponents || course.practicalComponents ? (
                <section aria-labelledby="components-heading" className="mt-14">
                  <Eyebrow>How it is taught</Eyebrow>
                  <h2
                    id="components-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    Theory and practice
                  </h2>

                  <div className="mt-7 grid gap-8 sm:grid-cols-2">
                    {course.theoreticalComponents ? (
                      <div className="border-t border-stone-300 pt-5">
                        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-teal-700">
                          Theoretical
                        </p>
                        <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-700">
                          {course.theoreticalComponents}
                        </p>
                      </div>
                    ) : null}
                    {course.practicalComponents ? (
                      <div className="border-t border-stone-300 pt-5">
                        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-teal-700">
                          Practical
                        </p>
                        <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-700">
                          {course.practicalComponents}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {course.includesSupervisedPractice ? (
                    <p className="mt-7 flex items-start gap-3 rounded-[12px] border border-teal-600/25 bg-teal-100 px-4 py-3.5 text-[0.9375rem] leading-relaxed text-graphite-900">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-teal-700"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      This course includes supervised hands-on practice.
                    </p>
                  ) : null}

                  {course.materialsRequired ? (
                    <div className="mt-7 border-t border-stone-300 pt-5">
                      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        What to bring
                      </p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-700">
                        {course.materialsRequired}
                      </p>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {course.syllabus ? (
                <section aria-labelledby="syllabus-heading" className="mt-14">
                  <Eyebrow>Syllabus</Eyebrow>
                  <h2
                    id="syllabus-heading"
                    className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tracking-[-0.025em]"
                  >
                    Course outline
                  </h2>
                  <p className="mt-5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-graphite-700">
                    {course.syllabus}
                  </p>
                </section>
              ) : null}
            </div>

            {/* Registration + schedule */}
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                {/* Price and registration */}
                <div className="rounded-[18px] border border-stone-300 bg-chalk p-6">
                  <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                    Registration
                  </p>

                  <p className="tnum mt-3 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em] text-graphite-900">
                    {course.priceEgp === 0 ? 'Free' : `${course.priceEgp} EGP`}
                    {course.paymentPolicy === 'deposit' && course.priceEgp > 0 ? (
                      <span className="ml-2 text-[0.875rem] font-normal text-slate-600">
                        {course.depositPct ?? 50}% deposit to register
                      </span>
                    ) : null}
                  </p>

                  <div className="mt-5">
                    <Rule />
                  </div>

                  <dl className="mt-5 space-y-2.5 text-[0.875rem]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Seats left</dt>
                      <dd className="tnum font-semibold text-graphite-900">
                        {seatsRemaining} of {course.capacity}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-600">Starts</dt>
                      <dd className="tnum font-medium text-graphite-900">
                        {formatCourseDate(course.startDt)}
                      </dd>
                    </div>
                    {course.registrationCloseAt ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-600">Register by</dt>
                        <dd className="tnum font-medium text-graphite-900">
                          {formatCourseDate(course.registrationCloseAt)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-6">
                    {isRegistered ? (
                      <div className="rounded-[12px] border border-success/30 bg-success/10 px-4 py-3.5">
                        <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-success">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          You are registered
                        </p>
                        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-graphite-700">
                          {enrolment?.paymentStatus === 'pending'
                            ? 'Your deposit is pending. Complete the payment to secure your place.'
                            : 'Your place is confirmed. The facility will share the session details.'}
                        </p>
                      </div>
                    ) : course.registration.open ? (
                      <button
                        type="button"
                        onClick={register}
                        disabled={registering}
                        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-teal-700 px-5 text-[0.9375rem] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {registering ? 'Registering…' : 'Register for this course'}
                      </button>
                    ) : (
                      <p className="rounded-[12px] border border-stone-300 bg-porcelain-100 px-4 py-3.5 text-[0.875rem] leading-relaxed text-slate-600">
                        {course.registration.reason ?? 'Registration is not open.'}
                      </p>
                    )}
                  </div>

                  {registerError ? (
                    <p
                      role="alert"
                      className="mt-4 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] leading-relaxed text-danger"
                    >
                      {registerError}
                    </p>
                  ) : null}

                  <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-600">
                    You will be asked to sign in before your place is reserved.
                    Seats are confirmed by the platform, not by this page.
                  </p>
                </div>

                {/* Schedule */}
                {sessions.length > 0 ? (
                  <div className="mt-6 rounded-[18px] border border-stone-300 bg-chalk p-6">
                    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                      Schedule
                    </p>
                    <ol className="mt-5 space-y-5">
                      {sessions.map((session) => (
                        <li key={session.id} className="border-t border-stone-300 pt-4">
                          <p className="text-[0.875rem] font-semibold text-graphite-900">
                            {session.title}
                          </p>
                          <p className="tnum mt-1 text-[0.8125rem] text-slate-600">
                            {formatCourseDate(session.startDatetime)} ·{' '}
                            {formatCourseTime(session.startDatetime)}
                            {session.endDatetime
                              ? ` – ${formatCourseTime(session.endDatetime)}`
                              : ''}
                          </p>
                          {session.location ? (
                            <p className="mt-1 text-[0.8125rem] text-slate-600">
                              {session.location}
                            </p>
                          ) : null}
                          {session.description ? (
                            <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite-700">
                              {session.description}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[18px] border border-stone-300 bg-chalk p-6">
                    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-slate-600">
                      Schedule
                    </p>
                    <p className="tnum mt-4 text-[0.9375rem] font-medium text-graphite-900">
                      {formatCourseDate(course.startDt)} –{' '}
                      {formatCourseDate(course.endDt)}
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-slate-600">
                      The facility has not published individual sessions for this
                      course yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Instructor ──────────────────────────────────────────────── */}
      {course.instructor?.bio ? (
        <Section theme="chalk" className="relative overflow-hidden">
          <div className="page py-16 md:py-20">
            <div className="grid-12 gap-y-8">
              <div className="col-span-12 lg:col-span-3">
                <Eyebrow>Instructor</Eyebrow>
                <p className="mt-5 font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
                  {course.instructor.name}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-7 lg:col-start-6">
                <p className="text-[1.0625rem] leading-relaxed text-graphite-700">
                  {course.instructor.bio}
                </p>
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ── Closing ────────────────────────────────────────────────── */}
      <Section theme="dark" className="relative overflow-hidden">
        <div className="page py-16 md:py-20">
          <div className="grid-12 items-center gap-y-8">
            <div className="col-span-12 lg:col-span-7">
              <h2 className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                Practice the skills this course teaches.
              </h2>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-porcelain-100/65">
                Book a dental chair or a phantom-head station for the hours you
                need, at facilities that publish their equipment.
              </p>
            </div>
            <div className="col-span-12 flex flex-wrap gap-3 lg:col-span-4 lg:col-start-9 lg:justify-end">
              <ButtonLink href="/services/dental-chair" variant="on-dark" withArrow>
                Dental chair rental
              </ButtonLink>
              <ButtonLink href="/services/phantom-head" variant="tertiary-on-dark">
                Phantom-head training
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
