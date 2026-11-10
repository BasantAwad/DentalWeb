'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { ModelAssetConfig } from '@/lib/3d/assets'

/**
 * Generic, replaceable model loader.
 *
 * Design constraints (see ASSET_GUIDE.md):
 *  - No hard-coded mesh names or mesh indices.
 *  - No assumptions about the model's node hierarchy.
 *  - Missing normals / UVs / materials are repaired at load time so an
 *    intermediate export still renders correctly.
 *  - A failure at any point degrades to `onError` so the caller can render a
 *    static poster instead.
 */
export interface AssetModelProps {
  asset: ModelAssetConfig
  /** Optional override for the placeholder tint. */
  tint?: string
  onError?: (error: unknown) => void
  onLoaded?: () => void
}

/**
 * Prepares a loaded scene so it renders correctly regardless of how the
 * source file was authored:
 *  - computes vertex normals when the export omitted them
 *  - applies a physically plausible placeholder material when the export
 *    omitted materials
 *  - centres the model on its own bounding box and grounds it on the floor
 */
export function prepareScene(
  scene: THREE.Object3D,
  asset: ModelAssetConfig,
): { center: THREE.Vector3; size: THREE.Vector3 } {
  const box = new THREE.Box3().setFromObject(scene)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  // Repairs for simplified / raw exports.
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return
    const mesh = child as THREE.Mesh
    const geometry = mesh.geometry as THREE.BufferGeometry

    if (!geometry.getAttribute('normal')) {
      geometry.computeVertexNormals()
    }

    const hasUv = Boolean(geometry.getAttribute('uv'))
    const source = mesh.material as THREE.Material | THREE.Material[] | undefined
    const materials = Array.isArray(source) ? source : source ? [source] : []

    if (materials.length === 0 || materials.some((m) => !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial)) {
      const fallback = new THREE.MeshStandardMaterial({
        color: new THREE.Color(asset.tint ?? '#E6E2DA'),
        roughness: 0.62,
        metalness: 0.06,
        envMapIntensity: 0.9,
      })
      mesh.material = fallback
      mesh.castShadow = true
      mesh.receiveShadow = true
    } else {
      for (const material of materials as THREE.MeshStandardMaterial[]) {
        material.envMapIntensity = 1
        material.needsUpdate = true
      }
      mesh.castShadow = true
      mesh.receiveShadow = true
    }

    // Planar UVs are not required for the placeholder shading, but a missing
    // uv attribute makes some material shaders sample garbage. Provide zeros.
    if (!hasUv) {
      const count = geometry.getAttribute('position').count
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2))
    }
  })

  return { center, size }
}

/**
 * Loads a GLB described by the asset registry.
 * Returns null until the model is ready so callers can show a poster.
 */
export default function AssetModel({ asset, tint, onError, onLoaded }: AssetModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [prepared, setPrepared] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null)
  const gltf = useGLTF(asset.src as string)

  const effective = useMemo<ModelAssetConfig>(
    () => (tint ? { ...asset, tint } : asset),
    [asset, tint],
  )

  useEffect(() => {
    try {
      // Clone so multiple instances never share a mutated scene graph.
      const scene = gltf.scene.clone(true)
      const result = prepareScene(scene, effective)
      setPrepared(result)

      const group = groupRef.current
      if (group) {
        group.clear()

        // Normalisation: uniformly rescale so the largest dimension matches
        // the configured world size. Keeps any future export usable without
        // touching scene code.
        const largest = Math.max(result.size.x, result.size.y, result.size.z)
        const uniform =
          effective.normalizeToSize && largest > 0 ? effective.normalizeToSize / largest : 1

        const wrapper = new THREE.Group()
        wrapper.add(scene)

        // Centre the model on its bounding box, then ground it on the floor.
        scene.position.set(-result.center.x, -result.center.y, -result.center.z)
        wrapper.scale.setScalar(uniform)
        wrapper.rotation.set(
          effective.rotation[0],
          effective.rotation[1],
          effective.rotation[2],
        )
        wrapper.position.set(
          effective.position[0],
          effective.position[1],
          effective.position[2],
        )

        // Ground: shift down so the lowest point of the model sits at y = 0.
        const grounded = new THREE.Box3().setFromObject(wrapper)
        wrapper.position.y -= grounded.min.y

        group.add(wrapper)
        onLoaded?.()
      }
    } catch (error) {
      console.error(`[DentalWeb] Failed to prepare asset "${asset.label}"`, error)
      onError?.(error)
    }
  }, [gltf, effective, onError, onLoaded])

  return <group ref={groupRef} />
}
