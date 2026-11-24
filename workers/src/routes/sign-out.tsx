import { ClerkLoaded, ClerkLoading, Show, SignOutButton } from '@clerk/tanstack-react-start'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-out')({
  headers: () => ({ 'Cache-Control': 'private, no-store' }),
  component: SignOutPage,
})

function SignOutPage() {
  return (
    <main>
      <h1>Sign out of Buffalo 311</h1>
      <ClerkLoading><p role="status">Checking your session…</p></ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-in">
          <SignOutButton redirectUrl="/">
            <button className="button" type="button">Sign out</button>
          </SignOutButton>
        </Show>
        <Show when="signed-out">
          <p>You are signed out.</p>
          <Link to="/">View reports</Link>
        </Show>
      </ClerkLoaded>
    </main>
  )
}
