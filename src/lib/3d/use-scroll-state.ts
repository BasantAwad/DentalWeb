'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Scroll progress observer backed by GSAP ScrollTrigger.
 *
 * Unlike `useScrollProgress` (which writes into a ref for the render loop),
 * this variant produces a React state value so DOM content can react to
 * scroll position. Updates are throttled to meaningful changes only.
 */
export function useScrollState(
  target: RefObject<HTMLElement | null>,
  options: {
    start?: string
    end?: string
    enabled?: boolean
    /** Only update when the value crosses this step. */
    step?: number
  } = {},
) {
  const { start = 'top top', end = 'bottom bottom', enabled = true, step = 0.01 } = options
  const [value, setValue] = useState(0)
  const lastRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setValue(0)
      return
    }
    const element = target.current
    if (!element) return

    let cleanup: (() => void) | undefined
    let cancelled = false

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
          const next = self.progress
          if (Math.abs(next - lastRef.current) >= step) {
            lastRef.current = next
            setValue(next)
          }
        },
      })

      cleanup = () => trigger.kill()
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [target, start, end, enabled, step])

  return value
}
