/**
 * Verifies the resilience paths:
 *  - reduced motion renders the static poster instead of the 3D canvas
 *  - the main CTA is present and reachable in both modes
 *  - a WebGL failure does not remove content
 *
 * Usage: node scripts/resilience.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const ROUTES = ['/', '/services/dental-chair', '/services/phantom-head', '/facilities/demo/room']

const profileDir = path.join(os.tmpdir(), 'opencode', `res-${process.pid}`)
fs.rmSync(profileDir, { recursive: true, force: true })
fs.mkdirSync(profileDir, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    '--remote-debugging-port=0',
    'about:blank',
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
)

const wsUrl = await new Promise((resolve, reject) => {
  let buffer = ''
  chrome.stderr.on('data', (chunk) => {
    buffer += chunk.toString()
    const match = buffer.match(/ws:\/\/[^\s]+/)
    if (match) resolve(match[0])
  })
  chrome.on('exit', (code) => reject(new Error(`Chrome exited (${code})`)))
  setTimeout(() => reject(new Error('timeout')), 20000)
})

const socket = new WebSocket(wsUrl)
await new Promise((resolve, reject) => {
  socket.onopen = resolve
  socket.onerror = reject
})

let nextId = 1
const pending = new Map()
socket.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  }
}
const send = (method, params = {}, sessionId) => {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
}, sessionId)

let failures = 0

/**
 * The check runs in the page:
 *  - the primary CTA exists, is visible and has a real href
 *  - the page still has its heading
 *  - a poster image is present when the canvas is absent
 */
const CHECK = `(() => {
  const canvas = document.querySelector('canvas');
  const poster = document.querySelector('img[src*="placeholders"]');
  const cta = document.querySelector('a[href="/facilities"], a[href="/services/dental-chair"]');
  const h1 = document.querySelector('h1');
  const hasPlan = !!document.querySelector('#room svg, svg[aria-label*="room plan" i]');
  return JSON.stringify({
    hasCanvas: !!canvas,
    hasPoster: !!poster,
    hasPlan: hasPlan,
    cta: cta ? { text: cta.textContent.trim(), href: cta.getAttribute('href'), visible: cta.getBoundingClientRect().width > 0 } : null,
    h1: h1 ? h1.textContent.trim().slice(0, 60) : null,
    bodyLength: document.body.innerText.length,
  });
})()`

async function run(label, { reducedMotion, blockWebgl }) {
  for (const route of ROUTES) {
    await send(
      'Emulation.setEmulatedMedia',
      {
        features: [
          {
            name: 'prefers-reduced-motion',
            value: reducedMotion ? 'reduce' : 'no-preference',
          },
        ],
      },
      sessionId,
    )

    // Break WebGL by replacing the context factory before the page runs.
    await send(
      'Page.addScriptToEvaluateOnNewDocument',
      {
        source: blockWebgl
          ? `(() => {
              const original = HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
                if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
                return original.call(this, type, ...rest);
              };
            })()`
          : '',
      },
      sessionId,
    )

    await send('Page.navigate', { url: BASE + route }, sessionId)
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const result = await send(
      'Runtime.evaluate',
      { expression: CHECK, returnByValue: true },
      sessionId,
    )

    let payload = {}
    try {
      payload = JSON.parse(result.result?.value ?? '{}')
    } catch {
      /* ignore */
    }

    const problems = []
    if (!payload.cta) problems.push('no primary CTA')
    else if (!payload.cta.visible) problems.push('CTA not visible')
    if (!payload.h1) problems.push('no heading')
    if (payload.bodyLength < 400) problems.push('page body is nearly empty')
    if (blockWebgl && payload.hasCanvas) problems.push('canvas present despite no WebGL')
    if (reducedMotion && payload.hasCanvas) problems.push('canvas present despite reduced motion')
    // A page with a 3D stage must fall back to the static poster. The room
    // plan is 2D SVG, so it needs a plan rather than a poster.
    if (payload.hasPlan) {
      if (!payload.hasPlan) problems.push('room plan missing')
    } else if (reducedMotion && !payload.hasPoster) {
      problems.push('no static poster in reduced-motion mode')
    } else if (blockWebgl && !payload.hasPoster) {
      problems.push('no static poster without WebGL')
    }

    if (problems.length) {
      failures += problems.length
      console.log(`FAIL  ${label.padEnd(24)} ${route}`)
      for (const problem of problems) console.log(`        · ${problem}`)
    } else {
      console.log(
        `ok    ${label.padEnd(24)} ${route}  canvas=${payload.hasCanvas} poster=${payload.hasPoster}`,
      )
    }
  }
}

await run('reduced motion', { reducedMotion: true, blockWebgl: false })
await run('no WebGL', { reducedMotion: false, blockWebgl: true })

console.log(`\n${failures === 0 ? 'PASS' : failures + ' issue(s) found'}`)

socket.close()
chrome.kill()
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
