'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { BankCombobox, type BankOption } from '@/components/ui/BankCombobox'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { backendErrorMessage } from '@/lib/api-errors'

interface CurrentBank {
  bankName: string
  accountName: string
  accountLast4: string
  holdUntil?: string | null
}
export function BankAccountForm({ current }: { current: CurrentBank | null }) {
  const [banks, setBanks] = useState<BankOption[]>([])
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [resolvedFor, setResolvedFor] = useState('')
  const [busyResolve, setBusyResolve] = useState(false)
  const [busySave, setBusySave] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  useEffect(() => {
    void fetch('/api/banks')
      .then((response) => response.json())
      .then((json) => {
        if (Array.isArray(json?.data)) setBanks(json.data)
      })
      .catch(() => setError('Banks could not be loaded. Refresh and try again.'))
  }, [])
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) return
    let alive = true
    const timer = window.setTimeout(async () => {
      setBusyResolve(true)
      setError('')
      try {
        const response = await fetch('/api/banks/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bankCode, accountNumber }),
        })
        const json = await response.json().catch(() => null)
        if (!response.ok)
          throw new Error(backendErrorMessage(json, 'Could not confirm this account.'))
        if (alive) {
          setAccountName(json?.data?.accountName ?? '')
          setResolvedFor(`${bankCode}:${accountNumber}`)
        }
      } catch (cause) {
        if (alive) {
          setResolvedFor('')
          setError(cause instanceof Error ? cause.message : 'Could not confirm this account.')
        }
      } finally {
        if (alive) setBusyResolve(false)
      }
    }, 300)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [accountNumber, bankCode])
  async function save() {
    setError('')
    setBusySave(true)
    try {
      const response = await fetch('/api/bank-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCode, accountNumber }),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(backendErrorMessage(json, 'Could not update your bank account.'))
      showToast('Payout account updated.')
      setAccountNumber('')
      setBankCode('')
      setAccountName('')
      setResolvedFor('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update your bank account.')
    } finally {
      setBusySave(false)
    }
  }
  return (
    <Card className="space-y-5 p-5 sm:p-7">
      <div>
        <h2 className="font-heading text-lg font-bold text-ink">Payout account</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          The account name is checked with Paystack before saving. Changing banks may start a
          security hold.
        </p>
      </div>
      {current && (
        <div className="rounded-xl border border-line p-4">
          <p className="font-semibold text-ink">{current.bankName}</p>
          <p className="mt-1 text-sm text-muted">
            {current.accountName} · •••• {current.accountLast4}
          </p>
          {current.holdUntil && new Date(current.holdUntil) > new Date() && (
            <p className="mt-2 text-sm text-pending-chip-text">
              Payouts are on hold until {new Date(current.holdUntil).toLocaleString('en-NG')}.
            </p>
          )}
        </div>
      )}
      <BankCombobox
        banks={banks}
        value={bankCode}
        onChange={(value) => {
          setBankCode(value)
          setError('')
        }}
      />
      <Input
        label="10-digit account number"
        name="accountNumber"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        value={accountNumber}
        onChange={(event) => {
          setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
          setError('')
          setBusyResolve(false)
        }}
      />
      {busyResolve && (
        <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="size-4 animate-spin" />
          Confirming account…
        </p>
      )}
      {accountName && resolvedFor === `${bankCode}:${accountNumber}` && (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-xl bg-success-bg p-4 text-sm font-medium text-success-text"
        >
          <CheckCircle2 className="size-5" />
          Confirmed account name: {accountName}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button
        type="button"
        loading={busySave}
        disabled={!accountName || resolvedFor !== `${bankCode}:${accountNumber}` || busyResolve}
        onClick={save}
      >
        Save payout account
      </Button>
    </Card>
  )
}
