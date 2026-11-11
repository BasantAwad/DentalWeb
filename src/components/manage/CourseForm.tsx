'use client'

import { useEffect, useState } from 'react'
import {
  createCourse,
  listManagedFacilities,
  type CourseDraft,
  type ManagedFacility,
} from '@/lib/platform-api'
import { ACADEMIC_LEVEL_LABEL } from '@/lib/account-types'

const LEVELS = [
  'first_year',
  'second_year',
  'third_year',
  'fourth_year',
  'fifth_year',
  'postgraduate',
  'resident',
  'other',
]

const INPUT =
  'h-12 w-full rounded-[10px] border border-stone-300 bg-white px-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30'

/**
 * The course creation form.
 *
 * It writes a real course. A course may be saved as a draft or published
 * immediately; the payment policy is the course's own, not the rental rule.
 */
export default function CourseForm({
  onCreated,
}: {
  onCreated: () => Promise<void> | void
}) {
  const [form, setForm] = useState({
    clinicId: '',
    title: '',
    description: '',
    subject: '',
    specialty: '',
    academicLevel: '',
    trainingType: 'practical' as 'theoretical' | 'practical' | 'combined',
    instructor: '',
    learningObjectives: '',
    topics: '',
    theoreticalComponents: '',
    practicalComponents: '',
    includesSupervisedPractice: false,
    materialsRequired: '',
    startDt: '',
    endDt: '',
    capacity: '20',
    priceEgp: '0',
    paymentPolicy: 'full' as 'free' | 'full' | 'deposit',
    depositPct: '50',
    registrationOpenAt: '',
    registrationCloseAt: '',
    location: '',
    imageUrl: '',
    publish: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<string | null>(null)
  const [facilities, setFacilities] = useState<ManagedFacility[]>([])

  // The facilities this account may teach in. The course is created against
  // one of them — the id is never typed in by hand.
  useEffect(() => {
    let cancelled = false
    void listManagedFacilities()
      .then((payload) => {
        if (cancelled) return
        const list = payload.facilities ?? []
        setFacilities(list)
        setForm((current) =>
          current.clinicId === '' && list.length > 0
            ? { ...current, clinicId: list[0].id }
            : current,
        )
      })
      .catch(() => {
        if (!cancelled) setFacilities([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setCreated(null)

    try {
      const draft: CourseDraft = {
        clinicId: form.clinicId,
        title: form.title,
        description: form.description,
        subject: form.subject,
        specialty: form.specialty,
        academicLevel: form.academicLevel || undefined,
        trainingType: form.trainingType,
        instructor: form.instructor,
        learningObjectives: splitList(form.learningObjectives),
        topics: splitList(form.topics),
        theoreticalComponents: form.theoreticalComponents,
        practicalComponents: form.practicalComponents,
        includesSupervisedPractice: form.includesSupervisedPractice,
        materialsRequired: form.materialsRequired,
        imageUrl: form.imageUrl,
        startDt: form.startDt,
        endDt: form.endDt || undefined,
        capacity: Number(form.capacity),
        priceEgp: Number(form.priceEgp),
        paymentPolicy: form.paymentPolicy,
        depositPct:
          form.paymentPolicy === 'deposit' ? Number(form.depositPct) : null,
        registrationOpenAt: form.registrationOpenAt || null,
        registrationCloseAt: form.registrationCloseAt || null,
        publish: form.publish,
        sessions: form.startDt
          ? [
              {
                title: 'Session 1',
                startDatetime: form.startDt,
                location: form.location || undefined,
              },
            ]
          : [],
      }

      const payload = await createCourse(draft)
      setCreated(payload.course.slug)
      await onCreated()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'The course could not be created.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-graphite-900">
        Create a course
      </h2>
      <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-slate-600">
        Everything here is published on the course page exactly as you enter it.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          label="Facility"
          htmlFor="course-clinic"
          required
          hint="The facility that hosts the course."
          className="sm:col-span-2"
        >
          <select
            id="course-clinic"
            value={form.clinicId}
            onChange={(event) => set('clinicId', event.target.value)}
            required
            disabled={facilities.length === 0}
            className={INPUT}
          >
            {facilities.length === 0 ? (
              <option value="">No facility you can manage</option>
            ) : (
              facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                  {facility.city ? ` — ${facility.city}` : ''}
                </option>
              ))
            )}
          </select>
        </Field>

        <Field label="Course title" htmlFor="course-title" required className="sm:col-span-2">
          <input
            id="course-title"
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="Introduction to Dental Radiography"
            required
            className={INPUT}
          />
        </Field>

        <Field label="Description" htmlFor="course-description" className="sm:col-span-2">
          <textarea
            id="course-description"
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            rows={3}
            placeholder="What the course covers and who it is for."
            className={`${INPUT} h-auto py-3`}
          />
        </Field>

        <Field label="Subject" htmlFor="course-subject">
          <input
            id="course-subject"
            value={form.subject}
            onChange={(event) => set('subject', event.target.value)}
            placeholder="Radiography"
            className={INPUT}
          />
        </Field>

        <Field label="Specialty" htmlFor="course-specialty">
          <input
            id="course-specialty"
            value={form.specialty}
            onChange={(event) => set('specialty', event.target.value)}
            placeholder="Operative dentistry"
            className={INPUT}
          />
        </Field>

        <Field label="Academic level" htmlFor="course-level">
          <select
            id="course-level"
            value={form.academicLevel}
            onChange={(event) => set('academicLevel', event.target.value)}
            className={INPUT}
          >
            <option value="">Not specified</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {ACADEMIC_LEVEL_LABEL[level]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Format" htmlFor="course-type">
          <select
            id="course-type"
            value={form.trainingType}
            onChange={(event) =>
              set('trainingType', event.target.value as typeof form.trainingType)
            }
            className={INPUT}
          >
            <option value="theoretical">Theoretical</option>
            <option value="practical">Practical</option>
            <option value="combined">Theory and practice</option>
          </select>
        </Field>

        <Field label="Instructor" htmlFor="course-instructor" className="sm:col-span-2">
          <input
            id="course-instructor"
            value={form.instructor}
            onChange={(event) => set('instructor', event.target.value)}
            placeholder="Dr. Sarah Mahmoud"
            className={INPUT}
          />
        </Field>

        <Field
          label="Learning objectives"
          htmlFor="course-objectives"
          hint="One per line."
          className="sm:col-span-2"
        >
          <textarea
            id="course-objectives"
            value={form.learningObjectives}
            onChange={(event) => set('learningObjectives', event.target.value)}
            rows={4}
            placeholder={'Position intraoral sensors correctly\nInterpret common radiographic errors'}
            className={`${INPUT} h-auto py-3`}
          />
        </Field>

        <Field label="Topics covered" htmlFor="course-topics" hint="One per line." className="sm:col-span-2">
          <textarea
            id="course-topics"
            value={form.topics}
            onChange={(event) => set('topics', event.target.value)}
            rows={3}
            placeholder={'Radiation safety\nImage interpretation'}
            className={`${INPUT} h-auto py-3`}
          />
        </Field>

        <Field label="Theoretical components" htmlFor="course-theory" className="sm:col-span-2">
          <textarea
            id="course-theory"
            value={form.theoreticalComponents}
            onChange={(event) => set('theoreticalComponents', event.target.value)}
            rows={3}
            className={`${INPUT} h-auto py-3`}
          />
        </Field>

        <Field label="Practical components" htmlFor="course-practical" className="sm:col-span-2">
          <textarea
            id="course-practical"
            value={form.practicalComponents}
            onChange={(event) => set('practicalComponents', event.target.value)}
            rows={3}
            className={`${INPUT} h-auto py-3`}
          />
        </Field>

        <Field label="Materials required" htmlFor="course-materials" className="sm:col-span-2">
          <input
            id="course-materials"
            value={form.materialsRequired}
            onChange={(event) => set('materialsRequired', event.target.value)}
            placeholder="Bring safety glasses; materials are provided."
            className={INPUT}
          />
        </Field>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.includesSupervisedPractice}
            onChange={(event) => set('includesSupervisedPractice', event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600/30"
          />
          <span className="text-[0.9375rem] text-graphite-900">
            Includes supervised hands-on practice
          </span>
        </label>

        <Field label="Start date and time" htmlFor="course-start" required>
          <input
            id="course-start"
            type="datetime-local"
            value={form.startDt}
            onChange={(event) => set('startDt', event.target.value)}
            required
            className={INPUT}
          />
        </Field>

        <Field label="End date and time" htmlFor="course-end">
          <input
            id="course-end"
            type="datetime-local"
            value={form.endDt}
            onChange={(event) => set('endDt', event.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Location" htmlFor="course-location" className="sm:col-span-2">
          <input
            id="course-location"
            value={form.location}
            onChange={(event) => set('location', event.target.value)}
            placeholder="Training room 2, Main Branch"
            className={INPUT}
          />
        </Field>

        <Field label="Capacity" htmlFor="course-capacity" required>
          <input
            id="course-capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(event) => set('capacity', event.target.value)}
            required
            className={INPUT}
          />
        </Field>

        <Field label="Price (EGP)" htmlFor="course-price" hint="0 for a free course.">
          <input
            id="course-price"
            type="number"
            min={0}
            value={form.priceEgp}
            onChange={(event) => set('priceEgp', event.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Payment policy" htmlFor="course-payment">
          <select
            id="course-payment"
            value={form.paymentPolicy}
            onChange={(event) =>
              set('paymentPolicy', event.target.value as typeof form.paymentPolicy)
            }
            className={INPUT}
          >
            <option value="full">Full payment on registration</option>
            <option value="deposit">A percentage deposit</option>
            <option value="free">No payment required</option>
          </select>
        </Field>

        {form.paymentPolicy === 'deposit' ? (
          <Field label="Deposit percentage" htmlFor="course-deposit">
            <input
              id="course-deposit"
              type="number"
              min={1}
              max={99}
              value={form.depositPct}
              onChange={(event) => set('depositPct', event.target.value)}
              className={INPUT}
            />
          </Field>
        ) : null}

        <Field label="Registration opens" htmlFor="course-opens">
          <input
            id="course-opens"
            type="datetime-local"
            value={form.registrationOpenAt}
            onChange={(event) => set('registrationOpenAt', event.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Registration closes" htmlFor="course-closes">
          <input
            id="course-closes"
            type="datetime-local"
            value={form.registrationCloseAt}
            onChange={(event) => set('registrationCloseAt', event.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Cover image URL" htmlFor="course-image" className="sm:col-span-2">
          <input
            id="course-image"
            type="url"
            value={form.imageUrl ?? ''}
            onChange={(event) => set('imageUrl', event.target.value)}
            placeholder="https://"
            className={INPUT}
          />
        </Field>
      </div>

      <label className="mt-6 flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.publish}
          onChange={(event) => set('publish', event.target.checked)}
          className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600/30"
        />
        <span className="text-[0.9375rem] text-graphite-900">
          Publish this course straight away
        </span>
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] text-danger"
        >
          {error}
        </p>
      ) : null}

      {created ? (
        <p
          role="status"
          className="mt-5 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[0.875rem] text-success"
        >
          The course was created.{' '}
          <a href={`/courses/${created}`} className="underline underline-offset-4">
            View it
          </a>
        </p>
      ) : null}

      <div className="mt-8">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Creating…' : form.publish ? 'Create and publish' : 'Save as a draft'}
        </button>
      </div>
    </form>
  )
}

function splitList(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  className = '',
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-semibold text-graphite-900">
        {label}
        {required ? <span className="ml-1 text-teal-700">*</span> : null}
      </label>
      {hint ? <p className="mt-1 text-[0.75rem] text-slate-600">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}
