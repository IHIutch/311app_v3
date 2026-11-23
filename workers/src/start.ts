import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createCsrfMiddleware, createServerOnlyFn, createStart } from '@tanstack/react-start'

const csrf = createCsrfMiddleware({
  filter: (context) => context.handlerType === 'serverFn',
})

const getClerkOptions = createServerOnlyFn(async () => {
  const { env } = await import('cloudflare:workers')
  return { secretKey: env.CLERK_SECRET_KEY }
})

export const startInstance = createStart(() => ({
  requestMiddleware: [csrf, clerkMiddleware(getClerkOptions)],
}))
