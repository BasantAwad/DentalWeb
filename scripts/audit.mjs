/**
 * Runs an accessibility and layout audit across every public route at
 * several viewport widths.
 *
 * Checks:
 *  - accessible names on interactive elements
 *  - alt text on images
 *  - labels on form controls
 *  - heading structure
 *  - horizontal overflow
 *  - tap-target sizes on touch widths
 *  - landmark and language attributes
 *  - console errors
 *
 * Usage: node scripts/audit.mjs
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const ROUTES = [
  '/',
  '/services',
  '/services/dental-chair',
  '/services/phantom-head',
  '/facilities',
  '/facilities/demo',
  '/facilities/demo/room',
  '/facilities/demo/book',
  '/tooth-planner',
  '/manage',
  '/courses',
  '/about',
  '/auth/login',
  '/auth/register',
]

const WIDTHS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const AUDIT = `(() => {
  const issues = [];
  const push = (kind, detail) => issues.push(kind + ': ' + detail);

  // Accessible names on interactive elements.
  document.querySelectorAll('button, a[href], [role=button]').forEach((el) => {
    const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if (!name) push('unnamed control', el.tagName + '.' + String(el.className).slice(0, 50));
  });

  // Images need alt.
  document.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('alt')) push('img without alt', img.getAttribute('src') || '');
  });

  // Form controls need a label.
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    const id = el.id;
    const labelled = (id && document.querySelector('label[for="' + id + '"]')) ||
      el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ||
      el.closest('label');
    if (!labelled) push('unlabelled control', (el.id || el.name || el.type));
  });

  // Exactly one h1.
  const h1s = document.querySelectorAll('h1');
  if (h1s.length !== 1) push('h1 count', String(h1s.length));

  // Heading levels must not skip.
  const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .filter((h) => h.offsetParent !== null || h.getClientRects().length)
    .map((h) => Number(h.tagName[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      push('heading level skip', levels[i - 1] + ' -> ' + levels[i]);
      break;
    }
  }

  // Horizontal overflow.
  const doc = document.documentElement;
  if (doc.scrollWidth > doc.clientWidth + 1) {
    push('horizontal overflow', doc.scrollWidth + ' > ' + doc.clientWidth);
  }

  // Tap targets on narrow viewports.
  if (window.innerWidth < 768) {
    const small = [];
    document.querySelectorAll('button, a[href], [role=button]').forEach((el) => {
      // The skip link is visually hidden until focused, so its 1x1 box is
      // correct and not a defect.
      if (el.classList.contains('sr-only')) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.height < 32 || r.width < 32) {
        small.push((el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 24) +
          ' (' + Math.round(r.width) + 'x' + Math.round(r.height) + ')');
      }
    });
    if (small.length) push('small tap targets', small.slice(0, 5).join(' | '));
  }

  // Language and landmarks.
  if (!document.documentElement.lang) push('missing lang', '');
  if (!document.querySelector('main')) push('missing main landmark', '');

  return JSON.stringify({ issues, title: document.title });
})()`

const profileDir = path.join(os.tmpdir(), 'opencode', `audit-${process.pid}`)
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
const consoleErrors = new Map()

socket.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    const text = message.params.args.map((a) => a.value ?? a.description ?? '').join(' ')
    consoleErrors.set(text.slice(0, 160), (consoleErrors.get(text.slice(0, 160)) ?? 0) + 1)
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const text = message.params.exceptionDetails?.exception?.description ?? 'exception'
    consoleErrors.set(text.slice(0, 160), (consoleErrors.get(text.slice(0, 160)) ?? 0) + 1)
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

let failures = 0

for (const viewport of WIDTHS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 768,
    },
    sessionId,
  )

  for (const route of ROUTES) {
    consoleErrors.clear()
    await send('Page.navigate', { url: BASE + route }, sessionId)
    await new Promise((resolve) => setTimeout(resolve, 2200))

    const result = await send(
      'Runtime.evaluate',
      { expression: AUDIT, returnByValue: true },
      sessionId,
    )

    let payload
    try {
      payload = JSON.parse(result.result?.value ?? '{}')
    } catch {
      payload = { issues: ['audit did not return JSON'], title: '' }
    }

    const errors = [...consoleErrors.keys()]
    const all = [...(payload.issues ?? []), ...errors.map((e) => 'console error: ' + e)]

    if (all.length > 0) {
      failures += all.length
      console.log(`FAIL  ${viewport.name.padEnd(8)} ${route}`)
      for (const issue of all) console.log(`        · ${issue}`)
    } else {
      console.log(`ok    ${viewport.name.padEnd(8)} ${route}`)
    }
  }
}

console.log(`\n${failures === 0 ? 'PASS' : failures + ' issue(s) found'}`)

socket.close()
chrome.kill()
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
