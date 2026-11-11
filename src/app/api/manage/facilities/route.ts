import { NextResponse } from 'next/server'
import { getSessionUser, getFacilityMemberships } from '@/lib/auth'
import { isBackendConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/manage/facilities
 *
 * The facilities the signed-in user may manage.
 *
 * This is the list a course is created against, so the facility is chosen
 * from what the account actually owns rather than typed in. The ids come
 * from the membership table, never from the browser.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json({
      backend: 'not_configured',
      message: 'Course management needs a configured database.',
      facilities: [],
    })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: 'authentication_required', message: 'Please sign in.', facilities: [] },
      { status: 401 },
    )
  }

  const memberships = await getFacilityMemberships(user.id)
  const manageable = memberships.filter(
    (membership) => membership.role === 'owner' || membership.role === 'manager',
  )

  if (manageable.length === 0) {
    return NextResponse.json(
      {
        error: 'not_authorised',
        message: 'You do not manage any facility.',
        facilities: [],
      },
      { status: 403 },
    )
  }

  return NextResponse.json({
    facilities: manageable.map((membership) => ({
      id: membership.clinicId,
      name: membership.name,
      slug: membership.slug,
      city: membership.city,
      role: membership.role,
    })),
  })
}
