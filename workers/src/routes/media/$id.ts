import { createFileRoute } from '@tanstack/react-router'
import { getPhoto } from '../../server/reports.server'

export const Route = createFileRoute('/media/$id')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const id = Number(params.id)
        return /^[1-9]\d*$/.test(params.id) && Number.isSafeInteger(id)
          ? getPhoto(id)
          : new Response(null, { status: 404 })
      },
    },
  },
})
