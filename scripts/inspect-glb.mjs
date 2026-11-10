/**
 * Inspects a GLB's geometry offline: component breakdown, extents and a
 * coarse ASCII rendering per axis pair.
 *
 * Usage: node scripts/inspect-glb.mjs <file.glb>
 */
import fs from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/inspect-glb.mjs <file.glb>')
  process.exit(1)
}

const buffer = fs.readFileSync(file)
const jsonLength = buffer.readUInt32LE(12)
const json = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength))

let binStart = 20 + jsonLength
while (binStart % 4) binStart += 1
// The BIN chunk header (length + type) sits between the JSON chunk and data.
const binChunkStart = binStart
binStart += 8

const primitive = json.meshes[0].primitives[0]
const positionView = json.bufferViews[primitive.attributes.POSITION]
const positionAccessor = json.accessors[primitive.attributes.POSITION]
const positions = []

for (let i = 0; i < positionAccessor.count; i += 1) {
  positions.push([
    buffer.readFloatLE(binStart + positionView.byteOffset + i * 12),
    buffer.readFloatLE(binStart + positionView.byteOffset + i * 12 + 4),
    buffer.readFloatLE(binStart + positionView.byteOffset + i * 12 + 8),
  ])
}

const indices = []
if (primitive.indices !== undefined) {
  const indexView = json.bufferViews[primitive.indices]
  const indexAccessor = json.accessors[primitive.indices]
  const componentSize = indexAccessor.componentType === 5123 ? 2 : 4
  for (let i = 0; i < indexAccessor.count; i += 1) {
    indices.push(
      componentSize === 2
        ? buffer.readUInt16LE(binStart + indexView.byteOffset + i * 2)
        : buffer.readUInt32LE(binStart + indexView.byteOffset + i * 4),
    )
  }
}

const lo = [Infinity, Infinity, Infinity]
const hi = [-Infinity, -Infinity, -Infinity]
for (const v of positions) {
  for (let k = 0; k < 3; k += 1) {
    lo[k] = Math.min(lo[k], v[k])
    hi[k] = Math.max(hi[k], v[k])
  }
}

console.log(`file:            ${file}`)
console.log(`generator:       ${json.asset?.generator ?? 'unknown'}`)
console.log(`nodes:           ${json.nodes?.length ?? 0}`)
console.log(`meshes:          ${json.meshes?.length ?? 0}`)
console.log(`materials:       ${json.materials?.length ?? 0}`)
console.log(`images:          ${json.images?.length ?? 0}`)
console.log(`attributes:      ${Object.keys(primitive.attributes).join(', ')}`)
console.log(`vertices:        ${positions.length}`)
console.log(`triangles:       ${indices.length / 3}`)
console.log(`bounds min:      ${lo.map((n) => n.toFixed(3)).join(', ')}`)
console.log(`bounds max:      ${hi.map((n) => n.toFixed(3)).join(', ')}`)
console.log(`dimensions:      ${hi.map((n, k) => (n - lo[k]).toFixed(3)).join(' x ')}`)

// Connected components
const parent = new Int32Array(positions.length)
for (let i = 0; i < parent.length; i += 1) parent[i] = i
const find = (x) => {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}
const union = (a, b) => {
  const ra = find(a)
  const rb = find(b)
  if (ra !== rb) parent[ra] = rb
}
for (let t = 0; t < indices.length; t += 3) {
  union(indices[t], indices[t + 1])
  union(indices[t + 1], indices[t + 2])
}

const components = new Map()
for (let i = 0; i < positions.length; i += 1) {
  const root = find(i)
  if (!components.has(root)) components.set(root, [])
  components.get(root).push(positions[i])
}

console.log(`\ncomponents:      ${components.size}`)
const sorted = [...components.entries()].sort((a, b) => b[1].length - a[1].length)
sorted.slice(0, 10).forEach(([, verts], i) => {
  const clo = [Infinity, Infinity, Infinity]
  const chi = [-Infinity, -Infinity, -Infinity]
  for (const v of verts) {
    for (let k = 0; k < 3; k += 1) {
      clo[k] = Math.min(clo[k], v[k])
      chi[k] = Math.max(chi[k], v[k])
    }
  }
  console.log(
    `  #${i + 1} verts=${String(verts.length).padStart(5)} ` +
      `dims=${chi.map((n, k) => (n - clo[k]).toFixed(2)).join('x').padEnd(20)} ` +
      `min=${clo.map((n) => n.toFixed(2)).join(',')}`,
  )
})

function ascii(axisA, axisB, width, height) {
  const grid = Array.from({ length: height }, () => new Array(width).fill(' '))
  for (const v of positions) {
    const a = (v[axisA] - lo[axisA]) / (hi[axisA] - lo[axisA])
    const c = (v[axisB] - lo[axisB]) / (hi[axisB] - lo[axisB])
    const x = Math.min(width - 1, Math.floor(a * (width - 1)))
    const y = Math.min(height - 1, Math.floor((1 - c) * (height - 1)))
    grid[y][x] = '#'
  }
  return grid.map((row) => row.join('')).join('\n')
}

console.log('\n--- XY (front) ---\n' + ascii(0, 1, 72, 26))
console.log('\n--- XZ (top) ---\n' + ascii(0, 2, 72, 26))
console.log('\n--- YZ (side) ---\n' + ascii(2, 1, 72, 26))
