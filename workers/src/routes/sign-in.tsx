import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <main>
      <h1>Sign in to Buffalo 311</h1>
      <SignIn routing="hash" signUpUrl="/register" fallbackRedirectUrl="/profile" />
    </main>
  )
}
