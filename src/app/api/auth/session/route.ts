import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { isBackendConfigured } from '@/lib/supabase/server'

/**
 * GET /api/auth/session
 *
 * Returns the signed-in identity, or `null`. The client uses this to decide
 * whether to show the account menu or the sign-in links.
 */
export async function GET() {
  if (!isBackendConfigured()) {
    return NextResponse.json({
      signedIn: false,
      backendConfigured: false,
      user: null,
    })
  }

  const user = await getSessionUser()

  return NextResponse.json({
    signedIn: Boolean(user),
    backendConfigured: true,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          platformRole: user.platformRole,
        }
      : null,
  })
}
