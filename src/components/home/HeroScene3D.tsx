'use client'

import { useMemo } from 'react'
import { ContactShadows } from '@react-three/drei'
import StageCanvas from '@/components/3d/StageCanvas'
import CameraRig from '@/components/3d/cameras/CameraRig'
import StudioLighting from '@/components/3d/lighting/StudioLighting'
import ShowcaseModel from '@/components/3d/models/ShowcaseModel'
import { getAsset } from '@/lib/3d/assets'
import { useViewportBand } from '@/lib/3d/use-viewport-band'
import type { CameraKeyframe } from '@/components/3d/cameras/CameraRig'

/**
 * Scene 1 — the dental chair on an architectural studio stage.
 *
 * The camera starts composed at a three-quarter angle and settles into a
 * slightly tighter framing as the visitor scrolls. The movement is
 * scroll-driven and fully reversible.
 *
 * Framing changes per viewport band: on a phone the chair sits above the
 * headline instead of beside it.
 */
export default function HeroScene3D({
  progress,
  reducedMotion,
}: {
  progress: { current: number }
  reducedMotion: boolean
}) {
  const asset = getAsset('dentalChair')
  const band = useViewportBand()

  const keyframes = useMemo<CameraKeyframe[]>(() => {
    if (band === 'mobile') {
      // Portrait: the chair is framed high and centred, above the copy block.
      return [
        { position: [1.35, 1.75, 3.1], target: [0, 0.85, 0], fov: 42 },
        { position: [1.18, 1.6, 2.8], target: [0, 0.82, 0], fov: 40 },
      ]
    }
    if (band === 'tablet') {
      return [
        { position: [2.35, 1.6, 4.05], target: [0.3, 0.3, 0], fov: 36 },
        { position: [2.1, 1.42, 3.6], target: [0.25, 0.28, 0], fov: 33 },
      ]
    }
    return [
      // Wide three-quarter, slightly below the chair's visual centre.
      { position: [2.4, 1.5, 3.9], target: [0.4, 0.56, 0], fov: 34 },
      // Settles closer and a little higher.
      { position: [2.15, 1.32, 3.6], target: [0.35, 0.52, 0], fov: 31 },
    ]
  }, [band])

  // The chair is offset to the right on wide screens so it never collides
  // with the headline. On narrow screens it is centred and the copy sits
  // below it, so the object and the text never overlap.
  const offsetX = band === 'desktop' ? 1.45 : band === 'tablet' ? 1.15 : 0

  // On narrow screens the object occupies the upper half; the copy is
  // bottom-aligned, so the scene fades out before the text begins.
  const objectHeight = band === 'mobile' ? 'h-[46svh]' : 'h-full'

  return (
    <StageCanvas
      fallback={asset.fallback}
      fallbackAlt={asset.description}
      forceStatic={reducedMotion}
      camera={{ position: keyframes[0].position, fov: keyframes[0].fov ?? 36 }}
      className="h-full w-full"
    >
      <StudioLighting preset="studio" environment="dark" />
      <CameraRig
        keyframes={keyframes}
        progress={progress}
        parallax={band === 'desktop' ? 0.16 : 0}
        enabled={!reducedMotion}
      />
      <group position={[offsetX, 0, 0]}>
        <ShowcaseModel asset={asset} procedural="chair" />
      </group>

      <ContactShadows
        position={[offsetX, 0.001, 0]}
        opacity={0.34}
        scale={4.2}
        blur={3.2}
        far={1.6}
        resolution={512}
        color="#0B0E0D"
      />

      {/* Studio floor — large enough that its edge never enters frame. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1B201E" roughness={0.94} metalness={0} />
      </mesh>

      {/* Fog blends the floor into the section background so there is no
          horizon line. The fog colour matches the darkest point of the
          section's gradient, so the two read as one continuous surface. */}
      <fog attach="fog" args={['#171A19', 4, 15]} />
    </StageCanvas>
  )
}