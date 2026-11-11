import 'server-only'

import { createServerSupabaseClient, isBackendConfigured } from '@/lib/supabase/server'

/**
 * The signed-in platform user.
 *
 * `platform_users.id` is the identifier used by bookings, enrolments and
 * every other business table. `uid` links it to the authentication
 * provider's user id.
 */
export interface SessionUser {
  id: string
  uid: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  platformRole: string
  createdAt: string
}

/**
 * Resolves the current session.
 *
 * Returns `null` when nobody is signed in, when the backend is not
 * configured, or when the signed-in identity has no platform user record.
 * Never throws, so callers can treat "signed out" as an ordinary state.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isBackendConfigured()) return null

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null

    const { data: profile } = await supabase
      .from('platform_users')
      .select('id, uid, name, email, phone, avatar_url, platform_role, created_at')
      .eq('uid', data.user.id)
      .maybeSingle()

    if (!profile) return null

    return {
      id: profile.id,
      uid: profile.uid,
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? null,
      avatarUrl: profile.avatar_url ?? null,
      platformRole: profile.platform_role,
      createdAt: profile.created_at,
    }
  } catch (error) {
    console.error('[DentalWeb] session lookup failed:', error)
    return null
  }
}

/** The facilities this user may manage, with the role they hold. */
export interface FacilityMembership {
  clinicId: string
  name: string
  slug: string
  city: string | null
  role: 'owner' | 'manager' | 'staff'
}

export async function getFacilityMemberships(
  userId: string,
): Promise<FacilityMembership[]> {
  if (!isBackendConfigured()) return []

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('clinic_memberships')
      .select('role, clinics (id, name, slug, city)')
      .eq('user_id', userId)
      .eq('status', 'active')

    return (data ?? [])
      .map((row) => {
        const clinic = Array.isArray(row.clinics)
          ? row.clinics[0]
          : row.clinics
        return {
          clinicId: clinic?.id ?? '',
          name: clinic?.name ?? '',
          slug: clinic?.slug ?? '',
          city: clinic?.city ?? null,
          role: row.role as FacilityMembership['role'],
        }
      })
      .filter((membership) => membership.clinicId !== '')
  } catch (error) {
    console.error('[DentalWeb] membership lookup failed:', error)
    return []
  }
}

/**
 * Whether the user may manage the given facility.
 * Only owners and managers may; staff have read-only access.
 */
export async function canManageFacility(
  userId: string,
  clinicId: string,
): Promise<boolean> {
  const memberships = await getFacilityMemberships(userId)
  return memberships.some(
    (membership) =>
      membership.clinicId === clinicId &&
      (membership.role === 'owner' || membership.role === 'manager'),
  )
}
