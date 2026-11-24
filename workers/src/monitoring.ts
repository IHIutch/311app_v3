import type { ErrorEvent, EventHint } from '@sentry/cloudflare'
import { isNotFound, isRedirect } from '@tanstack/react-router'

export const sentryOptions = {
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_BUFFALO311_ENV,
  beforeSend(event: ErrorEvent, hint: EventHint) {
    const error = hint.originalException
    if (isNotFound(error) || isRedirect(error) || (error instanceof Response && error.status < 500)) {
      return null
    }
    return event
  },
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    stackFrameVariables: false,
  },
}
