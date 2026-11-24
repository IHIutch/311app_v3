import { captureException } from '@sentry/cloudflare'
import { env } from 'cloudflare:workers'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'
import { maxPhotoBytes, maxPhotos, photoType, photoTypes } from '../photo-format'
import { neighborhoodAt } from './neighborhoods'
import { isScheduledDate, updateReportSchedule } from './report-schedule'
import { reportStatuses, statusLabel } from '../report-types'

type Report = {
  id: number
  details: string | null
  createdAt: string
  updatedAt: string
  status: keyof typeof statusLabel
  scheduledDate: string | null
  neighborhood: string | null
  streetNumber: number | null
  streetName: string | null
  postalCode: string | null
  lat: number
  lng: number
  typeName: string
  typeGroup: string
  markerColor: string
}

type Person = { id: string; type: 'USER' | 'ADMIN' }
type ReportType = { id: number; name: string; group: string; markerColor: string }

const publicReports = `
  SELECT r.id, r.details, r.createdAt, r.updatedAt, r.status, r.scheduledDate, r.neighborhood,
         r.streetNumber, r.streetName, r.postalCode, r.lat, r.lng,
         t.name AS typeName, t."group" AS typeGroup, t.markerColor
    FROM reports r JOIN reportTypes t ON t.id = r.reportTypeId
   WHERE r.deletedAt IS NULL
`

export async function listReports() {
  return (await env.DB.prepare(publicReports + ' ORDER BY r.id DESC').all<Report>()).results
}

export async function listReportTypes() {
  return (await env.DB.prepare(`
    SELECT id, name, "group", markerColor FROM reportTypes
    WHERE deletedAt IS NULL ORDER BY "group", name
  `).all<ReportType>()).results
}

export async function getReport(id: number) {
  const report = await env.DB.prepare(publicReports + ' AND r.id = ?').bind(id).first<Report>()
  if (!report) return null

  const [comments, images, changes] = await env.DB.batch([
    env.DB.prepare(`
      SELECT c.id, c.content, c.createdAt, u.firstName, u.lastName
        FROM comments c JOIN users u ON c.creatorId = u.id
       WHERE c.objectId = ? AND c.deletedAt IS NULL ORDER BY c.id
    `).bind(id),
    env.DB.prepare(`
      SELECT id, width, height FROM images
       WHERE objectId = ? AND deletedAt IS NULL ORDER BY id
    `).bind(id),
    env.DB.prepare(`
      SELECT c.id, c.oldValue, c.newValue, c.objectAttr, c.createdAt, u.firstName, u.lastName
        FROM changelog c JOIN users u ON c.creatorId = u.id
       WHERE c.objectId = ? AND c.objectAttr IN ('status', 'scheduledDate') ORDER BY c.id
    `).bind(id),
  ])

  return {
    report,
    comments: comments.results as { id: number; content: string; createdAt: string; firstName: string | null; lastName: string | null }[],
    images: images.results as { id: number; width: number | null; height: number | null }[],
    changes: changes.results as { id: number; oldValue: string; newValue: string; objectAttr: 'status' | 'scheduledDate'; createdAt: string; firstName: string | null; lastName: string | null }[],
  }
}

export async function viewer() {
  const { userId } = await auth()
  if (!userId) return { signedIn: false, admin: false }
  const user = await env.DB.prepare('SELECT type FROM users WHERE clerkId = ? AND deletedAt IS NULL')
    .bind(userId).first<{ type: Person['type'] }>()
  return { signedIn: true, admin: user?.type === 'ADMIN' }
}

export async function ownedReports() {
  const { userId } = await auth()
  if (!userId) throw new RequestError(401, 'Sign in to view your reports.')
  return (await env.DB.prepare(publicReports + `
    AND r.creatorId = (SELECT id FROM users WHERE clerkId = ? AND deletedAt IS NULL)
    ORDER BY r.id DESC
  `).bind(userId).all<Report>()).results
}

async function findPerson(create: boolean) {
  const { userId } = await auth()
  if (!userId) return null

  const find = () => env.DB.prepare('SELECT id, type, deletedAt FROM users WHERE clerkId = ?')
    .bind(userId).first<Person & { deletedAt: string | null }>()
  const existing = await find()
  if (existing || !create) return existing?.deletedAt ? null : existing

  const account = await clerkClient({ secretKey: env.CLERK_SECRET_KEY }).users.getUser(userId)
  const id = crypto.randomUUID()
  await env.DB.prepare(`
    INSERT INTO users (id, publicId, clerkId, firstName, lastName) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(clerkId) DO NOTHING
  `).bind(id, id, userId, account.firstName, account.lastName).run()
  const person = await find()
  return person?.deletedAt ? null : person
}

export class RequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

export function reportId(value: string) {
  const id = Number(value)
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) {
    throw new RequestError(404, 'Report not found.')
  }
  return id
}

export async function mutation(request: Request, action: () => Promise<Response>) {
  try {
    const origin = request.headers.get('origin')
    if (origin !== new URL(request.url).origin) {
      throw new RequestError(403, 'Submit this form from Buffalo 311.')
    }
    return await action()
  } catch (error) {
    if (error instanceof RequestError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    captureException(error)
    console.error('Report mutation failed', error instanceof Error ? error.name : 'UnknownError')
    return Response.json({ error: 'Unable to save your changes.' }, { status: 500 })
  }
}

async function multipart(request: Request, maxBytes: number) {
  const type = request.headers.get('content-type') ?? ''
  if (!type.startsWith('multipart/form-data;')) throw new RequestError(415, 'Expected a form submission.')
  if (Number(request.headers.get('content-length')) > maxBytes) throw new RequestError(413, 'The submission is too large.')

  const reader = request.body?.getReader()
  if (!reader) throw new RequestError(400, 'Missing form data.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new RequestError(413, 'The submission is too large.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  try {
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return await new Response(bytes, { headers: { 'Content-Type': type } }).formData()
  } catch {
    throw new RequestError(400, 'Invalid form data.')
  }
}

function optionalText(form: FormData, field: string, max: number) {
  const value = form.get(field)
  if (value === null) return null
  if (typeof value !== 'string' || value.length > max) {
    throw new RequestError(400, `Invalid ${field}.`)
  }
  return value.trim() || null
}

function coordinate(form: FormData, field: string, max: number) {
  const value = optionalText(form, field, 32)
  const number = value === null ? NaN : Number(value)
  if (!Number.isFinite(number) || Math.abs(number) > max) {
    throw new RequestError(400, 'Choose a valid report location.')
  }
  return number
}

async function readPhoto(file: File) {
  if (!photoTypes.has(file.type) || file.size > maxPhotoBytes) {
    throw new RequestError(400, 'Use JPEG, PNG, WebP or GIF photos up to 5 MB each.')
  }
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (photoType(header) !== file.type) throw new RequestError(400, 'A photo format did not match its file contents.')
  return file
}

export async function createReport(request: Request) {
  const form = await multipart(request, maxPhotos * maxPhotoBytes + 65536)
  const rawType = optionalText(form, 'reportTypeId', 16)
  const typeId = rawType === null ? NaN : Number(rawType)
  if (!Number.isSafeInteger(typeId) || !await env.DB.prepare(
    'SELECT id FROM reportTypes WHERE id = ? AND deletedAt IS NULL',
  ).bind(typeId).first()) throw new RequestError(400, 'Choose a report type.')

  const lat = coordinate(form, 'lat', 90)
  const lng = coordinate(form, 'lng', 180)
  const email = optionalText(form, 'email', 254)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError(400, 'Enter a valid email address.')
  const street = optionalText(form, 'streetNumber', 12)
  const streetNumber = street === null ? null : Number(street)
  if (streetNumber !== null && (!Number.isSafeInteger(streetNumber) || streetNumber < 0)) {
    throw new RequestError(400, 'Enter a valid street number.')
  }
  const streetName = optionalText(form, 'streetName', 200)
  const postalCode = optionalText(form, 'postalCode', 20)
  const neighborhood = neighborhoodAt(lat, lng)
  const details = optionalText(form, 'details', 5000)
  const files = form.getAll('photo').filter((file): file is File => file instanceof File && file.size > 0)
  if (files.length > maxPhotos) throw new RequestError(400, `Attach up to ${maxPhotos} photos.`)
  const photos = await Promise.all(files.map(readPhoto))
  const person = await findPerson(true)
  const submissionKey = crypto.randomUUID()
  const keys: string[] = []
  try {
    for (const photo of photos) {
      const key = `reports/${crypto.randomUUID()}`
      keys.push(key)
      await env.PHOTOS.put(key, photo, { httpMetadata: { contentType: photo.type } })
    }
    const [inserted] = await env.DB.batch<{ id: number }>([
      env.DB.prepare(`
        INSERT INTO reports (email, streetNumber, streetName, postalCode, neighborhood,
                             lat, lng, details, reportTypeId, creatorId, submissionKey)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
      `).bind(email, streetNumber, streetName, postalCode, neighborhood, lat, lng, details, typeId, person?.id ?? null, submissionKey),
      ...keys.map(key => env.DB.prepare(`
        INSERT INTO images (objectId, objectKey)
        SELECT id, ? FROM reports WHERE submissionKey = ?
      `).bind(key, submissionKey)),
    ])
    return Response.json({ id: inserted.results[0].id }, { status: 201 })
  } catch (error) {
    // An interrupted response can follow a committed D1 batch. Keep those objects.
    const saved = await env.DB.prepare('SELECT id FROM reports WHERE submissionKey = ?')
      .bind(submissionKey).first<{ id: number }>()
    if (saved) return Response.json(saved, { status: 201 })
    if (keys.length) await env.PHOTOS.delete(keys)
    throw error
  }
}

export async function saveComment(id: number, request: Request) {
  const person = await findPerson(true)
  if (!person) throw new RequestError(401, 'Sign in to comment.')
  const form = await multipart(request, 16 * 1024)
  const content = optionalText(form, 'content', 3000)
  if (!content) throw new RequestError(400, 'Enter a comment.')
  const result = await env.DB.prepare(`
    INSERT INTO comments (objectId, content, creatorId)
    SELECT id, ?, ? FROM reports WHERE id = ? AND deletedAt IS NULL
  `).bind(content, person.id, id).run()
  if (!result.meta.changes) throw new RequestError(404, 'Report not found.')
  return new Response(null, { status: 204 })
}

export async function saveStatus(id: number, request: Request) {
  const person = await findPerson(false)
  if (person?.type !== 'ADMIN') throw new RequestError(403, 'Only admins can change report status.')
  const form = await multipart(request, 8192)
  const status = optionalText(form, 'status', 24)
  if (!status || !reportStatuses.some(value => value === status)) throw new RequestError(400, 'Choose a valid status.')
  const scheduledDate = status === 'SCHEDULED' ? optionalText(form, 'scheduledDate', 10) : null
  if (status === 'SCHEDULED' && !isScheduledDate(scheduledDate)) {
    throw new RequestError(400, 'Enter a valid scheduling date.')
  }
  await updateReportSchedule(env.DB, { id, status, scheduledDate, actorId: person.id })
  return new Response(null, { status: 204 })
}

export async function deleteReport(id: number) {
  const person = await findPerson(false)
  if (!person) throw new RequestError(401, 'Sign in to remove a report.')
  const now = new Date().toISOString()
  const result = await env.DB.prepare(`
    UPDATE reports SET deletedAt = ?, updatedAt = ?
     WHERE id = ? AND deletedAt IS NULL AND (creatorId = ? OR ? = 'ADMIN')
  `).bind(now, now, id, person.id, person.type).run()
  if (!result.meta.changes) throw new RequestError(404, 'Report not found.')
  return new Response(null, { status: 204 })
}

export async function getPhoto(id: number) {
  const image = await env.DB.prepare(`
    SELECT i.objectKey FROM images i JOIN reports r ON i.objectId = r.id
     WHERE i.id = ? AND i.deletedAt IS NULL AND r.deletedAt IS NULL
  `).bind(id).first<{ objectKey: string }>()
  if (!image) return new Response(null, { status: 404 })
  const photo = await env.PHOTOS.get(image.objectKey)
  const mime = photo?.httpMetadata?.contentType
  if (!photo || !mime || !photoTypes.has(mime)) return new Response(null, { status: 404 })
  return new Response(photo.body, { headers: {
    'Content-Type': mime,
    'Content-Length': String(photo.size),
    ETag: photo.httpEtag,
    'Cache-Control': 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  } })
}
