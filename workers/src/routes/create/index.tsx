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

  return (
    <main>
      <h1>Open a report</h1>
      <p>Choose the type of issue you want to report.</p>
      <ul className="reports">
        {types.map(type => (
          <li key={type.id}>
            <Link to="/create/$type" params={{ type: reportTypeSlug(type.name) }}>{type.name}</Link>
            <span>{type.group}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
