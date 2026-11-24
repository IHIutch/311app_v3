import { useState } from 'react'
import { ClientOnly, Link, createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ReportForm } from '../../components/ReportForm'
import { ReportMap } from '../../components/ReportMap'
import { hasMapLocation, reportStatuses, statusLabel } from '../../report-types'

const loadReport = createServerFn().validator((id: string) => id).handler(async ({ data }) => {
  const id = Number(data)
  if (!/^[1-9]\d*$/.test(data) || !Number.isSafeInteger(id)) throw notFound()
  const { getReport, viewer } = await import('../../server/reports.server')
  const [result, session] = await Promise.all([getReport(id), viewer()])
  if (!result) throw notFound()
  return { ...result, ...session }
})

export const Route = createFileRoute('/reports/$id')({
  loader: ({ params }) => loadReport({ data: params.id }),
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: ReportDetail,
  notFoundComponent: () => <main><h1>Report not found</h1><Link to="/">View reports</Link></main>,
})

function authorName(person: { firstName: string | null; lastName: string | null }) {
  return [person.firstName, person.lastName].filter(Boolean).join(' ') || 'Resident'
}

const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/New_York' })

function statusFromHistory(value: string) {
  const parsed: unknown = JSON.parse(value)
  return typeof parsed === 'string' && Object.hasOwn(statusLabel, parsed)
    ? statusLabel[parsed as keyof typeof statusLabel]
    : String(parsed ?? '')
}

const calendarDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

function formatScheduledDate(value: string) {
  return calendarDate.format(new Date(value))
}

function StatusForm({ report }: { report: Awaited<ReturnType<typeof loadReport>>['report'] }) {
  const [status, setStatus] = useState(report.status === 'OPEN' ? 'CREATED' : report.status)
  const [scheduledDate, setScheduledDate] = useState(report.scheduledDate ?? '')
  return (
    <ReportForm action={`/api/reports/${report.id}/status`} submit="Update status">
      <label>Status
        <select name="status" value={status} onChange={event => setStatus(event.target.value as typeof status)}>
          {reportStatuses.map(value => <option key={value} value={value}>{statusLabel[value]}</option>)}
        </select>
      </label>
      {status === 'SCHEDULED' && (
        <label>Scheduled date
          <input name="scheduledDate" type="date" value={scheduledDate}
            onChange={event => setScheduledDate(event.target.value)} required />
        </label>
      )}
    </ReportForm>
  )
}

function ReportDetail() {
  const { report, comments, images, changes, signedIn, admin } = Route.useLoaderData()
  const activity = [
    ...comments.map(entry => ({ ...entry, kind: 'comment' as const })),
    ...changes.map(entry => ({ ...entry, kind: 'change' as const })),
  ].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))

  return (
    <main>
      <Link to="/">All reports</Link>
      <header className="page-heading">
        <div>
          <h1>{report.typeName}</h1>
          <p>Report #{report.id} · {date.format(new Date(report.createdAt))}</p>
        </div>
        <span className="status">{statusLabel[report.status]}</span>
      </header>
      {report.scheduledDate && <p>Scheduled for <time dateTime={report.scheduledDate}>{formatScheduledDate(report.scheduledDate)}</time></p>}
      <p>{report.details}</p>
      <p>{[report.streetNumber, report.streetName, report.neighborhood, report.postalCode].filter(Boolean).join(' ')}</p>
      {hasMapLocation(report) ? (
        <>
          <p>Coordinates {report.lat.toFixed(3)}, {report.lng.toFixed(3)}</p>
          <ClientOnly fallback={<div className="map-placeholder" />}>
            <ReportMap points={[report]} center={[report.lat, report.lng]} />
          </ClientOnly>
        </>
      ) : <p>Map location unavailable for this report.</p>}

      <section>
        <h2>Photos</h2>
        {images.length ? (
          <div className="photos">{images.map(image => (
            <a key={image.id} href={`/media/${image.id}`}>
              <img src={`/media/${image.id}`} loading="lazy"
                width={image.width ?? undefined} height={image.height ?? undefined}
                alt={`Photo attached to report ${report.id}`} />
            </a>
          ))}</div>
        ) : <p>No photos attached.</p>}
      </section>

      {admin && (
        <section>
          <h2>Update report status</h2>
          <StatusForm key={`${report.status}:${report.scheduledDate ?? ''}`} report={report} />
        </section>
      )}

      <section>
        <h2>Activity</h2>
        {activity.length ? <ol className="comments">{activity.map(entry => (
          <li key={`${entry.kind}:${entry.id}`}>
            <strong>{authorName(entry)}</strong>{' · '}
            <time dateTime={entry.createdAt}>{date.format(new Date(entry.createdAt))}</time>
            <p>{entry.kind === 'comment' ? entry.content
              : entry.objectAttr === 'status'
                ? `Changed the status from ${statusFromHistory(entry.oldValue)} to ${statusFromHistory(entry.newValue)}.`
                : entry.newValue === 'null'
                  ? 'Cleared the scheduled date.'
                  : `Set the scheduled date to ${formatScheduledDate(JSON.parse(entry.newValue))}.`}</p>
          </li>
        ))}</ol> : <p>No activity yet.</p>}
        {signedIn ? (
          <ReportForm action={`/api/reports/${report.id}/comment`} submit="Post comment">
            <label>Your comment <textarea name="content" required maxLength={3000} rows={4} /></label>
          </ReportForm>
        ) : <p><Link to="/sign-in">Sign in to comment</Link></p>}
      </section>
    </main>
  )
}
