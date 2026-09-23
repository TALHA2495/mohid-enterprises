'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function AdminLoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password) {
      setError('Enter the admin password.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Sign-in failed. Try again.')
        setSubmitting(false)
        return
      }
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('Network error — check your connection and try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <label className="grid gap-1 text-xs font-medium text-black/85">
        Admin password
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-black/10 bg-black/[0.03] p-3 text-sm font-normal text-black outline-none focus:border-[#00c853] focus-visible:ring-2 focus-visible:ring-[#00c853]/40"
        />
      </label>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="rounded-lg border border-[#c62828]/30 bg-[#c62828]/[0.04] p-3 text-xs font-normal text-[#c62828]">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#01aa3f] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#00ff59] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
