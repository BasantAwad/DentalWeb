'use client'

import { useEffect, useState } from 'react'
import {
  getAccountProfile,
  updateAccountProfile,
  type AccountProfile,
} from '@/lib/platform-api'
import { ACADEMIC_LEVEL_LABEL, PROFESSIONAL_STATUS_LABEL } from '@/lib/account-types'
import AccountShell from '@/components/account/AccountShell'
import { ButtonLink } from '@/components/ui/Button'

type Status = 'loading' | 'ready' | 'signed-out' | 'unavailable'

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

const PROFESSIONAL_STATUSES = ['student', 'graduate', 'dentist', 'other']

/**
 * Personal information.
 *
 * Every field except the name is optional, and the student-specific fields
 * are clearly optional — the platform only needs a way to reach the customer.
 */
export default function AccountProfilePage() {
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // The form holds its own copy so typing is not interrupted by a refetch.
  const [form, setForm] = useState<Partial<AccountProfile>>({})
  const [interests, setInterests] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const payload = await getAccountProfile()
        if (cancelled) return
        if (!payload.profile) {
          const apiError = payload as unknown as { code?: string; message?: string }
          if (apiError.code === 'authentication_required') {
            setStatus('signed-out')
            return
          }
          setStatus('unavailable')
          setMessage(apiError.message ?? 'Your profile could not be loaded.')
          return
        }
        setProfile(payload.profile)
        setForm(payload.profile)
        setInterests((payload.profile.interests ?? []).join(', '))
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const apiError = err as { code?: string; message?: string }
        if (apiError.code === 'authentication_required') {
          setStatus('signed-out')
          return
        }
        setStatus('unavailable')
        setMessage(apiError.message ?? 'Your profile could not be loaded.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const payload = await updateAccountProfile({
        ...form,
        interests: interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      })
      if (payload.profile) {
        setProfile(payload.profile)
        setForm(payload.profile)
        setInterests((payload.profile.interests ?? []).join(', '))
      }
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Your profile could not be saved.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <AccountShell title="My profile">
        <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
          Loading your profile…
        </p>
      </AccountShell>
    )
  }

  if (status === 'signed-out') {
    return (
      <AccountShell title="Sign in to manage your profile">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            Your profile is only visible to you and to the facilities you book
            with.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/auth/login" variant="primary">
              Sign in
            </ButtonLink>
            <ButtonLink href="/auth/register" variant="secondary">
              Create an account
            </ButtonLink>
          </div>
        </div>
      </AccountShell>
    )
  }

  if (status === 'unavailable' || !profile) {
    return (
      <AccountShell title="My profile">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            {message ||
              'Your profile needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'}
          </p>
        </div>
      </AccountShell>
    )
  }

  const set = (key: keyof AccountProfile, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <AccountShell
      title="My profile"
      description="Your contact details, and optionally the information that helps a facility prepare your session."
    >
      {/* Completion */}
      <div className="rounded-[16px] border border-stone-300 bg-chalk p-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.9375rem] font-semibold text-graphite-900">
            Profile {profile.completion}% complete
          </p>
          <p className="text-[0.8125rem] text-slate-600">
            Member since{' '}
            {new Date(profile.createdAt).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-sage-100"
          role="progressbar"
          aria-valuenow={profile.completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completion"
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-[width] duration-500"
            style={{ width: `${profile.completion}%` }}
          />
        </div>
      </div>

      <form onSubmit={save} className="mt-10">
        {/* Basic information */}
        <section aria-labelledby="basic-heading">
          <h2
            id="basic-heading"
            className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
          >
            Basic information
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="profile-name" required>
              <input
                id="profile-name"
                value={form.name ?? ''}
                onChange={(event) => set('name', event.target.value)}
                required
                className={INPUT}
              />
            </Field>

            <Field label="Email address" htmlFor="profile-email" hint="Contact support to change your email.">
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className={`${INPUT} cursor-not-allowed bg-porcelain-100 text-slate-600`}
              />
            </Field>

            <Field label="Phone number" htmlFor="profile-phone" hint="Used for booking confirmations.">
              <input
                id="profile-phone"
                type="tel"
                value={form.phone ?? ''}
                onChange={(event) => set('phone', event.target.value)}
                placeholder="+20 1XX XXX XXXX"
                className={INPUT}
              />
            </Field>

            <Field label="City" htmlFor="profile-city">
              <input
                id="profile-city"
                value={form.city ?? ''}
                onChange={(event) => set('city', event.target.value)}
                placeholder="Cairo"
                className={INPUT}
              />
            </Field>

            <Field label="Date of birth" htmlFor="profile-dob" hint="Optional.">
              <input
                id="profile-dob"
                type="date"
                value={form.dateOfBirth ?? ''}
                onChange={(event) => set('dateOfBirth', event.target.value)}
                className={INPUT}
              />
            </Field>

            <Field label="Profile picture URL" htmlFor="profile-avatar" hint="Optional. A link to an image.">
              <input
                id="profile-avatar"
                type="url"
                value={form.avatarUrl ?? ''}
                onChange={(event) => set('avatarUrl', event.target.value)}
                placeholder="https://"
                className={INPUT}
              />
            </Field>
          </div>
        </section>

        {/* Student information */}
        <section aria-labelledby="student-heading" className="mt-14">
          <h2
            id="student-heading"
            className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
          >
            Dental student information
          </h2>
          <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-slate-600">
            Optional. A facility may ask for these to prepare a session, and
            they are only shared with the facility you book.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="University or institution" htmlFor="profile-university">
              <input
                id="profile-university"
                value={form.university ?? ''}
                onChange={(event) => set('university', event.target.value)}
                placeholder="Cairo University"
                className={INPUT}
              />
            </Field>

            <Field label="Academic year" htmlFor="profile-level">
              <select
                id="profile-level"
                value={form.academicLevel ?? ''}
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

            <Field label="Professional status" htmlFor="profile-status">
              <select
                id="profile-status"
                value={form.professionalStatus ?? ''}
                onChange={(event) => set('professionalStatus', event.target.value)}
                className={INPUT}
              >
                <option value="">Not specified</option>
                {PROFESSIONAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PROFESSIONAL_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Interests"
              htmlFor="profile-interests"
              hint="Comma separated, for example: endodontics, composites."
            >
              <input
                id="profile-interests"
                value={interests}
                onChange={(event) => setInterests(event.target.value)}
                placeholder="Endodontics, composites"
                className={INPUT}
              />
            </Field>
          </div>
        </section>

        {/* Preferences */}
        <section aria-labelledby="prefs-heading" className="mt-14">
          <h2
            id="prefs-heading"
            className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
          >
            Notifications
          </h2>
          <div className="mt-5 space-y-4">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-stone-300 pt-4">
              <input
                type="checkbox"
                checked={form.notifyEmail ?? true}
                onChange={(event) => set('notifyEmail', event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600/30"
              />
              <span className="text-[0.9375rem] text-graphite-900">
                Email me about my reservations and courses
              </span>
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-stone-300 pt-4">
              <input
                type="checkbox"
                checked={form.notifySms ?? false}
                onChange={(event) => set('notifySms', event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600/30"
              />
              <span className="text-[0.9375rem] text-graphite-900">
                Text me about session reminders
              </span>
            </label>
          </div>
        </section>

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] text-danger"
          >
            {error}
          </p>
        ) : null}
        {saved ? (
          <p
            role="status"
            className="mt-6 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[0.875rem] text-success"
          >
            Your profile has been saved.
          </p>
        ) : null}

        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved ? (
            <span className="text-[0.8125rem] text-slate-600">All changes are stored.</span>
          ) : null}
        </div>
      </form>
    </AccountShell>
  )
}

const INPUT =
  'h-12 w-full rounded-[10px] border border-stone-300 bg-white px-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30'

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[0.8125rem] font-semibold text-graphite-900">
        {label}
        {required ? <span className="ml-1 text-teal-700">*</span> : null}
      </label>
      {hint ? <p className="mt-1 text-[0.75rem] text-slate-600">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}
