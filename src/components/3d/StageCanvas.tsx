'use client'

import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import * as THREE from 'three'
import SceneFallback from './fallbacks/SceneFallback'
import { isWebGLAvailable, resolveDeviceProfile, type DeviceProfile } from '@/lib/3d/device-profile'

interface StageCanvasProps {
  children: ReactNode
  /** Static poster used while loading, on failure and for reduced motion. */
  fallback: string
  fallbackAlt: string
  /** Camera initial state before the rig takes over. */
  camera?: { position: [number, number, number]; fov: number }
  className?: string
  /** Force the static poster even when WebGL is available (reduced motion). */
  forceStatic?: boolean
  onCreated?: () => void
}

/**
 * Shared R3F canvas shell.
 *
 * Responsibilities:
 *  - Detect WebGL support and degrade to the static poster.
 *  - Respect reduced motion and the device quality tier.
 *  - Cap DPR and pause rendering when the tab is hidden.
 *  - Never block the surrounding page content.
 */
export default function StageCanvas({
  children,
  fallback,
  fallbackAlt,
  camera = { position: [2.4, 1.6, 2.8], fov: 35 },
  className,
  forceStatic = false,
  onCreated,
}: StageCanvasProps) {
  const [profile, setProfile] = useState<DeviceProfile | null>(null)
  const [webgl, setWebgl] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setProfile(resolveDeviceProfile())
    setWebgl(isWebGLAvailable())
  }, [])

  if (!profile) {
    // Before the profile resolves, render the poster so the first paint is
    // never an empty box.
    return <SceneFallback image={fallback} alt={fallbackAlt} />
  }

  if (!webgl || forceStatic || !profile.allowWebGL) {
    return <SceneFallback image={fallback} alt={fallbackAlt} />
  }

  return (
    <div className={className}>
      <Canvas
        dpr={[1, profile.maxDpr]}
        shadows={profile.shadows}
        gl={{
          antialias: profile.tier === 'desktop',
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor(0x000000, 0)
          setReady(true)
          onCreated?.()
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
        <AdaptiveDpr pixelated={false} />
        <Preload all />
      </Canvas>

      {!ready ? (
        <div className="pointer-events-none absolute inset-0">
          <SceneFallback image={fallback} alt={fallbackAlt} />
        </div>
      ) : null}
    </div>
  )
}
