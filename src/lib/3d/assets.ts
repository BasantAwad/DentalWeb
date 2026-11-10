/**
 * DentalWeb 3D asset registry.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS THE ONLY FILE YOU NEED TO EDIT TO SWAP IN YOUR REAL MODELS.
 *
 * Every 3D scene reads its model path, transform, camera framing and lighting
 * from this registry. Scene components contain no hard-coded mesh names, no
 * hard-coded mesh indices and no assumptions about model hierarchy.
 *
 * See ASSET_GUIDE.md for the Blender export checklist.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Vector3Tuple } from 'three'

export type AssetStatus = 'placeholder' | 'incoming' | 'approved'

/**
 * How an asset is rendered.
 *
 *   procedural — a deliberately composed stand-in built from primitives,
 *                used while the real model is not ready.
 *   gltf       — the registered GLB is loaded and rendered.
 */
export type AssetRenderMode = 'procedural' | 'gltf'

export interface ModelAssetConfig {
  /** Human label used in the UI and in the loading state. */
  label: string
  /** Public path to the GLB. `null` means "no file yet — render the fallback". */
  src: string | null
  /** Static poster rendered when WebGL or the model fails. */
  fallback: string
  /**
   * Asset lifecycle state.
   *   placeholder — temporary stand-in, never presented as final equipment
   *   incoming   — the real model is being prepared
   *   approved   — the real model is registered and ready
   */
  status: AssetStatus
  /**
   * Which representation is rendered right now.
   * Flip to 'gltf' once the authored model is registered and approved.
   */
  renderMode: AssetRenderMode
  /**
   * Uniform scale applied on top of the model's own units.
   * Leave at 1 when the model is authored in metres.
   */
  scale: number
  /** Euler rotation in radians (X, Y, Z). */
  rotation: Vector3Tuple
  /** Model-space offset applied after scale. */
  position: Vector3Tuple
  /**
   * Normalisation: if set, the model is uniformly scaled so its largest
   * dimension equals this value in world units. Use this when the source file
   * has an unknown or arbitrary unit scale (e.g. a raw mesh export).
   * Leave `null` when the model is authored in real-world metres.
   */
  normalizeToSize: number | null
  /** Centre of interest — the point the camera should frame. */
  focus: Vector3Tuple
  /** Camera framing for this asset, in world units. */
  camera: {
    position: Vector3Tuple
    target: Vector3Tuple
    fov: number
  }
  /** Lighting preset id resolved by the scene's lighting component. */
  lighting: 'studio' | 'studio-warm' | 'showcase'
  /** Accessible description of the object. */
  description: string
  /** Optional post-processing-free material tint for untextured placeholders. */
  tint?: string
}

const PLACEHOLDER_TINT = '#E6E2DA'

/**
 * Asset registry.
 *
 * ── How to swap in the real models ─────────────────────────────────────────
 * 1. Export your GLB and drop it in `public/models/<folder>/`.
 * 2. Set `src` to its public path.
 * 3. Set `renderMode: 'gltf'` and `status: 'approved'`.
 * 4. Tune `camera`, `rotation`, `scale` and `normalizeToSize` if needed.
 *
 * Nothing else changes — no scene, component or page code is touched.
 * See ASSET_GUIDE.md for the full Blender export checklist.
 *
 * NOTE on the currently supplied chair GLB: it is a raw mesh export with no
 * materials, no normals, no UVs and six disconnected components. The loader
 * repairs what it can (normals, UVs, material, grounding, centring), but the
 * silhouette is still a rough scan. It is therefore registered as a
 * placeholder and the composed procedural scene is what renders today. Flip
 * `renderMode` to 'gltf' when your authored model is ready.
 */
export const dentalAssets = {
  dentalChair: {
    label: 'Dental chair',
    src: '/models/dental-chair/dental-chair.glb',
    fallback: '/images/placeholders/dental-chair.svg',
    status: 'placeholder',
    renderMode: 'procedural',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    normalizeToSize: null,
    focus: [0, 0.55, 0],
    camera: {
      position: [2.35, 1.65, 2.75],
      target: [0, 0.5, 0],
      fov: 34,
    },
    lighting: 'studio',
    description:
      'A full dental chair with delivery arm, operating light and instrument tray, shown as a placeholder model.',
    tint: PLACEHOLDER_TINT,
  } satisfies ModelAssetConfig,

  phantomHead: {
    label: 'Phantom head',
    src: '/models/phantom-head/phantom-head.glb',
    fallback: '/images/placeholders/phantom-head.svg',
    status: 'placeholder',
    renderMode: 'procedural',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    normalizeToSize: null,
    focus: [0, 0.42, 0],
    camera: {
      position: [1.45, 1.05, 1.75],
      target: [0, 0.36, 0],
      fov: 32,
    },
    lighting: 'studio-warm',
    description:
      'A phantom head training unit with a typodont jaw mounted on an adjustable stand, shown as a placeholder model.',
    tint: '#D9D2C7',
  } satisfies ModelAssetConfig,

  /** Optional 3D room model — alternate view for the blueprint selector. */
  room: {
    label: 'Training room',
    src: null,
    fallback: '/images/placeholders/room.svg',
    status: 'placeholder',
    renderMode: 'procedural',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    normalizeToSize: null,
    focus: [0, 0.9, 0],
    camera: {
      position: [3.2, 2.6, 3.6],
      target: [0, 0.9, 0],
      fov: 38,
    },
    lighting: 'showcase',
    description: 'An alternate three-quarter view of the training room.',
  } satisfies ModelAssetConfig,

  /**
   * A single tooth, for a future 3D tooth viewer.
   *
   * The supplied file is a raw mesh export with no materials, no normals and
   * no UVs. It is registered so it can be dropped into a viewer, but the
   * tooth selector currently uses a procedural 2D typodont because a single
   * mesh cannot represent 32 independently selectable teeth.
   */
  tooth: {
    label: 'Tooth',
    src: '/models/teeth/tooth.glb',
    fallback: '/images/placeholders/tooth.svg',
    status: 'placeholder',
    renderMode: 'procedural',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    normalizeToSize: null,
    focus: [0, 0, 0],
    camera: {
      position: [0, 0.15, 0.85],
      target: [0, 0, 0],
      fov: 30,
    },
    lighting: 'studio-warm',
    description: 'A single human tooth model.',
    tint: '#F2EDE2',
  } satisfies ModelAssetConfig,
} as const

export type DentalAssetKey = keyof typeof dentalAssets

export function getAsset(key: DentalAssetKey): ModelAssetConfig {
  return dentalAssets[key] as ModelAssetConfig
}

/**
 * Station markers for the supplied blueprint.
 * Positions come from the blueprint itself (see scripts/extract-blueprint.mjs),
 * so they are never hard-coded by visual guesswork.
 */
export const BLUEPRINT_STATION_IDS = [
  'PH-01',
  'PH-02',
  'PH-03',
  'PH-04',
  'PH-05',
  'PH-06',
  'PH-07',
  'PH-08',
  'PH-09',
  'PH-10',
  'PH-11',
  'PH-12',
  'PH-13',
  'PH-14',
] as const

export type BlueprintStationId = (typeof BLUEPRINT_STATION_IDS)[number]
