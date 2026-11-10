/**
 * Offline composition check for a 3D asset.
 *
 * Renders the asset's silhouette against a camera frame so framing, scale
 * and grounding can be validated without a browser.
 *
 * Usage: node scripts/check-composition.mjs
 */
import * as THREE from 'three'

/**
 * Mirrors the geometry authored in src/components/3d/models/ProceduralPlaceholders.tsx
 * as boxes, so the framing can be checked numerically.
 */
const BOXES = {
  chair: [
    // [x, y, z, w, h, d] — pedestal + column
    [0, 0.028, 0, 0.72, 0.055, 0.72],
    [0, 0.075, 0, 0.54, 0.05, 0.54],
    [0, 0.29, 0, 0.19, 0.42, 0.19],
    [0, 0.47, 0, 0.26, 0.1, 0.26],
    // seat
    [0, 0.52, 0.04, 0.58, 0.15, 0.5],
    // backrest (approximated in the reclined frame)
    [0, 0.78, -0.28, 0.54, 0.58, 0.1],
    // headrest
    [0, 0.9, -0.37, 0.27, 0.16, 0.09],
    // armrests
    [-0.325, 0.62, 0.08, 0.06, 0.045, 0.4],
    [0.325, 0.62, 0.08, 0.06, 0.045, 0.4],
    // footrest
    [0, 0.46, 0.44, 0.44, 0.075, 0.28],
    // delivery arm + head
    [0.36, 0.84, -0.06, 0.06, 0.52, 0.06],
    [0.19, 1.1, 0.16, 0.14, 0.09, 0.17],
    // operating light
    [-0.26, 0.86, -0.28, 0.04, 0.48, 0.04],
    [-0.3, 1.09, -0.18, 0.19, 0.085, 0.17],
    // instrument tray
    [-0.33, 0.62, 0.16, 0.24, 0.018, 0.17],
  ],
  'phantom-head': [
    [0, 0.018, 0, 0.88, 0.036, 0.52],
    [0, 0.085, 0, 0.124, 0.1, 0.124],
    [0, 0.145, 0, 0.08, 0.08, 0.08],
    [0, 0.225, 0, 0.05, 0.11, 0.05],
    [0, 0.31, 0, 0.11, 0.11, 0.11],
    [0, 0.56, 0, 0.33, 0.38, 0.34],
    [0, 0.414, 0.052, 0.22, 0.22, 0.22],
  ],
}

const SCENES = {
  'hero-desktop': {
    boxes: 'chair',
    offset: [1.45, 0, 0],
    camera: { position: [2.4, 1.35, 3.9], target: [0.4, 0.44, 0], fov: 34 },
    textColumn: 0.5, // the headline occupies the left half
    aspect: 1.6, // 1440 × 900
  },
  'hero-desktop-settled': {
    boxes: 'chair',
    offset: [1.45, 0, 0],
    camera: { position: [2.15, 1.22, 3.6], target: [0.35, 0.42, 0], fov: 31 },
    textColumn: 0.5,
    aspect: 1.6,
  },
  'hero-tablet': {
    boxes: 'chair',
    offset: [1.15, 0, 0],
    camera: { position: [2.35, 1.6, 4.05], target: [0.3, 0.3, 0], fov: 36 },
    textColumn: 0,
    aspect: 1.167, // 902 × 773
  },
  'hero-mobile': {
    boxes: 'chair',
    offset: [0, 0, 0],
    camera: { position: [2.1, 1.6, 4.2], target: [0, 0.22, 0], fov: 40 },
    textColumn: 0,
    aspect: 0.46, // 390 × 844
  },
  'service-chair': {
    boxes: 'chair',
    offset: [0, 0, 0],
    camera: { position: [1.95, 1.42, 2.32], target: [0, 0.55, 0], fov: 31 },
    textColumn: 0,
    aspect: 1.25, // 5:4 frame
  },
  'service-chair-settled': {
    boxes: 'chair',
    offset: [0, 0, 0],
    camera: { position: [1.82, 1.34, 2.18], target: [0, 0.53, 0], fov: 30 },
    textColumn: 0,
    aspect: 1.25,
  },
  'service-phantom': {
    boxes: 'phantom-head',
    offset: [0, 0, 0],
    camera: { position: [0.66, 0.8, 1.06], target: [0, 0.55, 0], fov: 30 },
    textColumn: 0,
    aspect: 1.25,
    // The stand and base crop out of frame by design; only the head is framed.
    subject: 'head',
  },
  'service-phantom-settled': {
    boxes: 'phantom-head',
    offset: [0, 0, 0],
    camera: { position: [0.64, 0.78, 1.03], target: [0, 0.545, 0], fov: 30 },
    textColumn: 0,
    aspect: 1.25,
    subject: 'head',
  },
}

const ASPECT = 16 / 9

function analyse(name) {
  const scene = SCENES[name]
  const aspect = scene.aspect ?? ASPECT
  const boxes = BOXES[scene.boxes]

  const camera = new THREE.PerspectiveCamera(
    scene.camera.fov,
    aspect,
    0.1,
    100,
  )
  camera.position.set(...scene.camera.position)
  camera.lookAt(new THREE.Vector3(...scene.camera.target))
  camera.updateMatrixWorld(true)

  // Project the actual box corners rather than one overall AABB. The AABB
  // corners of a wide, flat object can sit well outside the visible silhouette
  // and would report a false crop.
  let ndcMinX = Infinity
  let ndcMaxX = -Infinity
  let ndcMinY = Infinity
  let ndcMaxY = -Infinity

  for (const [cx, cy, cz, w, h, d] of boxes) {
    // When a subject is named, only that part is framed and measured.
    if (scene.subject === 'head' && cy < 0.35) continue
    const ox = cx + scene.offset[0]
    const oy = cy + scene.offset[1]
    const oz = cz + scene.offset[2]
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const v = new THREE.Vector3(
            ox + (sx * w) / 2,
            oy + (sy * h) / 2,
            oz + (sz * d) / 2,
          ).project(camera)
          ndcMinX = Math.min(ndcMinX, v.x)
          ndcMaxX = Math.max(ndcMaxX, v.x)
          ndcMinY = Math.min(ndcMinY, v.y)
          ndcMaxY = Math.max(ndcMaxY, v.y)
        }
      }
    }
  }

  // Overall bounds, for the record.
  const min = new THREE.Vector3(Infinity, Infinity, Infinity)
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity)
  for (const [cx, cy, cz, w, h, d] of boxes) {
    min.min(new THREE.Vector3(cx + scene.offset[0] - w / 2, cy + scene.offset[1] - h / 2, cz + scene.offset[2] - d / 2))
    max.max(new THREE.Vector3(cx + scene.offset[0] + w / 2, cy + scene.offset[1] + h / 2, cz + scene.offset[2] + d / 2))
  }

  // Screen-space coverage of the asset.
  const widthPct = (ndcMaxX - ndcMinX) * 50
  const heightPct = (ndcMaxY - ndcMinY) * 50
  const rightEdgePct = (ndcMaxX + 1) * 50
  const leftEdgePct = (ndcMinX + 1) * 50

  // The boxes are axis-aligned approximations, so their corners project
  // further out than the real silhouette when the object is viewed at an
  // angle. A small overhang is a deliberate product-shot crop, not a defect;
  // only a significant overhang means the framing is wrong.
  const TOLERANCE = 0.06
  const overhang = Math.max(
    0,
    ndcMaxX - 1,
    -1 - ndcMinX,
    ndcMaxY - 1,
    -1 - ndcMinY,
  )

  console.log(`\n=== ${name} ===`)
  console.log(
    `asset bounds   x[${min.x.toFixed(2)}, ${max.x.toFixed(2)}] ` +
      `y[${min.y.toFixed(2)}, ${max.y.toFixed(2)}] z[${min.z.toFixed(2)}, ${max.z.toFixed(2)}]`,
  )
  console.log(
    `screen coverage  width ${widthPct.toFixed(1)}%  height ${heightPct.toFixed(1)}%`,
  )
  console.log(
    `horizontal span  ${leftEdgePct.toFixed(1)}% … ${rightEdgePct.toFixed(1)}% (0% = left edge)`,
  )
  console.log(
    `grounded         ${Math.abs(min.y - scene.offset[1]) < 0.001 ? 'yes' : `no (min.y=${min.y.toFixed(3)})`}`,
  )
  const offscreen = overhang > TOLERANCE
  console.log(
    `offscreen        ${
      offscreen
        ? `YES — ${(overhang * 50).toFixed(1)}% beyond the frame`
        : overhang > 0
          ? `no — ${(overhang * 50).toFixed(1)}% deliberate crop`
          : 'no'
    }`,
  )

  // Collision with the text column.
  const textColumn = scene.textColumn ?? 0
  let collision = 'n/a'
  if (textColumn > 0) {
    const overlaps = leftEdgePct < textColumn * 100
    collision = overlaps
      ? `YES — asset starts at ${leftEdgePct.toFixed(1)}%, text runs to ${(textColumn * 100).toFixed(0)}%`
      : `no — clear of the text column`
  }
  console.log(`text collision   ${collision}`)

  console.log(
    `recommendation   ${
      offscreen
        ? 'pull the camera back or widen the fov'
        : collision.startsWith('YES')
          ? 'shift the asset right or pull the camera back'
          : widthPct > 80
            ? 'fills the frame — reduce size for more negative space'
            : widthPct < 22
              ? 'too small in frame — move the camera closer'
              : 'good'
    }`,
  )
}

console.log('DentalWeb — 3D composition check')
for (const name of Object.keys(SCENES)) analyse(name)
