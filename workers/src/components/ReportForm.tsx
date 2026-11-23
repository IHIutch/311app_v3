import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'

export function ReportForm({ action, children, submit, onCreated }: {
  action: string
  children: ReactNode
  submit: string
  onCreated?: (id: number) => void
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    setPending(true)
    setError('')
    try {
      const response = await fetch(action, { method: 'POST', body: new FormData(form) })
      if (!response.ok) {
        const failure = await response.json<{ error?: string }>().catch(() => ({ error: undefined }))
        throw new Error(failure.error || 'Unable to save your changes.')
      }
      if (onCreated) {
        const { id } = await response.json<{ id: number }>()
        onCreated(id)
      } else {
        form.reset()
        await router.invalidate()
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to save your changes.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={action} method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
      <fieldset disabled={pending}>
        {children}
        {error && <p role="alert">{error}</p>}
        <button type="submit">{pending ? 'Saving…' : submit}</button>
      </fieldset>
    </form>
  )
}
