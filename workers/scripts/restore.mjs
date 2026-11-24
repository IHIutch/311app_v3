import assert from 'node:assert/strict'
import { execFile, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { setTimeout as pause } from 'node:timers/promises'
import { isDeepStrictEqual, promisify } from 'node:util'
import { photoType, photoTypes } from '../src/photo-format.ts'

const [directory, sourceOrigin, targetDatabase, targetBucket, mode] = process.argv.slice(2)
assert.ok(directory && /^https:\/\/[a-z\d]+\.supabase\.co$/.test(sourceOrigin ?? '') &&
  /^[\da-f-]{36}$/.test(targetDatabase ?? '') && /^[a-z\d-]+$/.test(targetBucket ?? '') &&
  ['--local', '--staging'].includes(mode),
  'Usage: node scripts/restore.mjs <private-snapshot-directory> <supabase-origin> <d1-id> <r2-bucket> <--local|--staging>')

const root = realpathSync(directory)
const snapshot = JSON.parse(readFileSync(join(root, 'data.json'), 'utf8'))
const objectsRoot = realpathSync(join(root, 'objects'))
const mediaBase = sourceOrigin + '/storage/v1/object/public/'
const objectBySource = new Map()
const manifest = []
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

for (const object of snapshot.Storage) {
  const path = [object.bucket, ...object.name.split('/')]
  assert.ok(path.every(part => part && part !== '.' && part !== '..' && !part.includes('\\')),
    'Invalid source object path')
  const sourceFile = realpathSync(resolve(objectsRoot, ...path))
  assert.ok(sourceFile.startsWith(objectsRoot + sep), 'Source object is outside the snapshot')
  const contents = readFileSync(sourceFile)
  assert.ok(object.size !== null && Number(object.size) === contents.length, 'Source object size differs from storage metadata')
  const sourceUrl = mediaBase + path.map(encodeURIComponent).join('/')
  assert.ok(!objectBySource.has(sourceUrl), 'Duplicate source object')
  const detectedType = photoType(contents.subarray(0, 12))
  const entry = {
    sourceUrl,
    sourceFile,
    key: `legacy/${sha256(path.join('/'))}`,
    size: contents.length,
    sha256: sha256(contents),
    sourceType: object.type,
    type: detectedType ?? (object.type || 'application/octet-stream'),
    verifiedPhoto: Boolean(detectedType),
  }
  objectBySource.set(sourceUrl, entry)
  manifest.push(entry)
}

const timestamps = ['createdAt', 'updatedAt', 'deletedAt']
const definitions = {
  Users: ['users', 'id publicId firstName lastName type createdAt updatedAt deletedAt'],
  ReportTypes: ['reportTypes', 'id name group markerColor createdAt updatedAt deletedAt'],
  Reports: ['reports', 'id email streetNumber streetName postalCode neighborhood lat lng status details reportTypeId creatorId createdAt updatedAt deletedAt'],
  Comments: ['comments', 'id objectType objectId content replyTo creatorId createdAt updatedAt deletedAt'],
  Images: ['images', 'id objectType objectId objectKey blurDataUrl height width hexColor createdAt updatedAt deletedAt'],
  Changelog: ['changelog', 'id objectType objectId creatorId oldValue newValue objectAttr createdAt updatedAt'],
}
const knownKeys = {
  users: new Set(snapshot.Users.map(row => row.id)),
  reports: new Set(snapshot.Reports.map(row => row.id)),
  reportTypes: new Set(snapshot.ReportTypes.map(row => row.id)),
}

function valueFor(table, row, column) {
  if (table === 'Images' && column === 'objectKey') {
    const url = new URL(row.src)
    const canonical = url.origin + url.pathname.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/')
    const photo = objectBySource.get(canonical)
    assert.ok(photo, `Missing object for image row ${row.id}`)
    assert.ok((photo.verifiedPhoto && photoTypes.has(photo.type)) || row.deletedAt, `Unsupported content type for image row ${row.id}`)
    return photo.key
  }
  assert.ok(Object.hasOwn(row, column), `Missing ${table}.${column}`)
  const value = row[column]
  if (value !== null && timestamps.includes(column)) {
    assert.ok(typeof value === 'string' && Number.isFinite(Date.parse(value)), `Invalid ${table} timestamp`)
    return value.replace(/\+00:00$/, 'Z')
  }
  return value
}

function literal(value) {
  if (value === null) return 'NULL'
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  assert.ok(typeof value === 'string' && !value.includes('\0'), 'Unexpected value in source snapshot')
  return "'" + value.replaceAll("'", "''") + "'"
}

const statements = []
const expectedRows = new Map()
for (const [source, [target, columns]] of Object.entries(definitions)) {
  const names = columns.split(' ')
  const quoted = names.map(name => `"${name}"`)
  const updates = quoted.slice(1).map(name => `${name}=excluded.${name}`).join(',')
  assert.equal(new Set(snapshot[source].map(row => row.id)).size, snapshot[source].length, `Duplicate IDs in ${source}`)
  const rowsById = new Map()
  for (const row of snapshot[source]) {
    if (row.creatorId != null) assert.ok(knownKeys.users.has(row.creatorId), `Missing author in ${source}`)
    if (row.reportTypeId != null) assert.ok(knownKeys.reportTypes.has(row.reportTypeId), 'Missing report type')
    if (row.objectId != null) assert.ok(knownKeys.reports.has(row.objectId), `Missing report in ${source}`)
    const values = names.map(column => valueFor(source, row, column))
    rowsById.set(row.id, values)
    statements.push({ sql: `INSERT INTO ${target} (${quoted.join(',')}) VALUES (${values.map(literal).join(',')}) ON CONFLICT(id) DO UPDATE SET ${updates}` })
  }
  expectedRows.set(target, { columns: quoted, rowsById })
}

const local = mode === '--local' ? ['--local'] : []
if (local.length && process.env.BUFFALO311_MIGRATION_STATE) {
  local.push('--persist-to', process.env.BUFFALO311_MIGRATION_STATE)
}
const cfBinary = resolve('node_modules', '.bin', 'cf')

function cf(args, description) {
  try {
    return execFileSync(cfBinary, [...args, ...local], {
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 512 * 1024 * 1024,
    })
  } catch {
    throw new Error(`Cloudflare CLI failed during ${description}.`)
  }
}

function query(sql) {
  const response = JSON.parse(cf(['d1', 'raw', targetDatabase, '--sql', sql], 'D1 verification').toString())
  return response[0].results.rows
}

const counts = Object.entries(definitions).map(([source, [target]]) => ({
  source, target, count: snapshot[source].length,
}))
const countSql = counts.map(({ target }) => `(SELECT count(*) FROM ${target})`).join(', ')
const before = query('SELECT ' + countSql)[0]
assert.ok(before.every(count => count === 0) || before.every((count, index) => count === counts[index].count),
  'Restore requires an empty database or the same rehearsal snapshot')
if (before.some(count => count > 0)) {
  for (const { source, target } of counts) {
    const existing = query(`SELECT id FROM ${target}`).flat()
    assert.deepEqual(new Set(existing), new Set(snapshot[source].map(row => row.id)),
      `Existing ${target} IDs differ from the snapshot`)
  }
}

const exec = promisify(execFile)
const remoteKeys = mode === '--staging'
  ? new Set(JSON.parse(cf(['r2', 'objects', 'list', '--bucket-name', targetBucket,
    '--prefix', 'legacy/', '--per-page', '1000'], 'R2 inventory').toString()).map(object => object.key))
  : null

async function copyObject(object) {
  const args = ['--bucket-name', targetBucket]
  const run = argv => exec(cfBinary, ['r2', 'objects', ...argv, ...local], {
    encoding: 'buffer',
    maxBuffer: 512 * 1024 * 1024,
  })
  const get = async () => (await run(['get', object.key, ...args])).stdout
  const existing = remoteKeys === null || remoteKeys.has(object.key) ? await get().catch(() => null) : null
  if (existing && sha256(existing) === object.sha256) return

  let reason = 'unknown error'
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await run(['put', object.key, ...args, '--content-type', object.type, '--file', object.sourceFile])
      if (sha256(await get()) === object.sha256) return
      reason = 'checksum mismatch'
    } catch (error) {
      reason = error.stderr?.toString().match(/SQLITE_[A-Z_]+|ENOSPC|EACCES|ECONNRESET|ETIMEDOUT|429/i)?.[0] ??
        error.signal ?? `exit ${error.code}`
      if (reason === 'ENOSPC') break
    }
    await pause(reason === '429' ? 5000 * (attempt + 1) : 250 * (attempt + 1))
  }
  throw new Error(`R2 copy or verification failed (${reason}).`)
}

const copyConcurrency = mode === '--staging' ? 12 : 3
for (let offset = 0; offset < manifest.length; offset += copyConcurrency) {
  await Promise.all(manifest.slice(offset, offset + copyConcurrency).map(copyObject))
  if ((offset + copyConcurrency) % 60 === 0) console.log(`Copied and verified ${offset + copyConcurrency} objects.`)
}

const sourceRowCount = statements.length
statements.push({ sql: readFileSync(new URL('../migrations/0003_recover_legacy_schedule.sql', import.meta.url), 'utf8') })
const batchPath = join(root, 'batch.json')
writeFileSync(batchPath, JSON.stringify(statements), { mode: 0o600 })
cf(['d1', 'raw', targetDatabase, '--batch', '@' + batchPath], 'D1 import')
assert.deepEqual(query('SELECT ' + countSql)[0], counts.map(row => row.count))
assert.deepEqual(query('PRAGMA foreign_key_check'), [])
for (const [table, { columns, rowsById }] of expectedRows) {
  for (const row of query(`SELECT ${columns.join(',')} FROM ${table}`)) {
    assert.ok(isDeepStrictEqual(row, rowsById.get(row[0])), `Restored ${table} values differ from source`)
  }
}
writeFileSync(join(root, 'media-manifest.json'), JSON.stringify(manifest.map(({ sourceFile, ...row }) => row), null, 2), { mode: 0o600 })
console.log(`Verified ${sourceRowCount} D1 records and ${manifest.length} R2 objects.`)
