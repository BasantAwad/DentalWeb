'use client'

import { Environment, Lightformer } from '@react-three/drei'

/**
 * Studio lighting presets.
 *
 * The environment is generated procedurally from lightformers — no HDR file
 * is downloaded at runtime, so the scene works offline and stays consistent
 * between light and dark sections.
 */
export type LightingPreset = 'studio' | 'studio-warm' | 'showcase'

interface StudioLightingProps {
  preset: LightingPreset
  shadows?: boolean
  /** 0 = dark section, 1 = light section. Tints the fill and bounce light. */
  environment?: 'dark' | 'light'
}

const KEY_INTENSITY: Record<LightingPreset, number> = {
  studio: 2.1,
  'studio-warm': 1.95,
  showcase: 1.6,
}

const KEY_COLOR: Record<LightingPreset, string> = {
  studio: '#FFFDF8',
  'studio-warm': '#FFF4E4',
  showcase: '#FFFFFF',
}

export default function StudioLighting({
  preset,
  shadows = true,
  environment = 'light',
}: StudioLightingProps) {
  const dark = environment === 'dark'
  const fillColor = dark ? '#BFD8D2' : '#E9F2EE'
  const bounceColor = dark ? '#2A3B38' : '#F3EFE6'

  return (
    <>
      <ambientLight intensity={dark ? 0.42 : 0.62} color={fillColor} />

      {/* Key light — soft, slightly warm, casts the grounding shadow. */}
      <directionalLight
        position={[3.4, 5.2, 3.1]}
        intensity={KEY_INTENSITY[preset]}
        color={KEY_COLOR[preset]}
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 2048 : 512}
        shadow-mapSize-height={shadows ? 2048 : 512}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
        shadow-radius={6}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Fill — cool bounce from the opposite side, keeps shadows readable. */}
      <directionalLight position={[-3.6, 2.4, 2.2]} intensity={0.55} color={fillColor} />

      {/* Rim — separates the object from the background. */}
      <directionalLight
        position={[-1.6, 2.2, -4.2]}
        intensity={dark ? 1.1 : 0.75}
        color={dark ? '#9CC6BF' : '#FFFFFF'}
      />

      {/* Ground bounce */}
      <hemisphereLight
        args={[fillColor, bounceColor, dark ? 0.4 : 0.55]}
      />

      {/* Procedural studio environment for reflections and material response. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={dark ? 1.6 : 3.2}
          color="#FFFFFF"
          position={[0, 4, 3]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[8, 8, 1]}
        />
        <Lightformer
          intensity={dark ? 1.1 : 2.1}
          color="#DCEAE4"
          position={[-4, 2, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          intensity={dark ? 0.8 : 1.4}
          color={dark ? '#5E7E78' : '#F3EFE6'}
          position={[4, 1.5, -2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[6, 6, 1]}
        />
        <Lightformer
          intensity={0.9}
          color="#FFFFFF"
          position={[0, -2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 8, 1]}
        />
      </Environment>
    </>
  )
}
