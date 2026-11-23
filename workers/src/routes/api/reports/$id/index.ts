import { createFileRoute } from '@tanstack/react-router'
import { deleteReport, mutation, reportId } from '../../../../server/reports.server'

export const Route = createFileRoute('/api/reports/$id/')({
  server: {
    handlers: { DELETE: ({ request, params }) => mutation(request, () => deleteReport(reportId(params.id))) },
  },
})
