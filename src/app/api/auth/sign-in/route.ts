import { NextResponse } from 'next/server'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

/**
 * POST /api/auth/sign-in
 *
 * Establishes a session. The session cookie is set by the server client, and
 * every later request is authorised from that cookie — never from a user id
 * sent by the browser.
 */
export async function POST(request: Request) {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message:
          'Signing in needs a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      },
      { status: 503 },
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'A request body is required.' },
      { status: 400 },
    )
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''

  if (!email || !password) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'Email and password are required.' },
      { status: 400 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return NextResponse.json(
      {
        error: 'invalid_credentials',
        message: 'That email address and password do not match an account.',
      },
      { status: 401 },
    )
  }

  // A signed-in identity without a platform record cannot hold bookings.
  const { data: profile } = await supabase
    .from('platform_users')
    .select('id, name')
    .eq('uid', data.user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.json(
      {
        error: 'no_platform_user',
        message:
          'This account has no platform profile yet. Please contact support.',
      },
      { status: 403 },
    )
  }

  return NextResponse.json({
    success: true,
    user: { id: profile.id, name: profile.name, email: data.user.email },
  })
}
