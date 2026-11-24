import * as Sentry from '@sentry/cloudflare'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'
import handler from '@tanstack/react-start/server-entry'
import { sentryOptions } from './monitoring'

const start = wrapFetchWithSentry(handler)

export default Sentry.withSentry(() => sentryOptions, {
  fetch(request: Request) {
    return start.fetch(request)
  },
})
