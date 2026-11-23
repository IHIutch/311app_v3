import { SignUp } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <main>
      <h1>Sign up for Buffalo 311</h1>
      <SignUp routing="hash" signInUrl="/sign-in" fallbackRedirectUrl="/profile" />
    </main>
  )
}
