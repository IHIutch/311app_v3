import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const origin = process.env.BUFFALO311_TEST_ORIGIN ?? 'http://127.0.0.1:43119'
assert.match(origin, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Run the smoke test against localhost.')
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+lSFsAAAAASUVORK5CYII=', 'base64')

async function read(path, status, text) {
  const response = await fetch(origin + path, { redirect: 'manual' })
  assert.equal(response.status, status, path)
  if (text) assert.match(await response.text(), text)
  return response
}

async function post(path, fields, status, requestOrigin = origin) {
  const form = new FormData()
  for (const [key, value] of fields instanceof FormData ? fields.entries() : Object.entries(fields)) {
    form.append(key, value)
  }
  const response = await fetch(origin + path, { method: 'POST', body: form, headers: { Origin: requestOrigin } })
  assert.equal(response.status, status, `${path} expected ${status}, got ${response.status}: ${await response.clone().text()}`)
  return response
}

await read('/', 200, /Recent reports/)
await read('/create', 200, /Pothole/)
await read('/create/pothole', 200, /Submit report/)
await read('/register', 200, /Sign up for Buffalo 311/)
await read('/reports/311', 200, /Sample comment from a historical profile/)
await read('/reports/invalid', 404)
await read('/media/999999', 404)
const profile = await read('/profile', 307)
assert.equal(new URL(profile.headers.get('location'), origin).pathname, '/sign-in')

await post('/api/reports/311/comment', { content: 'Guest writes are denied' }, 401)
await post('/api/reports/311/status', { status: 'CLOSED' }, 403)
const removal = await fetch(origin + '/api/reports/311', {
  method: 'DELETE', headers: { Origin: origin },
})
assert.equal(removal.status, 401)
await post('/api/reports/', {}, 403, 'https://example.invalid')
await post('/api/reports/', { reportTypeId: '1', lat: '100', lng: '-78.877' }, 400)
const fields = {
  reportTypeId: '1', lat: '42.919', lng: '-78.877',
  email: 'private@example.invalid', details: `Synthetic submission ${randomUUID()}`,
  creatorId: 'f4f1d0ab-1056-41df-a177-de37456bf44c', status: 'CLOSED',
}
await post('/api/reports/', { ...fields, photo: new File(['invalid'], 'bad.png', { type: 'image/png' }) }, 400)
const plain = await post('/api/reports/', fields, 201)
const plainId = (await plain.json()).id
assert.ok(plainId > 311)
await read(`/reports/${plainId}`, 200, /No photos attached/)

const photos = new FormData()
for (const [key, value] of Object.entries(fields)) photos.set(key, value)
for (let n = 1; n <= 4; n++) photos.append('photo', new File([png], `photo-${n}.png`, { type: 'image/png' }))
const uploaded = await post('/api/reports/', photos, 201)
photos.append('photo', new File([png], 'photo-5.png', { type: 'image/png' }))
await post('/api/reports/', photos, 400)
const id = (await uploaded.json()).id
assert.ok(id > plainId)
const detail = await (await read(`/reports/${id}`, 200)).text()
assert.match(detail, /Synthetic submission/)
assert.match(detail, />Open</)
assert.doesNotMatch(detail, /private@example.invalid|fixture@example.invalid/)
const photoPaths = Array.from(detail.matchAll(/src="(\/media\/\d+)"/g), match => match[1])
assert.equal(new Set(photoPaths).size, 4, 'All four photos are linked to the new report')
for (const path of photoPaths) {
  const blob = await read(path, 200)
  assert.equal(blob.headers.get('Content-Type'), 'image/png')
  assert.deepEqual(Buffer.from(await blob.arrayBuffer()), png)
}
assert.doesNotMatch(await (await read('/', 200)).text(), /private@example.invalid|fixture@example.invalid/)
console.log('Report routes, guest authorization, input validation, email privacy, and R2 upload/download passed.')
