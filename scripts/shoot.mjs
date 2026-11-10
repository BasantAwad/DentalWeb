/**
 * Capture full-page screenshots at several viewport widths.
 *
 * Usage: node scripts/shoot.mjs <url> <name> [width] [height]
 *
 * Headless Chrome is used because it can render at an arbitrary viewport
 * size, which the desktop browser tool cannot.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = path.join(os.tmpdir(), 'opencode', 'shots')

const url = process.argv[2] ?? 'http://localhost:3000/'
const name = process.argv[3] ?? 'shot'
const width = process.argv[4] ?? '1440'
const height = process.argv[5] ?? '900'

fs.mkdirSync(OUT, { recursive: true })
const target = path.join(OUT, `${name}.png`)

execFileSync(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=12000',
    `--window-size=${width},${height}`,
    `--screenshot=${target}`,
    url,
  ],
  { stdio: 'ignore' },
)

console.log(target)
