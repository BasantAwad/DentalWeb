import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { Database } from './database.types'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerSupabaseClient(request: Request) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers.get('cookie')?.split('; ').map(c => {
          const [k, v] = c.split('=')
          return { name: k, value: v }
        }) ?? []
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          request.headers.set('cookie', `${name}=${value}`)
        })
      },
    },
  })
}
