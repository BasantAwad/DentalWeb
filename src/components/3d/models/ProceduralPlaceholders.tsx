'use client'

/**
 * Procedural placeholder geometry.
 *
 * These are deliberately composed stand-ins, not the final dental equipment.
 * They exist so the scene is never empty and never depends on an asset that
 * has not been delivered yet. Replace them by setting `renderMode: 'gltf'`
 * in `src/lib/3d/assets.ts`; no scene code changes are required.
 *
 * Silhouettes and proportions follow real equipment so the framing, scale and
 * lighting can be validated before the authored models arrive.
 *
 * Palette is drawn from the approved design tokens so the placeholder sits
 * inside the brand rather than fighting it.
 */

const UPHOLSTERY = '#DCD8CE'
const UPHOLSTERY_LIGHT = '#EAE6DC'
const SHELL = '#EDE9E0'
const GRAPHITE = '#2B322F'
const GRAPHITE_LIGHT = '#454E49'
const METAL = '#A8B0AA'
const TEAL = '#2F7772'

interface MaterialProps {
  color: string
  roughness?: number
  metalness?: number
  clearcoat?: number
}

function Mat({ color, roughness = 0.55, metalness = 0.05, clearcoat = 0 }: MaterialProps) {
  if (clearcoat > 0) {
    return (
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={0.18}
        envMapIntensity={1.1}
      />
    )
  }
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      envMapIntensity={1}
    />
  )
}

/**
 * Placeholder dental chair.
 *
 * Built as a composed product: pedestal, lift column, seat pan, reclined
 * backrest, headrest, armrests, delivery arm, operating light and footrest.
 */
export function DentalChairPlaceholder() {
  return (
    <group>
      {/* Pedestal */}
      <mesh position={[0, 0.026, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.29, 0.35, 0.052, 48]} />
        <Mat color={GRAPHITE} roughness={0.42} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.26, 0.045, 48]} />
        <Mat color={GRAPHITE_LIGHT} roughness={0.46} metalness={0.2} />
      </mesh>

      {/* Lift column */}
      <mesh position={[0, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.42, 32]} />
        <Mat color={METAL} roughness={0.32} metalness={0.72} />
      </mesh>
      <mesh position={[0, 0.47, 0]} castShadow>
        <cylinderGeometry args={[0.125, 0.125, 0.095, 32]} />
        <Mat color={GRAPHITE} roughness={0.42} metalness={0.24} />
      </mesh>

      {/* Seat pan */}
      <group position={[0, 0.52, 0.04]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.58, 0.1, 0.5]} />
          <Mat color={SHELL} roughness={0.42} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.065, 0]} castShadow>
          <boxGeometry args={[0.53, 0.05, 0.45]} />
          <Mat color={UPHOLSTERY_LIGHT} roughness={0.68} />
        </mesh>
        {/* Teal seam - a small brand detail */}
        <mesh position={[0, 0.005, 0.235]}>
          <boxGeometry args={[0.5, 0.012, 0.018]} />
          <Mat color={TEAL} roughness={0.5} />
        </mesh>
      </group>

      {/* Backrest, reclined */}
      <group position={[0, 0.56, -0.21]} rotation={[-0.28, 0, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.54, 0.58, 0.1]} />
          <Mat color={SHELL} roughness={0.42} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.28, 0.056]} castShadow>
          <boxGeometry args={[0.49, 0.52, 0.035]} />
          <Mat color={UPHOLSTERY_LIGHT} roughness={0.68} />
        </mesh>
      </group>

      {/* Headrest */}
      <group position={[0, 0.845, -0.32]} rotation={[-0.28, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.27, 0.16, 0.09]} />
          <Mat color={UPHOLSTERY} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.1, -0.02]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.07, 10]} />
          <Mat color={METAL} roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Armrests */}
      {[-0.325, 0.325].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.62, 0.08]} castShadow>
            <boxGeometry args={[0.06, 0.045, 0.4]} />
            <Mat color={GRAPHITE} roughness={0.45} metalness={0.2} />
          </mesh>
          <mesh position={[x, 0.56, 0.24]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.13, 12]} />
            <Mat color={METAL} roughness={0.32} metalness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Footrest */}
      <group position={[0, 0.42, 0.4]} rotation={[0.46, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.44, 0.075, 0.28]} />
          <Mat color={SHELL} roughness={0.42} clearcoat={0.4} />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.4, 0.04, 0.24]} />
          <Mat color={UPHOLSTERY_LIGHT} roughness={0.68} />
        </mesh>
      </group>

      {/* Delivery arm, rising from the right of the seat and arcing over */}
      <group position={[0.31, 0.5, -0.1]} rotation={[0, 0, -0.16]}>
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.03, 0.14, 12]} />
          <Mat color={GRAPHITE} roughness={0.4} metalness={0.3} />
        </mesh>
        <group position={[0, 0.14, 0]} rotation={[0.86, 0, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.32, 10]} />
            <Mat color={METAL} roughness={0.28} metalness={0.82} />
          </mesh>
          <group position={[0, 0.32, 0]} rotation={[-0.6, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.13, 0.085, 0.15]} />
              <Mat color={GRAPHITE} roughness={0.48} metalness={0.14} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[-0.035 + i * 0.035, -0.075, 0.01]}
                rotation={[0.2, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.007, 0.007, 0.09, 8]} />
                <Mat color={GRAPHITE_LIGHT} roughness={0.7} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Instrument tray */}
      <group position={[-0.33, 0.55, 0.16]} rotation={[0, 0.28, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 10]} />
          <Mat color={METAL} roughness={0.32} metalness={0.75} />
        </mesh>
        <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.018, 0.17]} />
          <Mat color={METAL} roughness={0.34} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.082, 0]}>
          <boxGeometry args={[0.2, 0.006, 0.13]} />
          <Mat color="#F2EFE8" roughness={0.5} />
        </mesh>
      </group>

      {/* Operating light, mounted on the backrest and arcing forward */}
      <group position={[-0.17, 0.84, -0.34]} rotation={[0, 0, 0.22]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 0.18, 12]} />
          <Mat color={GRAPHITE} roughness={0.4} metalness={0.3} />
        </mesh>
        <group position={[0, 0.18, 0]} rotation={[0.95, 0, 0]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.013, 0.013, 0.3, 10]} />
            <Mat color={METAL} roughness={0.28} metalness={0.85} />
          </mesh>
          <group position={[0, 0.3, 0]} rotation={[-0.55, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.095, 0.058, 0.09, 28]} />
              <Mat color={GRAPHITE} roughness={0.4} metalness={0.26} />
            </mesh>
            <mesh position={[0, -0.048, 0]}>
              <circleGeometry args={[0.052, 28]} />
              <meshStandardMaterial
                color="#FFFDF4"
                emissive="#FFF3D6"
                emissiveIntensity={0.8}
                roughness={0.28}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/**
 * Placeholder phantom head training unit on a counter mount.
 *
 * The head carries an open typodont with visible upper and lower arches, so
 * the object reads as a training unit rather than a generic mannequin.
 */
export function PhantomHeadPlaceholder() {
  return (
    <group>
      {/* Counter mount - a compact disc, so the head stays the subject */}
      <mesh position={[0, 0.016, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.17, 0.19, 0.032, 32]} />
        <Mat color="#C6BCAA" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.008, 32]} />
        <Mat color="#B3A996" roughness={0.64} />
      </mesh>

      {/* Mount clamp */}
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.052, 0.086, 20]} />
        <Mat color={GRAPHITE} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.13, 0]} castShadow>
        <sphereGeometry args={[0.036, 20, 16]} />
        <Mat color={GRAPHITE_LIGHT} roughness={0.32} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.023, 0.1, 14]} />
        <Mat color={METAL} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.29, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.052, 0.1, 18]} />
        <Mat color="#CFCAC0" roughness={0.6} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.55, 0]}>
        {/* Cranium - a warm off-white that separates from the porcelain
            background without reading as clinical white */}
        <mesh castShadow scale={[0.94, 1.08, 0.98]}>
          <sphereGeometry args={[0.175, 32, 24]} />
          <Mat color="#DCD6C9" roughness={0.5} />
        </mesh>

        {/* Face plane */}
        <mesh position={[0, 0.005, 0.062]} rotation={[0.14, 0, 0]} castShadow>
          <sphereGeometry args={[0.163, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <Mat color="#E7E1D4" roughness={0.46} />
        </mesh>

        {/* Brow ridge */}
        <mesh position={[0, 0.052, 0.128]} rotation={[0.24, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.026, 0.05]} />
          <Mat color="#CFC8B9" roughness={0.52} />
        </mesh>

        {/* Eye sockets */}
        {[-0.058, 0.058].map((x) => (
          <mesh key={x} position={[x, 0.018, 0.146]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.024, 14, 10]} />
            <Mat color="#8E887D" roughness={0.6} />
          </mesh>
        ))}

        {/* Nose */}
        <mesh position={[0, -0.032, 0.156]} rotation={[0.32, 0, 0]} castShadow>
          <coneGeometry args={[0.028, 0.068, 10]} />
          <Mat color="#D6CFC0" roughness={0.5} />
        </mesh>

        {/* Mouth: an open typodont with visible arches */}
        <mesh position={[0, -0.086, 0.104]} rotation={[0.1, 0, 0]} castShadow>
          <torusGeometry args={[0.088, 0.026, 10, 24, Math.PI]} />
          <Mat color="#B8706C" roughness={0.62} />
        </mesh>

        {/* Upper arch */}
        <mesh position={[0, -0.072, 0.116]} rotation={[0.42, 0, 0]} castShadow>
          <torusGeometry args={[0.082, 0.019, 10, 24, Math.PI]} />
          <Mat color="#F6F1E4" roughness={0.28} />
        </mesh>

        {/* Lower arch */}
        <mesh position={[0, -0.126, 0.112]} rotation={[-0.34, 0, 0]} castShadow>
          <torusGeometry args={[0.082, 0.019, 10, 24, Math.PI]} />
          <Mat color="#F6F1E4" roughness={0.28} />
        </mesh>

        {/* Individual upper teeth */}
        {Array.from({ length: 9 }).map((_, i) => {
          const t = (i / 8) * Math.PI - Math.PI / 2
          const r = 0.082
          return (
            <mesh
              key={i}
              position={[
                Math.sin(t) * r,
                -0.072 + Math.cos(t) * 0.03,
                0.116 + Math.cos(t) * 0.028,
              ]}
              rotation={[0.42, t, 0]}
              castShadow
            >
              <boxGeometry args={[0.019, 0.016, 0.02]} />
              <Mat color="#FFFDF8" roughness={0.24} />
            </mesh>
          )
        })}

        {/* Individual lower teeth */}
        {Array.from({ length: 9 }).map((_, i) => {
          const t = (i / 8) * Math.PI - Math.PI / 2
          const r = 0.082
          return (
            <mesh
              key={`l-${i}`}
              position={[
                Math.sin(t) * r,
                -0.126 + Math.cos(t) * 0.028,
                0.112 + Math.cos(t) * 0.026,
              ]}
              rotation={[-0.34, t, 0]}
              castShadow
            >
              <boxGeometry args={[0.018, 0.015, 0.019]} />
              <Mat color="#F2ECDE" roughness={0.26} />
            </mesh>
          )
        })}

        {/* Chin */}
        <mesh position={[0, -0.146, 0.052]} scale={[0.86, 0.7, 0.82]} castShadow>
          <sphereGeometry args={[0.108, 20, 16]} />
          <Mat color="#D5CFC0" roughness={0.54} />
        </mesh>

        {/* Face marker - the only saturated accent on the unit */}
        <mesh position={[0, -0.052, 0.176]}>
          <boxGeometry args={[0.03, 0.022, 0.012]} />
          <Mat color={TEAL} roughness={0.42} />
        </mesh>
      </group>
    </group>
  )
}
