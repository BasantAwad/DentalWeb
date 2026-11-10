'use client'

import { useMemo, useState } from 'react'
import { ContactShadows } from '@react-three/drei'
import StageCanvas from '@/components/3d/StageCanvas'
import CameraRig from '@/components/3d/cameras/CameraRig'
import StudioLighting from '@/components/3d/lighting/StudioLighting'
import ShowcaseModel from '@/components/3d/models/ShowcaseModel'
import type { ModelAssetConfig } from '@/lib/3d/assets'
import type { CameraKeyframe } from '@/components/3d/cameras/CameraRig'

/**
 * The 3D stage on a dedicated service page.
 *
 * The object is the protagonist here: it fills most of the frame and the
 * camera makes a slow, continuous orbit so the page feels alive while the
 * copy stays still.
 */
export default function ServiceStageCanvas({
  asset,
  isChair,
  offsetX = 0,
  reducedMotion = false,
  onError,
}: {
  asset: ModelAssetConfig
  isChair: boolean
  offsetX?: number
  reducedMotion?: boolean
  onError?: () => void
}) {
  const [failed, setFailed] = useState(false)

  const keyframes = useMemo<CameraKeyframe[]>(
    () =>
      isChair
        ? [
            { position: [2.5, 1.7, 3.0], target: [0, 0.5, 0], fov: 34 },
            { position: [1.9, 1.42, 2.5], target: [0, 0.46, 0], fov: 31 },
          ]
        : [
            { position: [1.8, 1.1, 2.4], target: [0, 0.5, 0], fov: 32 },
            { position: [1.45, 0.98, 2.0], target: [0, 0.48, 0], fov: 30 },
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
      <StudioLighting
        preset={isChair ? 'studio' : 'studio-warm'}
        environment={isChair ? 'dark' : 'light'}
      />
      <CameraRig
        keyframes={keyframes}
        progress={{ current: 0 }}
        parallax={0.12}
        enabled={false}
      />

      <group position={[offsetX, 0, 0]}>
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
        position={[offsetX, 0.001, 0]}
        opacity={0.45}
        scale={4.2}
        blur={2.4}
        far={1.9}
        resolution={512}
        color={isChair ? '#0B0E0D' : '#202522'}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={isChair ? '#1B201E' : '#E7E4DC'}
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      <fog
        attach="fog"
        args={isChair ? ['#171A19', 4, 15] : ['#FFFFFF', 3.5, 12]}
      />
    </StageCanvas>
  )
}
