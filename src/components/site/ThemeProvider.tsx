'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type SectionTheme = 'light' | 'dark'

interface ThemeContextValue {
  /** The theme of the section currently occupying the viewport. */
  activeTheme: SectionTheme
  setActiveTheme: (theme: SectionTheme) => void
  /** True once the visitor has scrolled past the hero (nav becomes solid). */
  scrolled: boolean
  setScrolled: (scrolled: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<SectionTheme>('dark')
  const [scrolled, setScrolled] = useState(false)

  // Track the section under the navigation bar so the nav can adapt.
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section-theme]'),
    )
    if (sections.length === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      const navOffset = 72

      // The active section is the last one that starts above the nav line.
      // Containment is not required — a section taller than the viewport still
      // owns the nav until the next one begins.
      let current: SectionTheme = 'light'
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= navOffset) {
          current = (section.dataset.sectionTheme as SectionTheme) ?? 'light'
        } else {
          break
        }
      }

      setActiveTheme(current)
      setScrolled(window.scrollY > 24)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const setTheme = useCallback((theme: SectionTheme) => setActiveTheme(theme), [])
  const setScrolledState = useCallback((value: boolean) => setScrolled(value), [])

  const value = useMemo(
    () => ({
      activeTheme,
      setActiveTheme: setTheme,
      scrolled,
      setScrolled: setScrolledState,
    }),
    [activeTheme, setTheme, scrolled, setScrolledState],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useSectionTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useSectionTheme must be used inside a ThemeProvider')
  }
  return context
}
