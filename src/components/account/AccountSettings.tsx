'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, signOut, type SessionUser } from '@/lib/platform-api'
import AccountShell from '@/components/account/AccountShell'
import { ButtonLink } from '@/components/ui/Button'

type Status = 'loading' | 'ready' | 'signed-out' | 'unavailable'

/**
 * Account settings.
 *
 * Session management and the preferences that do not belong to the profile
 * form. Changing a password goes through the authentication provider.
 */
export default function AccountSettings() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const session = await getSession()
        if (cancelled) return
        if (!session.backendConfigured) {
          setStatus('unavailable')
          setMessage(
            'Your account needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
          )
          return
        }
        if (!session.signedIn) {
          setStatus('signed-out')
          return
        }
        setUser(session.user)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const apiError = err as { message?: string }
        setStatus('unavailable')
        setMessage(apiError.message ?? 'Your settings could not be loaded.')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : 'You could not be signed out.',
      )
    } finally {
      setSigningOut(false)
    }
  }

  if (status === 'loading') {
    return (
      <AccountShell title="Settings">
        <p role="status" aria-live="polite" className="text-[0.9375rem] text-slate-600">
          Loading your settings…
        </p>
      </AccountShell>
    )
  }

  if (status === 'signed-out') {
    return (
      <AccountShell title="Sign in to manage your account">
        <div className="rounded-[18px] border border-stone-300 bg-chalk p-8">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-700">
            Sign in to change your password or sign out.
          </p>
          <div className="mt-7">
            <ButtonLink href="/auth/login" variant="primary">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </AccountShell>
    )
  }

  return (
    <AccountShell
      title="Settings"
      description="Your session and your account details."
    >
      {/* Account details */}
      <section aria-labelledby="account-heading">
        <h2
          id="account-heading"
          className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Account
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-stone-300 pt-5 sm:grid-cols-2">
          {[
            { term: 'Name', value: user?.name ?? '—' },
            { term: 'Email address', value: user?.email ?? '—' },
            {
              term: 'Account type',
              value:
                user?.platformRole === 'user'
                  ? 'Student / client'
                  : (user?.platformRole ?? '—').replace(/_/g, ' '),
            },
          ].map((row) => (
            <div key={row.term}>
              <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-slate-600">
                {row.term}
              </dt>
              <dd className="mt-1 text-[0.9375rem] font-medium text-graphite-900">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/account/profile"
            className="inline-flex min-h-11 items-center text-[0.875rem] font-semibold text-teal-700 underline underline-offset-[6px] transition-colors hover:text-teal-600"
          >
            Edit your profile
          </Link>
        </div>
      </section>

      {/* Password */}
      <section aria-labelledby="password-heading" className="mt-14">
        <h2
          id="password-heading"
          className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Password
        </h2>
        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-700">
          Password changes are handled by the authentication provider, which
          verifies your current password before setting a new one.
        </p>
        <div className="mt-5">
          <ButtonLink href="/auth/login" variant="secondary" size="md">
            Change your password
          </ButtonLink>
        </div>
      </section>

      {/* Session */}
      <section aria-labelledby="session-heading" className="mt-14">
        <h2
          id="session-heading"
          className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-graphite-900"
        >
          Session
        </h2>
        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-700">
          Signing out ends this session on this device. Your reservations and
          course registrations stay on your account.
        </p>

        {message ? (
          <p
            role="alert"
            className="mt-5 rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[0.875rem] text-danger"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex h-12 items-center justify-center rounded-[12px] border border-danger/40 px-6 text-[0.9375rem] font-semibold text-danger transition-colors duration-200 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </section>
    </AccountShell>
  )
}
