'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Card } from '@/components/ui/Card'
import { backendErrorMessage } from '@/lib/api-errors'
import { useToast } from '@/components/ui/Toast'
import { isStrongPassword } from '@/lib/password'

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { showToast } = useToast()
  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!isStrongPassword(newPassword))
      return setError(
        'Use at least 8 characters with uppercase and lowercase letters, a number and a symbol.',
      )
    setBusy(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(backendErrorMessage(json, 'Could not change your password.'))
      setCurrentPassword('')
      setNewPassword('')
      showToast('Password changed.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not change your password.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card className="p-5 sm:p-7">
      <h2 className="font-heading text-lg font-bold text-ink">Change password</h2>
      <form onSubmit={submit} className="mt-5 space-y-5">
        <PasswordInput
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <PasswordInput
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-danger-text">
            {error}
          </p>
        )}
        <Button type="submit" loading={busy}>
          Update password
        </Button>
      </form>
    </Card>
  )
}
