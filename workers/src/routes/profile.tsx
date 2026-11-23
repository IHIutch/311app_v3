import { ClerkLoaded, ClerkLoading, Show, UserProfile } from '@clerk/tanstack-react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const requireSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated } = await auth()
  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' })
  }
  const { ownedReports } = await import('../server/reports.server')
  return ownedReports()
})

export const Route = createFileRoute('/profile')({
  loader: () => requireSession(),
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: Profile,
})

function Profile() {
  const reports = Route.useLoaderData()
  return (
    <main>
      <h1>Account</h1>
      <h2>My reports</h2>
      {reports.length ? <ul>{reports.map(report => (
        <li key={report.id}><Link to="/reports/$id" params={{ id: String(report.id) }}>
          #{report.id} {report.typeName}
        </Link></li>
      ))}</ul> : <p>You have no reports yet.</p>}
      <ClerkLoading>
        <p role="status">Loading your account…</p>
      </ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-in">
          <UserProfile routing="hash" />
        </Show>
      </ClerkLoaded>
    </main>
  )
}
