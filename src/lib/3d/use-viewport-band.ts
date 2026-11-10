'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the viewport width in coarse bands.
 *
 * 3D scenes need different framing per band (a desktop three-quarter view
 * does not work on a 390px phone), and a re-render on every pixel of resize
 * is wasteful — so the width is bucketed rather than tracked continuously.
 */
export type ViewportBand = 'mobile' | 'tablet' | 'desktop'

function resolveBand(width: number): ViewportBand {
  if (width < 768) return 'mobile'
  if (width < 1280) return 'tablet'
  return 'desktop'
}

export function useViewportBand(): ViewportBand {
  const [band, setBand] = useState<ViewportBand>('desktop')

  useEffect(() => {
    const update = () => setBand(resolveBand(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return band
}
