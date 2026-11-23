import { ClientOnly, Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ReportMap } from '../components/ReportMap'
import { statusLabel } from '../report-types'

const getReports = createServerFn().handler(async () => {
  const { listReports } = await import('../server/reports.server')
  return listReports()
})

export const Route = createFileRoute('/')({
  loader: () => getReports(),
  component: Home,
})

function Home() {
  const reports = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main>
      <header className="page-heading">
        <h1>Buffalo 311 reports</h1>
        <Link className="button" to="/create">Open a report</Link>
      </header>
      <ClientOnly fallback={<div className="map-placeholder" />}>
        <ReportMap points={reports} onSelect={id => void navigate({ to: '/reports/$id', params: { id: String(id) } })} />
      </ClientOnly>
      <h2>Recent reports</h2>
      {reports.length ? (
        <ul className="reports">
          {reports.map(report => (
            <li key={report.id}>
              <Link to="/reports/$id" params={{ id: String(report.id) }}>{report.typeName}</Link>
              <span>{report.neighborhood ?? report.streetName ?? 'Buffalo'} · #{report.id}</span>
              <span className="status">{statusLabel[report.status]}</span>
            </li>
          ))}
        </ul>
      ) : <p>No reports yet.</p>}
    </main>
  )
}
