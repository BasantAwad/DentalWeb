'use client'

import { useGLTF } from '@react-three/drei'
import AssetModel from './AssetModel'
import AssetErrorBoundary from './AssetErrorBoundary'
import { DentalChairPlaceholder, PhantomHeadPlaceholder } from './ProceduralPlaceholders'
import type { ModelAssetConfig } from '@/lib/3d/assets'
/**
 * Renders a registered asset, degrading gracefully:
 *   GLB available  → loaded model with repaired normals/materials
 *   GLB missing    → procedural placeholder geometry
 *   Both fail      → static poster (handled by the caller's fallback)
 */
export default function ShowcaseModel({
  asset,
  procedural,
  onError,
  onLoaded,
}: {
  asset: ModelAssetConfig
  procedural: 'chair' | 'phantom-head'
  onError?: (error: unknown) => void
  onLoaded?: () => void
}) {
  const fallbackGeometry =
    procedural === 'chair' ? <DentalChairPlaceholder /> : <PhantomHeadPlaceholder />

  // The composed procedural scene is used until the authored GLB is approved.
  if (asset.renderMode !== 'gltf' || !asset.src) {
    return <group>{fallbackGeometry}</group>
  }

  return (
    <AssetErrorBoundary
      fallback={<group>{fallbackGeometry}</group>}
      onError={(error) => {
        onError?.(error)
      }}
    >
      <AssetModel asset={asset} onError={onError} onLoaded={onLoaded} />
    </AssetErrorBoundary>
  )
}

/**
 * Preload a model before it enters the viewport.
 * Uses drei's static preload helper so the fetch starts early without
 * violating the rules of hooks.
 */
export function preloadAsset(src: string | null) {
  if (src) useGLTF.preload(src)
}
