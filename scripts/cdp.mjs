/**
 * Headless Chrome driver over the DevTools Protocol.
 *
 * Gives accurate control of the viewport size and can evaluate JavaScript in
 * the page, which the desktop browser tool cannot do at arbitrary widths.
 *
 * Usage:
 *   node scripts/cdp.mjs eval <url> <width> <height> "<expression>"
 *   node scripts/cdp.mjs shot <url> <width> <height> <outfile>
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const [, , command, url, widthArg, heightArg, ...rest] = process.argv

const width = Number(widthArg ?? 1440)
const height = Number(heightArg ?? 900)
const profileDir = path.join(os.tmpdir(), 'opencode', `cdp-${process.pid}`)

fs.rmSync(profileDir, { recursive: true, force: true })
fs.mkdirSync(profileDir, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profileDir}`,
    `--window-size=${width},${height}`,
    '--remote-debugging-port=0',
    'about:blank',
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
)

/** Read the DevTools endpoint from stderr. */
const wsUrl = await new Promise((resolve, reject) => {
  let buffer = ''
  const onData = (chunk) => {
    buffer += chunk.toString()
    const match = buffer.match(/ws:\/\/[^\s]+/)
    if (match) resolve(match[0])
  }
  chrome.stderr.on('data', onData)
  chrome.on('exit', (code) => reject(new Error(`Chrome exited (${code})`)))
  setTimeout(() => reject(new Error('Timed out waiting for DevTools')), 20000)
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

function send(method, params = {}, sessionId) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })
}

// Attach to the page target.
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
}, sessionId)

await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)

await send('Page.navigate', { url }, sessionId)

// Wait for load.
await new Promise((resolve) => {
  const timer = setTimeout(resolve, 12000)
  const handler = (event) => {
    const message = JSON.parse(event.data)
    if (message.method === 'Page.loadEventFired' && message.sessionId === sessionId) {
      clearTimeout(timer)
      socket.removeEventListener('message', handler)
      resolve()
    }
  }
  socket.addEventListener('message', handler)
})

// Give 3D scenes time to compile shaders and render.
await new Promise((resolve) => setTimeout(resolve, 3500))

if (command === 'eval') {
  const expression = rest.join(' ')
  const result = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  )
  if (result.exceptionDetails) {
    console.error(
      'EXCEPTION:',
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text,
    )
  }
  const value = result.result?.value
  console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 1))
} else if (command === 'clickshot') {
  // Click a selector, wait, then capture — all in one session so the state
  // change is reflected in the screenshot.
  const selector = rest[0]
  const out = rest[1]
  const waitMs = Number(rest[2] ?? 1500)

  await send(
    'Runtime.evaluate',
    {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return 'not found';
        el.click();
        return 'clicked';
      })()`,
      returnByValue: true,
    },
    sessionId,
  )
  await new Promise((resolve) => setTimeout(resolve, waitMs))

  const { data } = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false },
    sessionId,
  )
  fs.writeFileSync(out, Buffer.from(data, 'base64'))
  console.log(out)
} else if (command === 'shot') {
  const out = rest[0]
  const { data } = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false },
    sessionId,
  )
  fs.writeFileSync(out, Buffer.from(data, 'base64'))
  console.log(out)
}

socket.close()
chrome.kill()
// The profile directory may still be held by Chrome on Windows; it is a
// temporary directory, so a failed cleanup is not fatal.
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
