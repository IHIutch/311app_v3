import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const directory = mkdtempSync(join(tmpdir(), 'buffalo311-migration-'))
const objects = join(directory, 'objects', 'fixture')
const state = join(directory, 'state')
const database = '62edd46c-09f0-411b-8ff5-736d62534ef6'
const source = 'https://fixture.supabase.co'
const stamp = { createdAt: '2024-07-01T12:00:00.123456+00:00', updatedAt: '2024-07-01T13:00:00+00:00' }
const timestamps = { ...stamp, deletedAt: null }
const user = 'f4f1d0ab-1056-41df-a177-de37456bf44c'
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+lSFsAAAAASUVORK5CYII=', 'base64')
const orphan = Buffer.from('Unreferenced synthetic archive object')

try {
  mkdirSync(objects, { recursive: true })
  writeFileSync(join(objects, 'photo.png'), png)
  writeFileSync(join(objects, 'archive.txt'), orphan)
  writeFileSync(join(directory, 'data.json'), JSON.stringify({
    Users: [{ id: user, publicId: 'sample-author', firstName: 'Sample', lastName: 'Author', type: 'USER', ...timestamps }],
    ReportTypes: [{ id: 2, name: 'Pothole', group: 'Street', markerColor: '#004488', ...timestamps }],
    Reports: [{ id: 311, email: 'fixture@example.invalid', streetNumber: 123, streetName: 'Elmwood Avenue',
      postalCode: '14222', neighborhood: 'Elmwood', lat: 419.919, lng: -78.877, status: 'OPEN',
      details: "It's a fixture, with SQL punctuation ; and multiline\ncontent", reportTypeId: 2, creatorId: null, ...timestamps }],
    Comments: [{ id: 3, objectType: 'REPORT', objectId: 311, content: 'Synthetic historical comment', replyTo: null, creatorId: user, ...timestamps }],
    Images: [{ id: 6, objectType: 'REPORT', objectId: 311, src: source + '/storage/v1/object/public/fixture/photo.png',
      blurDataUrl: null, height: 1, width: 1, hexColor: null, ...timestamps }],
    Changelog: [{ id: 9, objectType: 'REPORT', objectId: 311, creatorId: user,
      oldValue: '"CREATED"', newValue: '"OPEN"', objectAttr: 'status', ...stamp }],
    Storage: [
      { bucket: 'fixture', name: 'photo.png', size: String(png.length), type: 'image/png' },
      { bucket: 'fixture', name: 'archive.txt', size: String(orphan.length), type: 'text/plain' },
    ],
  }), { mode: 0o600 })

  execFileSync('pnpm', ['exec', 'cf', 'd1', 'migrations', 'apply', database, '--local', '--persist-to', state],
    { stdio: ['ignore', 'ignore', 'inherit'] })
  const restoreArgs = ['scripts/restore.mjs', directory, source, database, 'buffalo311-local', '--local']
  const context = { BUFFALO311_MIGRATION_STATE: state }
  for (let pass = 0; pass < 2; pass++) {
    execFileSync(process.execPath, restoreArgs, { stdio: 'inherit', env: { ...process.env, ...context } })
  }
} finally {
  rmSync(directory, { recursive: true, force: true })
}
