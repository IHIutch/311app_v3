import { createFileRoute } from '@tanstack/react-router'
import { mutation, reportId, saveStatus } from '../../../../server/reports.server'

export const Route = createFileRoute('/api/reports/$id/status')({
  server: {
    handlers: { POST: ({ request, params }) => mutation(request, () => saveStatus(reportId(params.id), request)) },
  },
})
