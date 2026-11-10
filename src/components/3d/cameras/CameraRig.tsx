'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'

export interface CameraKeyframe {
  position: Vector3Tuple
  target: Vector3Tuple
  fov?: number
}

interface CameraRigProps {
  keyframes: CameraKeyframe[]
  /** 0 → 1 scroll progress driving the keyframe interpolation. */
  progress: { current: number }
  /** Pointer parallax amplitude in world units. */
  parallax?: number
  /** Damping factor — higher is snappier. */
  damping?: number
  enabled?: boolean
}

const _pos = new THREE.Vector3()
const _target = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()
const _pointer = new THREE.Vector2()

/**
 * Scroll-driven camera choreography.
 *
 * Interpolates between configured keyframes as scroll progresses, then damps
 * toward the result so the movement feels like camera equipment rather than
 * a snapping viewport change. Fully reversible.
 */
export default function CameraRig({
  keyframes,
  progress,
  parallax = 0,
  damping = 3.2,
  enabled = true,
}: CameraRigProps) {
  const { camera, size } = useThree()
  const pointerTarget = useRef(new THREE.Vector2())
  const current = useRef(new THREE.Vector3())
  const currentLook = useRef(new THREE.Vector3())
  const initialised = useRef(false)

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      )
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useFrame((_, delta) => {
    const frames = keyframes
    if (frames.length === 0) return

    const p = enabled ? Math.min(1, Math.max(0, progress.current)) : 0
    const scaled = p * (frames.length - 1)
    const index = Math.min(frames.length - 2, Math.floor(scaled))
    const local = scaled - index
    // Smoothstep between keyframes keeps the motion calm.
    const eased = local * local * (3 - 2 * local)

    const a = frames[index]
    const b = frames[index + 1] ?? a

    _pos.set(
      THREE.MathUtils.lerp(a.position[0], b.position[0], eased),
      THREE.MathUtils.lerp(a.position[1], b.position[1], eased),
      THREE.MathUtils.lerp(a.position[2], b.position[2], eased),
    )
    _target.set(
      THREE.MathUtils.lerp(a.target[0], b.target[0], eased),
      THREE.MathUtils.lerp(a.target[1], b.target[1], eased),
      THREE.MathUtils.lerp(a.target[2], b.target[2], eased),
    )

    const fov = THREE.MathUtils.lerp(a.fov ?? 35, b.fov ?? 35, eased)

    // Pointer parallax — deliberately subtle, disabled on touch devices.
    _pointer.lerp(pointerTarget.current, 0.06)
    if (parallax > 0 && size.width > 900) {
      _pos.x += _pointer.x * parallax
      _pos.y += -_pointer.y * parallax * 0.6
    }

    if (!initialised.current) {
      current.current.copy(_pos)
      currentLook.current.copy(_target)
      initialised.current = true
    }

    const lambda = 1 - Math.exp(-delta * damping)
    current.current.lerp(_pos, lambda)
    currentLook.current.lerp(_target, lambda)

    camera.position.copy(current.current)
    camera.lookAt(currentLook.current)

    const perspective = camera as THREE.PerspectiveCamera
    if (perspective.isPerspectiveCamera && Math.abs(perspective.fov - fov) > 0.001) {
      perspective.fov = fov
      perspective.updateProjectionMatrix()
    }
  })

  return null
}
