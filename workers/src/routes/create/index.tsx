import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { reportTypeSlug } from '../../report-types'

const getReportTypes = createServerFn().handler(async () => {
  const { listReportTypes } = await import('../../server/reports.server')
  return listReportTypes()
})

export const Route = createFileRoute('/create/')({
  loader: () => getReportTypes(),
  component: ReportTypes,
})

function ReportTypes() {
  const types = Route.useLoaderData()
  const [search, setSearch] = useState('')
  const visibleTypes = types.filter(type => type.name.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <main>
      <h1>Open a report</h1>
      <p>Choose the type of issue you want to report.</p>
      <label>Search report types
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} />
      </label>
      {visibleTypes.length ? <ul className="reports">
        {visibleTypes.map(type => (
          <li key={type.id}>
            <Link to="/create/$type" params={{ type: reportTypeSlug(type.name) }}>{type.name}</Link>
            <span>{type.group}</span>
          </li>
        ))}
      </ul> : <p role="status">No matching report types.</p>}
    </main>
  )
}
