import type { ReactNode } from 'react'

/**
 * Public route group shell.
 *
 * The site header and footer now live in the root layout so the homepage and
 * every public page share one navigation system with the dynamic
 * light/dark behaviour.
 */
export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
