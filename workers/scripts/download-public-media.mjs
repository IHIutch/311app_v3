import assert from 'node:assert/strict'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'

const [directory, source] = process.argv.slice(2)
assert.ok(directory && /^https:\/\/[a-z\d]+\.supabase\.co$/.test(source ?? ''),
  'Usage: node scripts/download-public-media.mjs <private-snapshot-directory> <supabase-origin>')

const snapshot = JSON.parse(await readFile(resolve(directory, 'data.json'), 'utf8'))
const root = resolve(directory, 'objects')
let next = 0
let completed = 0
let rateLimitUntil = 0

async function download() {
  while (next < snapshot.Storage.length) {
    const index = next++
    const object = snapshot.Storage[index]
    const parts = [object.bucket, ...object.name.split('/')]
    assert.ok(parts.every(part => part && part !== '.' && part !== '..' && !part.includes('\\')), 'Invalid source object path')
    const file = resolve(root, ...parts)
    const url = source + '/storage/v1/object/public/' + parts.map(encodeURIComponent).join('/')
    const existing = await stat(file).catch(error => {
      if (error.code !== 'ENOENT') throw error
      return null
    })
    let success = existing?.isFile() && existing.size === Number(object.size)
    let status
    for (let attempt = 0; attempt < 6 && !success; attempt++) {
      try {
        while (rateLimitUntil > Date.now()) await pause(rateLimitUntil - Date.now())
        const response = await fetch(url, { signal: AbortSignal.timeout(25000), redirect: 'error' })
        status = response.status
        if (status === 429) {
          const header = response.headers.get('retry-after')
          const seconds = Number(header)
          rateLimitUntil = Math.max(rateLimitUntil, Date.now() +
            (header && Number.isFinite(seconds) ? seconds * 1000 : 15000))
        }
        if (!response.ok) throw new Error('Source download failed')
        const bytes = Buffer.from(await response.arrayBuffer())
        if (bytes.length !== Number(object.size)) throw new Error('Source size changed')
        await mkdir(dirname(file), { recursive: true, mode: 0o700 })
        await writeFile(file, bytes, { mode: 0o600 })
        success = true
      } catch (error) {
        if (['ENOSPC', 'EACCES', 'EROFS'].includes(error.code)) throw new Error(`Local copy failed with ${error.code}`)
        if (attempt < 5) await pause(750 * (attempt + 1))
      }
    }
    if (!success) throw new Error(`Unable to copy storage object ${index + 1} of ${snapshot.Storage.length} (HTTP ${status ?? 'unavailable'})`)
    completed++
    if (completed % 100 === 0) console.log(`Downloaded ${completed} objects.`)
  }
}

await Promise.all(Array.from({ length: 3 }, download))
console.log(`Downloaded and size-checked ${completed} objects.`)
