/**
 * Captures a full-page screenshot by scrolling through the page and
 * stitching, or by using CDP's captureBeyondViewport.
 *
 * Usage: node scripts/cdp-full.mjs <url> <width> <height> <outfile>
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const [, , url, widthArg, heightArg, out] = process.argv

const width = Number(widthArg ?? 1440)
const height = Number(heightArg ?? 900)
const profileDir = path.join(os.tmpdir(), 'opencode', `cdpfull-${process.pid}`)

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

await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
}, sessionId)
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Page.navigate', { url }, sessionId)

await new Promise((resolve) => setTimeout(resolve, 6000))

// Scroll through the page so lazy content and scroll-triggered animation
// resolve before the capture.
await send(
  'Runtime.evaluate',
  {
    expression: `
      (async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 220));
        }
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 700));
        return document.body.scrollHeight;
      })()
    `,
    returnByValue: true,
    awaitPromise: true,
  },
  sessionId,
)

await new Promise((resolve) => setTimeout(resolve, 1500))

const { data } = await send(
  'Page.captureScreenshot',
  { format: 'png', captureBeyondViewport: true },
  sessionId,
)

fs.writeFileSync(out, Buffer.from(data, 'base64'))
console.log(out)

socket.close()
chrome.kill()
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
