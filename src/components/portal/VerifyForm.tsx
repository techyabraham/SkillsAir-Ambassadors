'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { Input } from '@/components/ui/Input'
import { backendErrorMessage } from '@/lib/api-errors'

export function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token')
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(params.get('email') ? 60 : 0)
  useEffect(() => {
    if (seconds > 0) {
      const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
      return () => window.clearTimeout(timer)
    }
  }, [seconds])
  useEffect(() => {
    if (!token) return
    let alive = true
    void (async () => {
      setBusy(true)
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const json = await response.json().catch(() => null)
        if (!alive) return
        if (response.ok) {
          router.replace('/status')
          router.refresh()
        } else
          setError(backendErrorMessage(json, 'This verification link is invalid or has expired.'))
      } catch {
        if (alive)
          setError(
            'The verification service is temporarily unavailable. Try entering the code instead.',
          )
      } finally {
        if (alive) setBusy(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [token, router])
  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok) throw new Error(backendErrorMessage(json, 'We could not verify this code.'))
      router.replace('/status')
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not verify this code.')
    } finally {
      setBusy(false)
    }
  }
  async function resend() {
    setError('')
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (response.ok) setSeconds(60)
      else setError('We could not resend the message right now. Please try again shortly.')
    } catch {
      setError('The verification service is temporarily unavailable. Please try again shortly.')
    }
  }
  if (token)
    return (
      <div role="status" className="space-y-3 text-sm leading-6">
        {busy ? (
          <p>Checking your secure link…</p>
        ) : error ? (
          <>
            <p className="text-danger-text">{error}</p>
            <Link href="/verify" className="font-semibold text-primary underline">
              Enter a code instead
            </Link>
          </>
        ) : (
          <p className="text-success-text">
            Your email is verified. Taking you to your application status…
          </p>
        )}
      </div>
    )
  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="Enter the email address used for your application."
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-ink-2">Six-digit code</label>
        <OtpInput value={code} onChange={setCode} error={error || undefined} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={busy}
        disabled={code.length !== 6}
      >
        Verify email
      </Button>
      <p className="text-center text-sm text-muted">
        Didn’t get the email?{' '}
        <button
          type="button"
          className="min-h-11 font-semibold text-primary underline disabled:text-muted"
          disabled={seconds > 0 || !email}
          onClick={resend}
        >
          {seconds ? `Resend in ${seconds}s` : 'Resend code'}
        </button>
      </p>
      <p className="text-center text-sm">
        <Link href="/apply" className="min-h-11 inline-flex items-center text-primary underline">
          Wrong email? Start again
        </Link>
      </p>
    </form>
  )
}
