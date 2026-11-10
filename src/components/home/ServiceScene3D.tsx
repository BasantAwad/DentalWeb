'use client'

import { useMemo, useState } from 'react'
import { ContactShadows } from '@react-three/drei'
import StageCanvas from '@/components/3d/StageCanvas'
import CameraRig from '@/components/3d/cameras/CameraRig'
import StudioLighting from '@/components/3d/lighting/StudioLighting'
import ShowcaseModel from '@/components/3d/models/ShowcaseModel'
import { getAsset } from '@/lib/3d/assets'
import type { RentalServiceKey } from '@/lib/pricing'
import type { CameraKeyframe } from '@/components/3d/cameras/CameraRig'

/**
 * Scene 2 — the service object.
 *
 * Each service gets its own camera framing and lighting preset so the two
 * read as separate product compositions rather than one repeated card.
 */
export default function ServiceScene3D({
  serviceKey,
  progress,
  reducedMotion,
  onError,
}: {
  serviceKey: RentalServiceKey
  progress: { current: number }
  reducedMotion: boolean
  onError?: () => void
}) {
  const [failed, setFailed] = useState(false)
  const isChair = serviceKey === 'dental-chair'
  const asset = getAsset(isChair ? 'dentalChair' : 'phantomHead')

  const keyframes = useMemo<CameraKeyframe[]>(
    () =>
      isChair
        ? [
            { position: [1.95, 1.42, 2.32], target: [0, 0.55, 0], fov: 31 },
            { position: [1.82, 1.34, 2.18], target: [0, 0.53, 0], fov: 30 },
          ]
        : [
            // A product close-up on the head and typodont. The stand and base
            // deliberately crop out of frame.
            { position: [0.66, 0.8, 1.06], target: [0, 0.55, 0], fov: 30 },
            { position: [0.64, 0.78, 1.03], target: [0, 0.545, 0], fov: 30 },
          ],
    [isChair],
  )

  return (
    <StageCanvas
      fallback={asset.fallback}
      fallbackAlt={asset.description}
      forceStatic={reducedMotion || failed}
      camera={{ position: keyframes[0].position, fov: keyframes[0].fov ?? 34 }}
      className="h-full w-full"
    >
      <StudioLighting preset={isChair ? 'studio' : 'studio-warm'} environment="light" />
      <CameraRig
        keyframes={keyframes}
        progress={progress}
        parallax={0.1}
        enabled={!reducedMotion}
      />

      {/* The phantom head sits on a bench, so it is raised to sit at the same
          visual height as the chair's seat. */}
      <group position={[0, isChair ? 0 : 0.06, 0]}>
        <ShowcaseModel
          asset={asset}
          procedural={isChair ? 'chair' : 'phantom-head'}
          onError={() => {
            setFailed(true)
            onError?.()
          }}
        />
      </group>

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.4}
        scale={4}
        blur={2.4}
        far={1.8}
        resolution={512}
        color="#202522"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#E7E4DC" roughness={0.9} metalness={0} />
      </mesh>

      {/* Fog blends the floor into the section background so there is no
          visible horizon line inside the framed object. */}
      <fog attach="fog" args={['#FFFFFF', 3.5, 12]} />
    </StageCanvas>
  )
}
