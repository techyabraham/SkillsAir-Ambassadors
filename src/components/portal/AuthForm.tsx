'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { backendErrorMessage } from '@/lib/api-errors'
import { isStrongPassword } from '@/lib/password'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok) throw new Error(backendErrorMessage(json, 'We could not sign you in.'))
      const next = params.get('next')
      router.replace(next?.startsWith('/dashboard') ? next : '/dashboard')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not sign you in.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="min-h-11 inline-flex items-center text-sm font-semibold text-primary underline underline-offset-4"
        >
          Forgot password?
        </Link>
      </div>
      {params.get('service') === 'unavailable' && (
        <p role="status" className="rounded-xl bg-pending-bg p-3 text-sm text-pending-chip-text">
          SkillsAir is temporarily unavailable. Your session has not been cleared; please try again.
        </p>
      )}
      {params.get('reset') === 'success' && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success-text">
          Your password has been reset. Log in with your new password.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-danger-bg p-3 text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={busy}>
        Log in
      </Button>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const json = await response.json().catch(() => null)
        throw new Error(backendErrorMessage(json, 'Please try again.'))
      }
      setDone(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  if (done)
    return (
      <p role="status" className="rounded-xl bg-success-bg p-4 text-sm leading-6 text-success-text">
        If an account exists for that email, we’ve sent password reset instructions.
      </p>
    )
  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={busy}>
        Send reset link
      </Button>
    </form>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!token) return setError('This reset link is missing its token. Request another link.')
    if (!isStrongPassword(password))
      return setError(
        'Use at least 8 characters, including uppercase and lowercase letters, a number and a symbol.',
      )
    if (password !== confirmPassword) return setError('Your passwords do not match.')
    setBusy(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(backendErrorMessage(json, 'We could not reset your password.'))
      router.replace('/login?reset=success')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not reset your password.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={busy}>
        Set new password
      </Button>
    </form>
  )
}
