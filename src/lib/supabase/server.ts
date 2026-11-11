import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Server-side Supabase client that carries the visitor's session.
 *
 * The browser client in `client.ts` is for client components only. Server
 * code — route handlers and server components — must use this one so that
 * RLS sees the signed-in user rather than the anonymous role.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // `setAll` throws when called from a Server Component, which is
            // read-only. Session refresh then happens in route handlers.
          }
        },
      },
    },
  )
}

/** Whether a backend is configured at all. */
export function isBackendConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
