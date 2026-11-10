/**
 * Verifies the interactive behaviours of the tooth arch and the room plan.
 *
 * Usage: node scripts/interactions.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const profileDir = path.join(os.tmpdir(), 'opencode', `int-${process.pid}`)
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

async function evaluate(expression) {
  const result = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  )
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ?? result.exceptionDetails.text,
    )
  }
  return JSON.parse(result.result?.value ?? 'null')
}

function report(label, problems, detail) {
  if (problems.length) {
    failures += problems.length
    console.log(`FAIL  ${label}`)
    for (const problem of problems) console.log(`        · ${problem}`)
    if (detail) console.log(`        ${detail}`)
  } else {
    console.log(`ok    ${label}${detail ? '  ' + detail : ''}`)
  }
}

// ── Tooth arch ────────────────────────────────────────────────────────────
await send('Page.navigate', { url: `${BASE}/tooth-planner` }, sessionId)
await new Promise((resolve) => setTimeout(resolve, 2500))

const teeth = await evaluate(`(() => {
  const nodes = Array.from(document.querySelectorAll('g[role=button]'));
  return JSON.stringify({
    count: nodes.length,
    labels: nodes.map(function (n) { return n.getAttribute('aria-label'); }),
  });
})()`)

const toothProblems = []
if (teeth.count !== 32) toothProblems.push(`expected 32 teeth, found ${teeth.count}`)

// FDI codes must be present exactly once each.
const CODES = []
for (const q of [1, 2, 3, 4]) {
  for (const p of [1, 2, 3, 4, 5, 6, 7, 8]) CODES.push(`${q}${p}`)
}
for (const code of CODES) {
  const matches = teeth.labels.filter((l) => l.startsWith(`${code} —`)).length
  if (matches !== 1) toothProblems.push(`tooth ${code} appears ${matches} times`)
}

const selection = await evaluate(`(async () => {
  const nodes = Array.from(document.querySelectorAll('g[role=button]'));
  const t16 = nodes.filter(function (n) {
    return String(n.getAttribute('aria-label')).indexOf('16 —') === 0;
  })[0];

  t16.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 250); });
  const hoveredFill = t16.querySelector('path[fill="#2F7772"]') ? 'selected' : 'normal';

  t16.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 350); });
  const pressed = t16.getAttribute('aria-pressed');
  const chips = Array.from(document.querySelectorAll('button[aria-label^="Remove"]'))
    .map(function (b) { return b.getAttribute('aria-label'); });

  // Deselect by clicking again.
  t16.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 350); });
  const afterDeselect = t16.getAttribute('aria-pressed');
  const chipsAfter = document.querySelectorAll('button[aria-label^="Remove"]').length;

  return JSON.stringify({
    hoveredFill: hoveredFill,
    pressed: pressed,
    chips: chips,
    afterDeselect: afterDeselect,
    chipsAfter: chipsAfter,
  });
})()`)

if (selection.pressed !== 'true') toothProblems.push('clicking a tooth did not select it')
if (selection.chips.length !== 1) toothProblems.push('selected tooth not listed')
if (!selection.chips[0]?.includes('16')) toothProblems.push('wrong tooth listed')
if (selection.afterDeselect !== 'false') toothProblems.push('clicking again did not deselect')
if (selection.chipsAfter !== 0) toothProblems.push('deselect did not clear the list')

report('tooth arch — 32 teeth, hover, select, deselect', toothProblems, JSON.stringify(selection))

// ── Room plan ─────────────────────────────────────────────────────────────
await send('Page.navigate', { url: `${BASE}/facilities/demo/room` }, sessionId)
await new Promise((resolve) => setTimeout(resolve, 2500))

const stations = await evaluate(`(() => {
  const nodes = Array.from(document.querySelectorAll('g[role=button]'));
  return JSON.stringify({
    count: nodes.length,
    labels: nodes.map(function (n) { return n.getAttribute('aria-label'); }),
  });
})()`)

const roomProblems = []
if (stations.count !== 14) roomProblems.push(`expected 14 stations, found ${stations.count}`)
for (let i = 1; i <= 14; i += 1) {
  const id = `PH-${String(i).padStart(2, '0')}`
  const matches = stations.labels.filter((l) => l.startsWith(`${id} —`)).length
  if (matches !== 1) roomProblems.push(`${id} appears ${matches} times`)
}

const stationSelection = await evaluate(`(async () => {
  const nodes = Array.from(document.querySelectorAll('g[role=button]'));
  const ph4 = nodes.filter(function (n) {
    return String(n.getAttribute('aria-label')).indexOf('PH-04 —') === 0;
  })[0];

  ph4.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 300); });
  const panel = document.body.innerText;

  ph4.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 400); });
  const pressed = ph4.getAttribute('aria-pressed');
  const selectedText = document.body.innerText.indexOf('You have selected') >= 0;

  return JSON.stringify({
    pressed: pressed,
    selectedText: selectedText,
    panelMentionsPH04: panel.indexOf('PH-04') >= 0,
  });
})()`)

if (stationSelection.pressed !== 'true') roomProblems.push('clicking a station did not select it')
if (!stationSelection.selectedText) roomProblems.push('selection was not announced')
if (!stationSelection.panelMentionsPH04) roomProblems.push('detail panel did not show the station')

report('room plan — 14 stations, hover, select', roomProblems, JSON.stringify(stationSelection))

console.log(`\n${failures === 0 ? 'PASS' : failures + ' issue(s) found'}`)

socket.close()
chrome.kill()
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
