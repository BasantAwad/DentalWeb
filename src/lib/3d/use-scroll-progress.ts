'use client'

import { useEffect, useRef, type RefObject } from 'react'

/**
 * Scroll progress driver backed by GSAP ScrollTrigger.
 *
 * The value is written into a ref rather than React state so the 3D loop can
 * read it every frame without triggering a re-render.
 *
 * Scroll is never hijacked: this only observes the document's own scroll
 * position and maps it onto a 0 → 1 range.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  options: { start?: string; end?: string; enabled?: boolean } = {},
) {
  const progress = useRef(0)
  const { start = 'top top', end = 'bottom bottom', enabled = true } = options

  useEffect(() => {
    if (!enabled) {
      progress.current = 0
      return
    }
    const element = target.current
    if (!element) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    // Dynamically import GSAP so it is not part of the initial bundle.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      const trigger = ScrollTrigger.create({
        trigger: element,
        start,
        end,
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress
        },
      })

      cleanup = () => {
        trigger.kill()
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [target, start, end, enabled])

  return progress
}
