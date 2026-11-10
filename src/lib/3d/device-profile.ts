'use client'

import { useEffect, useState } from 'react'

/**
 * Detects the rendering tier for 3D scenes.
 *
 * Desktop  — full quality: shadows, high DPR, full camera choreography.
 * Tablet   — reduced DPR, simpler shadows, simplified transitions.
 * Mobile   — lowest cost tier: the viewer may fall back to a static poster.
 */
export type DeviceTier = 'desktop' | 'tablet' | 'mobile'

export interface DeviceProfile {
  tier: DeviceTier
  /** Device pixel ratio ceiling for the renderer. */
  maxDpr: number
  /** Whether real-time shadows are worth their cost on this device. */
  shadows: boolean
  /** Whether scroll-driven camera choreography should run. */
  scrollChoreography: boolean
  /** Whether the 3D viewer is worth loading at all. */
  allowWebGL: boolean
}

export function resolveDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return {
      tier: 'desktop',
      maxDpr: 2,
      shadows: true,
      scrollChoreography: true,
      allowWebGL: true,
    }
  }

  const width = window.innerWidth
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let tier: DeviceTier = 'desktop'
  if (width < 768) tier = 'mobile'
  else if (width < 1280) tier = 'tablet'

  const constrained = memory <= 4 || cores <= 4

  return {
    tier,
    maxDpr: tier === 'desktop' ? 2 : tier === 'tablet' ? 1.5 : 1.25,
    shadows: tier === 'desktop' && !constrained,
    scrollChoreography: tier !== 'mobile' && !reducedMotion,
    allowWebGL: !constrained || tier === 'desktop',
  }
}

/**
 * React hook returning the resolved device profile.
 * Returns `null` until mounted so server and client markup match.
 */
export function useDeviceProfile(): DeviceProfile | null {
  const [profile, setProfile] = useState<DeviceProfile | null>(null)

  useEffect(() => {
    setProfile(resolveDeviceProfile())
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setProfile(resolveDeviceProfile()))
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return profile
}

/** True when the visitor asked for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Detects whether a WebGL context can be created at all. */
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}
