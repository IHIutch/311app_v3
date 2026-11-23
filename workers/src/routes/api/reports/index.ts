import { createFileRoute } from '@tanstack/react-router'
import { createReport, mutation } from '../../../server/reports.server'

export const Route = createFileRoute('/api/reports/')({
  server: {
    handlers: { POST: ({ request }) => mutation(request, () => createReport(request)) },
  },
})
