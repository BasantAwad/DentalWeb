'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { signIn, type SessionUser } from '@/lib/platform-api'
import { getSession } from '@/lib/platform-api'
import Section, { Eyebrow, Rule } from '@/components/ui/Section'

const INPUT =
  'h-12 w-full rounded-[10px] border border-stone-300 bg-white px-4 text-[0.9375rem] text-graphite-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30'

/**
 * Sign in.
 *
 * A real session: the credentials are checked by the authentication provider
 * and the session cookie is set server-side. The form then goes to the
 * account area, or back to wherever the visitor came from.
 */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn({ email: email.trim(), password })
      // The session is now a cookie; the account area can be read.
      const next = searchParams.get('next')
      router.push(next && next.startsWith('/') ? next : '/account')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Signing in failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="block text-[0.8125rem] font-semibold text-graphite-900"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              id="login-email"
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
            htmlFor="login-password"
            className="block text-[0.8125rem] font-semibold text-graphite-900"
          >
            Password
          </label>
          <div className="mt-2">
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className={INPUT}
            />
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] leading-relaxed text-danger"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-teal-700 px-6 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-7">
        <Rule />
      </div>

      <p className="mt-6 text-[0.9375rem] text-graphite-700">
        New to DentalWeb?{' '}
        <Link
          href="/auth/register"
          className="inline-flex min-h-11 items-center font-semibold text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
        >
          Create an account
        </Link>
      </p>
    </>
  )
}

/**
 * If somebody is already signed in, the page should say so rather than
 * offer a form they do not need.
 */
function SignedInNotice() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getSession()
      .then((session) => {
        if (cancelled) return
        setUser(session.user)
        setChecked(true)
      })
      .catch(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!checked) return null

  if (!user) return null

  return (
    <div className="rounded-[16px] border border-stone-300 bg-chalk p-6">
      <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
        You are already signed in as{' '}
        <span className="font-semibold text-graphite-900">{user.email}</span>.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push('/account')}
          className="inline-flex h-11 items-center rounded-[12px] bg-teal-700 px-5 text-[0.875rem] font-semibold text-white transition-colors duration-200 hover:bg-teal-600"
        >
          Go to my dashboard
        </button>
        <Link
          href="/auth/login"
          className="inline-flex h-11 items-center px-2 text-[0.875rem] font-semibold text-teal-700 underline underline-offset-4 transition-colors hover:text-teal-600"
        >
          Sign in as somebody else
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Section theme="porcelain" className="relative overflow-hidden pt-32 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 20% 0%, rgba(47,119,114,0.12) 0%, rgba(32,37,34,0) 55%)',
        }}
      />

      <div className="page relative">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Eyebrow>Your account</Eyebrow>
            <h1 className="mt-6 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-graphite-900">
              Sign in to your account.
            </h1>
            <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-graphite-700">
              Your reservations, your course registrations and your profile all
              live behind your account.
            </p>
            <div className="mt-8 max-w-sm">
              <Rule />
            </div>
            <ul className="mt-6 space-y-2.5 text-[0.9375rem] text-graphite-700">
              {[
                'Every reservation you have made, with its payment status',
                'The courses you are registered for, and their schedule',
                'Your profile, editable and visible only to you',
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
              <Suspense fallback={null}>
                <SignedInNotice />
              </Suspense>
              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
