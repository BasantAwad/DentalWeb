'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Demo: simulate auth — in production this calls Supabase
    try {
      await new Promise(r => setTimeout(r, 800))

      if (!email || !password) {
        throw new Error('Please enter your email and password.')
      }

      // Demo success — show success state
      setSuccess('Welcome back! In production, you would be signed in and redirected to your dashboard.')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M6 6h12M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
            </svg>
          </div>
          <span className="text-lg font-semibold text-navy">Dental</span>
        </Link>

        <div className="bg-white rounded-xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-navy">Sign in to your account</h1>
            <p className="text-sm text-muted mt-1">Welcome back! Sign in to view bookings and manage your account.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer">
                <input type="checkbox" className="rounded border-border text-aqua focus:ring-aqua/30" />
                Remember me
              </label>
              <Link href="#" className="text-aqua hover:text-aqua-dark text-xs font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-charcoal transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-aqua hover:text-aqua-dark font-medium">
              Create one
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Demo mode: this login flow is a frontend showcase. In production, authentication is powered by Supabase Auth.
        </p>
      </div>
    </div>
  )
}
