import { createFileRoute } from '@tanstack/react-router'
import { mutation, reportId, saveComment } from '../../../../server/reports.server'

export const Route = createFileRoute('/api/reports/$id/comment')({
  server: {
    handlers: { POST: ({ request, params }) => mutation(request, () => saveComment(reportId(params.id), request)) },
  },
})
