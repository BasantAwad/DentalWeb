import { NextResponse } from 'next/server'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

/**
 * POST /api/auth/register
 *
 * Creates the authentication identity and the matching platform user record.
 * The platform user id is what bookings and enrolments reference.
 */
export async function POST(request: Request) {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      {
        error: 'backend_not_configured',
        message:
          'Accounts need a configured database. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
      },
      { status: 503 },
    )
  }

  let body: { name?: string; email?: string; password?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'A request body is required.' },
      { status: 400 },
    )
  }

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  const phone = body.phone?.trim() || null

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'missing_fields', message: 'Name, email and password are required.' },
      { status: 400 },
    )
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'weak_password', message: 'Password must be at least 8 characters.' },
      { status: 400 },
    )
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'invalid_email', message: 'Enter a valid email address.' },
      { status: 400 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, phone } },
  })

  if (error || !data.user) {
    const alreadyExists = /already registered|already exists/i.test(error?.message ?? '')
    return NextResponse.json(
      {
        error: alreadyExists ? 'email_taken' : 'registration_failed',
        message: alreadyExists
          ? 'An account already exists for that email address.'
          : (error?.message ?? 'The account could not be created.'),
      },
      { status: alreadyExists ? 409 : 400 },
    )
  }

  const userId = data.user.id

  // Mirror the identity into platform_users so bookings and enrolments can
  // reference it. A duplicate here means the account already exists.
  const { error: profileError } = await supabase.from('platform_users').upsert(
    {
      uid: userId,
      email,
      name,
      phone,
      platform_role: 'user',
    },
    { onConflict: 'uid' },
  )

  if (profileError) {
    console.error('[DentalWeb] could not create the platform user:', profileError.message)
    return NextResponse.json(
      {
        error: 'profile_failed',
        message:
          'The account was created but its profile could not be prepared. Please sign in.',
      },
      { status: 500 },
    )
  }

  // A private profile row keeps the optional student fields together.
  const { data: profile } = await supabase
    .from('platform_users')
    .select('id')
    .eq('uid', userId)
    .maybeSingle()

  if (profile) {
    await supabase.from('user_profiles').upsert(
      { user_id: profile.id },
      { onConflict: 'user_id' },
    )
  }

  // When email confirmation is required there is no session yet.
  const signedIn = Boolean(data.session)

  return NextResponse.json(
    {
      success: true,
      signedIn,
      requiresEmailConfirmation: !signedIn,
      message: signedIn
        ? 'Your account is ready.'
        : 'Check your inbox to confirm your email address, then sign in.',
    },
    { status: 201 },
  )
}
