import { useState } from 'react'
import { ClientOnly, Link, createFileRoute } from '@tanstack/react-router'
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
  const [mobileView, setMobileView] = useState<'map' | 'list'>('list')
  const [selectedId, setSelectedId] = useState<number>()
  const selected = reports.find(report => report.id === selectedId)

  return (
    <main>
      <header className="page-heading">
        <h1>Buffalo 311 reports</h1>
        <Link className="button" to="/create">Open a report</Link>
      </header>
      <div className="report-view-controls" role="group" aria-label="Report view">
        <button type="button" aria-pressed={mobileView === 'list'} onClick={() => setMobileView('list')}>List view</button>
        <button type="button" aria-pressed={mobileView === 'map'} onClick={() => setMobileView('map')}>Map view</button>
      </div>
      <div className={mobileView === 'map' ? '' : 'hide-on-mobile'}>
        <ClientOnly fallback={<div className="map-placeholder" />}>
          <ReportMap points={reports} onSelect={setSelectedId} />
        </ClientOnly>
        {selected && (
          <p className="report-map-selection">
            <Link to="/reports/$id" params={{ id: String(selected.id) }}>{selected.typeName} #{selected.id}</Link>
            {' · '}{statusLabel[selected.status]}
          </p>
        )}
      </div>
      <div className={mobileView === 'list' ? '' : 'hide-on-mobile'}>
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
      </div>
    </main>
  )
}
