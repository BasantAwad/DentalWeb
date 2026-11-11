'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/platform-api'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'

const INPUT =
  'h-12 w-full rounded-[10px] border border-stone-300 bg-white px-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30'

/**
 * Create an account.
 *
 * The account is created by the authentication provider; the platform record
 * that bookings and enrolments reference is written alongside it. Nothing is
 * stored here that the platform does not need.
 */
export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      })

      if (payload.signedIn) {
        router.push('/account')
        router.refresh()
        return
      }

      // Email confirmation is required: the account exists but there is no
      // session until the address is confirmed.
      setSuccess(payload.message)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The account could not be created. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 80% 0%, rgba(47,119,114,0.12) 0%, rgba(32,37,34,0) 55%)',
        }}
      />

      <div className="page relative">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>Join DentalWeb</Eyebrow>
            <h1 className="mt-6 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-graphite-900">
              Create your account.
            </h1>
            <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-graphite-700">
              One account for equipment rental and for courses. Register for a
              programme, reserve a chair, and keep everything in one place.
            </p>
            <div className="mt-8 max-w-sm">
              <Rule />
            </div>
            <ul className="mt-6 space-y-2.5 text-[0.9375rem] text-graphite-700">
              {[
                'Reserve a dental chair at 150 EGP per hour',
                'Reserve a phantom-head station at 100 EGP per hour',
                'Register for courses and practical training',
                'A 50% deposit confirms an equipment reservation',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
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
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="rounded-[20px] border border-stone-300 bg-chalk p-7 sm:p-9">
              <h2 className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900">
                Your details
              </h2>

              {error ? (
                <p
                  role="alert"
                  className="mt-5 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] leading-relaxed text-danger"
                >
                  {error}
                </p>
              ) : null}

              {success ? (
                <p
                  role="status"
                  className="mt-5 rounded-[10px] border border-success/30 bg-success/10 px-4 py-3 text-[0.875rem] leading-relaxed text-success"
                >
                  {success}
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="register-name"
                    className="block text-[0.8125rem] font-semibold text-graphite-900"
                  >
                    Full name
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                      className={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-[0.8125rem] font-semibold text-graphite-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-phone"
                    className="block text-[0.8125rem] font-semibold text-graphite-900"
                  >
                    Phone number
                    <span className="ml-1 font-normal text-slate-600">
                      (optional)
                    </span>
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+20 1XX XXX XXXX"
                      autoComplete="tel"
                      className={INPUT}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-password"
                    className="block text-[0.8125rem] font-semibold text-graphite-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      className={INPUT}
                    />
                  </div>
                  <p className="mt-1.5 text-[0.75rem] text-slate-600">
                    Use at least 8 characters.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating your account…' : 'Create account'}
                </button>
              </form>

              <div className="mt-7">
                <Rule />
              </div>

              <p className="mt-6 text-[0.9375rem] text-graphite-700">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="inline-flex min-h-11 items-center font-semibold text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
