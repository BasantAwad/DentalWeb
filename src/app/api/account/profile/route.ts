import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'
import type { AccountProfile } from '@/lib/account-types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/account/profile
 *
 * The signed-in user's own profile. Never anybody else's.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: 'backend_not_configured', message: 'Accounts are not connected yet.', profile: null },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.', profile: null },
      { status: 401 },
    )
  }

  const supabase = await createServerSupabaseClient()

  const [{ data: details }, { data: profile }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase.rpc('profile_completion', { p_user_id: user.id }),
  ])

  const completion = typeof profile === 'number' ? profile : 0

  const shaped: AccountProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    dateOfBirth: details?.date_of_birth ?? null,
    city: details?.city ?? null,
    university: details?.university ?? null,
    academicLevel: details?.academic_level ?? null,
    professionalStatus: details?.professional_status ?? null,
    interests: details?.interests ?? [],
    notifyEmail: details?.notify_email ?? true,
    notifySms: details?.notify_sms ?? false,
    timezone: details?.timezone ?? 'Africa/Cairo',
    completion,
  }

  return NextResponse.json({ profile: shaped })
}

/**
 * PATCH /api/account/profile
 *
 * Updates the signed-in user's own information.
 *
 * The user id is taken from the session, never from the request body.
 */
export async function PATCH(request: Request) {
  if (!isBackendConfigured()) {
    return NextResponse.json(
      { error: 'backend_not_configured', message: 'Accounts are not connected yet.' },
      { status: 503 },
    )
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.' },
      { status: 401 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', message: 'A request body is required.' },
      { status: 400 },
    )
  }

  // Only these fields may be changed. Anything else is ignored.
  const userFields: Record<string, unknown> = {}
  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (name.length < 2) {
      return NextResponse.json(
        { error: 'invalid_name', message: 'Please enter your full name.' },
        { status: 400 },
      )
    }
    userFields.name = name
  }
  if (typeof body.phone === 'string') {
    userFields.phone = body.phone.trim() || null
  }
  if (typeof body.avatarUrl === 'string') {
    const url = body.avatarUrl.trim()
    if (url && !/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { error: 'invalid_avatar', message: 'The image must be a URL.' },
        { status: 400 },
      )
    }
    userFields.avatar_url = url || null
  }

  const profileFields: Record<string, unknown> = {}
  if (body.dateOfBirth !== undefined) {
    const value = body.dateOfBirth
    if (value === null || value === '') {
      profileFields.date_of_birth = null
    } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      profileFields.date_of_birth = value
    } else {
      return NextResponse.json(
        { error: 'invalid_date', message: 'Enter the date of birth as YYYY-MM-DD.' },
        { status: 400 },
      )
    }
  }
  if (typeof body.city === 'string') {
    profileFields.city = body.city.trim() || null
  }
  if (typeof body.university === 'string') {
    profileFields.university = body.university.trim() || null
  }
  if (body.academicLevel !== undefined) {
    const value = body.academicLevel
    if (value === null || value === '') {
      profileFields.academic_level = null
    } else if (
      typeof value === 'string' &&
      ['first_year', 'second_year', 'third_year', 'fourth_year', 'fifth_year', 'postgraduate', 'resident', 'other'].includes(value)
    ) {
      profileFields.academic_level = value
    } else {
      return NextResponse.json(
        { error: 'invalid_level', message: 'That academic level is not recognised.' },
        { status: 400 },
      )
    }
  }
  if (body.professionalStatus !== undefined) {
    const value = body.professionalStatus
    if (value === null || value === '') {
      profileFields.professional_status = null
    } else if (
      typeof value === 'string' &&
      ['student', 'graduate', 'dentist', 'other'].includes(value)
    ) {
      profileFields.professional_status = value
    } else {
      return NextResponse.json(
        { error: 'invalid_status', message: 'That professional status is not recognised.' },
        { status: 400 },
      )
    }
  }
  if (Array.isArray(body.interests)) {
    profileFields.interests = body.interests
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 12)
  }
  if (typeof body.notifyEmail === 'boolean') profileFields.notify_email = body.notifyEmail
  if (typeof body.notifySms === 'boolean') profileFields.notify_sms = body.notifySms

  const supabase = await createServerSupabaseClient()

  if (Object.keys(userFields).length > 0) {
    const { error } = await supabase
      .from('platform_users')
      .update(userFields)
      .eq('id', user.id)
    if (error) {
      console.error('[DentalWeb] profile update failed:', error.message)
      return NextResponse.json(
        { error: 'update_failed', message: 'Your profile could not be saved.' },
        { status: 500 },
      )
    }
  }

  if (Object.keys(profileFields).length > 0) {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, ...profileFields }, { onConflict: 'user_id' })
    if (error) {
      console.error('[DentalWeb] profile details update failed:', error.message)
      return NextResponse.json(
        { error: 'update_failed', message: 'Your profile could not be saved.' },
        { status: 500 },
      )
    }
  }

  // Return the saved profile so the client can update without a refetch.
  const { data: details } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: updated } = await supabase
    .from('platform_users')
    .select('id, name, email, phone, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  const { data: completion } = await supabase.rpc('profile_completion', {
    p_user_id: user.id,
  })

  if (!updated) {
    return NextResponse.json(
      { error: 'not_found', message: 'Your profile could not be read back.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    profile: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone ?? null,
      avatarUrl: updated.avatar_url ?? null,
      createdAt: updated.created_at,
      dateOfBirth: details?.date_of_birth ?? null,
      city: details?.city ?? null,
      university: details?.university ?? null,
      academicLevel: details?.academic_level ?? null,
      professionalStatus: details?.professional_status ?? null,
      interests: details?.interests ?? [],
      notifyEmail: details?.notify_email ?? true,
      notifySms: details?.notify_sms ?? false,
      timezone: details?.timezone ?? 'Africa/Cairo',
      completion: typeof completion === 'number' ? completion : 0,
    } satisfies AccountProfile,
  })
}
