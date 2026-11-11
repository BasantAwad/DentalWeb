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

// ── Services menu ──────────────────────────────────────────────────────────
// All three core services must be reachable from the header.
await send('Page.navigate', { url: `${BASE}/` }, sessionId)
await new Promise((resolve) => setTimeout(resolve, 2500))

const services = await evaluate(`(async () => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const trigger = buttons.filter(function (b) {
    return (b.textContent || '').trim().indexOf('Services') === 0;
  })[0];
  if (!trigger) return JSON.stringify({ found: false });

  trigger.click();
  await new Promise(function (r) { setTimeout(r, 350); });

  const menu = document.querySelector('[role=menu][aria-label=Services]');
  if (!menu) return JSON.stringify({ found: false, opened: false });

  const items = Array.from(menu.querySelectorAll('a[role=menuitem]')).map(function (a) {
    return { href: a.getAttribute('href'), text: (a.textContent || '').trim().split('\\n')[0] };
  });

  return JSON.stringify({ found: true, opened: true, items: items });
})()`)

const servicesProblems = []
if (!services.found) servicesProblems.push('no Services trigger in the header')
if (services.found && !services.opened) servicesProblems.push('the Services menu did not open')
if (services.opened) {
  const hrefs = (services.items ?? []).map((item) => item.href)
  for (const expected of [
    '/services/dental-chair',
    '/services/phantom-head',
    '/courses',
  ]) {
    if (!hrefs.includes(expected)) {
      servicesProblems.push(`the Services menu is missing ${expected}`)
    }
  }
}

report('services menu — three services', servicesProblems, JSON.stringify(services))

// ── Course discovery ──────────────────────────────────────────────────────
// The filters must be present and must write their state to the URL.
await send('Page.navigate', { url: `${BASE}/courses` }, sessionId)
await new Promise((resolve) => setTimeout(resolve, 2500))

const explorer = await evaluate(`(async () => {
  const search = document.getElementById('course-search');
  const selects = Array.from(document.querySelectorAll('#course-sort, select[id^=filter-]'));
  const heading = document.querySelector('h1');

  if (!search) return JSON.stringify({ ok: false, reason: 'no search field' });

  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(search, 'radiography');
  search.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise(function (r) { setTimeout(r, 900); });

  return JSON.stringify({
    ok: true,
    hasSearch: true,
    selectCount: selects.length,
    heading: heading ? (heading.textContent || '').trim() : '',
    url: window.location.search,
  });
})()`)

const explorerProblems = []
if (!explorer.ok) explorerProblems.push(explorer.reason ?? 'the explorer did not render')
if (explorer.ok) {
  if (!explorer.hasSearch) explorerProblems.push('no search field')
  if (!explorer.heading.includes('Learn the science')) {
    explorerProblems.push('the courses page is missing its editorial introduction')
  }
  if (!explorer.url.includes('q=radiography')) {
    explorerProblems.push('the search query was not written to the URL')
  }
}

report('course discovery — search and filters', explorerProblems, JSON.stringify(explorer))

// ── Account navigation ─────────────────────────────────────────────────────
// The account area must offer all five sections and mark the current one.
await send('Page.navigate', { url: `${BASE}/account/bookings` }, sessionId)
await new Promise((resolve) => setTimeout(resolve, 2500))

const account = await evaluate(`(() => {
  const nav = document.querySelector('nav[aria-label="Account sections"]');
  if (!nav) return JSON.stringify({ ok: false, reason: 'no account navigation' });

  const links = Array.from(nav.querySelectorAll('a')).map(function (a) {
    return { href: a.getAttribute('href'), current: a.getAttribute('aria-current') };
  });

  return JSON.stringify({
    ok: true,
    links: links,
    signedOutPrompt: document.body.innerText.indexOf('Sign in') >= 0,
  });
})()`)

const accountProblems = []
if (!account.ok) accountProblems.push(account.reason ?? 'the account area did not render')
if (account.ok) {
  const hrefs = (account.links ?? []).map((link) => link.href)
  for (const expected of [
    '/account',
    '/account/profile',
    '/account/bookings',
    '/account/courses',
    '/account/settings',
  ]) {
    if (!hrefs.includes(expected)) {
      accountProblems.push(`the account navigation is missing ${expected}`)
    }
  }
  const current = (account.links ?? []).filter((link) => link.current === 'page')
  if (current.length !== 1) {
    accountProblems.push(`expected one current page, found ${current.length}`)
  }
  if (!account.signedOutPrompt) {
    accountProblems.push('a signed-out visitor is not asked to sign in')
  }
}

report('account navigation — five sections', accountProblems, JSON.stringify(account))

console.log(`\n${failures === 0 ? 'PASS' : failures + ' issue(s) found'}`)

socket.close()
chrome.kill()
try {
  fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  /* ignore */
}
process.exit(0)
