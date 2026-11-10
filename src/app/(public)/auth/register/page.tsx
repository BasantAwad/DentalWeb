'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(r => setTimeout(r, 800))

      if (!name || !email || !password) {
        throw new Error('Please fill in all required fields.')
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.')
      }
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address.')
      }

      // Demo success
      setError('') // clear any previous
      window.location.href = '/chair-rental'
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
            <h1 className="text-xl font-bold text-navy">Create your account</h1>
            <p className="text-sm text-muted mt-1">Join the platform to book appointments and manage your reservations.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy mb-1.5">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
                required
              />
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1.5">Phone number (optional)</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+20 1XX XXX XXXX"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
              />
              <p className="text-[10px] text-muted mt-1">Used for booking confirmations and reminders.</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua/30 focus:border-aqua bg-white"
                required
                minLength={8}
              />
              <div className="flex gap-2 mt-1.5">
                <input type="checkbox" id="terms" className="rounded border-border text-aqua focus:ring-aqua/30" required />
                <label htmlFor="terms" className="text-[10px] text-muted">
                  I agree to the{' '}
                  <Link href="#" className="text-aqua hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-aqua hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-aqua text-white text-sm font-semibold rounded-lg hover:bg-aqua-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-aqua/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-aqua hover:text-aqua-dark font-medium">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Demo mode: this registration flow is a frontend showcase. In production, accounts are created via Supabase Auth.
        </p>
      </div>
    </div>
  )
}
