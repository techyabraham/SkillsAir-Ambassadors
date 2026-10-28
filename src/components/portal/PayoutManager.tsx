'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { AlertCircle, Banknote, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusChip, type ChipStatus } from '@/components/ui/StatusChip'
import { useToast } from '@/components/ui/Toast'
import { formatNaira } from '@/lib/money'
import { backendErrorMessage } from '@/lib/api-errors'

interface Payout {
  id: number
  amountKobo: number
  status: ChipStatus
  bankName: string
  accountLast4: string
  createdAt: string
  processedAt: string | null
  failureReason: string | null
}
interface Bank {
  bankName: string
  accountName: string
  accountLast4: string
  holdUntil?: string | null
}
interface PayoutResponse { data?: Payout[]; error?: { message?: string } }

function fetchPayouts(url: string): Promise<PayoutResponse> {
  return fetch(url, { cache: 'no-store' }).then(async (response) => {
    const json = await response.json().catch(() => ({})) as PayoutResponse
    if (!response.ok) throw new Error(backendErrorMessage(json, 'Payout history could not be loaded.'))
    return json
  })
}

function cleanAmount(value: string): number {
  const parsed = Number(value.replace(/,/g, '').trim())
  if (!Number.isFinite(parsed) || parsed < 0 || !Number.isSafeInteger(Math.round(parsed * 100))) return 0
  return Math.round(parsed * 100)
}

function amountInput(value: string): string {
  const plain = value.replace(/[^\d.]/g, '')
  const [whole = '', ...fractionParts] = plain.split('.')
  const fraction = fractionParts.join('').slice(0, 2)
  const formatted = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fractionParts.length ? `${formatted}.${fraction}` : formatted
}

export function PayoutManager({
  availableKobo,
  minPayoutKobo,
  payoutsEnabled,
  payoutMode,
  bank,
}: {
  availableKobo: number
  minPayoutKobo: number
  payoutsEnabled: boolean
  payoutMode: 'manual_review' | 'automatic'
  bank: Bank | null
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [amount, setAmount] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(0)
  const requestKey = useRef<string | null>(null)
  const { data, error: loadError, isLoading, mutate } = useSWR<PayoutResponse>('/api/payouts?page=1&limit=20', fetchPayouts, {
    refreshInterval: (latest) => latest?.data?.some((row) => row.status === 'requested' || row.status === 'processing') ? 10_000 : 0,
    revalidateOnFocus: true,
  })
  const rows = data?.data ?? []
  const amountKobo = cleanAmount(amount)
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0)
    return () => window.clearTimeout(timer)
  }, [])
  const held = Boolean(bank?.holdUntil && (!now || Date.parse(bank.holdUntil) > now))
  const canWithdraw = payoutsEnabled && Boolean(bank) && !held && availableKobo >= minPayoutKobo
  const reason = useMemo(() => {
    if (!payoutsEnabled) return 'Withdrawals are temporarily paused.'
    if (!bank) return 'Add a verified payout account in Settings to withdraw.'
    if (held && bank?.holdUntil) return `Your new bank account is available after ${new Date(bank.holdUntil).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}.`
    if (availableKobo < minPayoutKobo) return `Your available balance must reach ${formatNaira(minPayoutKobo)}.`
    return ''
  }, [availableKobo, bank, held, minPayoutKobo, payoutsEnabled])

  async function submitPayout() {
    setSubmitting(true)
    setError('')
    requestKey.current ??= crypto.randomUUID()
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey.current },
        body: JSON.stringify({ amountKobo }),
      })
      const json = await response.json().catch(() => null) as { success?: boolean; data?: { payout?: Payout }; error?: { message?: string } } | null
      if (!response.ok || !json?.success) {
        const message = backendErrorMessage(json, 'Your withdrawal could not be requested. Please try again.')
        setError(message)
        if (response.status < 500) requestKey.current = null
        return
      }
      requestKey.current = null
      setConfirming(false)
      setAmount('')
      await mutate()
      router.refresh()
      showToast('Withdrawal request received.')
    } catch {
      setError('We could not confirm whether your request reached SkillsAir. Retry safely; we will reuse the same request key.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
        <div>
          <p className="text-sm text-muted">Available balance</p>
          <p className="mt-2 font-heading text-3xl font-bold text-navy-900">{formatNaira(availableKobo, { decimals: 2 })}</p>
          <p className="mt-2 text-sm text-muted">Minimum withdrawal: {formatNaira(minPayoutKobo)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary-100 p-4 text-sm font-semibold text-primary">
          <Clock3 className="size-5 shrink-0" />
          {payoutMode === 'manual_review' ? 'We review payouts within one working day.' : 'Eligible payouts usually arrive in minutes.'}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Banknote className="size-5 text-primary" /><h2 className="font-heading text-lg font-bold text-ink">Payout account</h2></div>
          <a href="/dashboard/settings" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Change</a>
        </div>
        {bank ? <div className="mt-4 rounded-xl border border-line p-4">
          <p className="font-semibold text-ink">{bank.bankName}</p>
          <p className="mt-1 text-sm text-muted">{bank.accountName} · •••• {bank.accountLast4}</p>
          {held && bank.holdUntil ? <p className="mt-2 text-sm text-pending-chip-text">Available for payouts after {new Date(bank.holdUntil).toLocaleDateString('en-NG')}.</p> : null}
        </div> : <p className="mt-4 text-sm text-muted">Add and verify a bank account in Settings before requesting a payout.</p>}
      </Card>

      <Card className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">Request a withdrawal</h2>
          <p className="mt-1 text-sm text-muted">Choose an amount from your available balance.</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-2">Amount</span>
          <span className="flex min-h-12 items-center rounded-xl border border-line bg-white px-4 focus-within:ring-2 focus-within:ring-primary">
            <span className="mr-2 text-muted">₦</span>
            <input aria-label="Withdrawal amount in naira" inputMode="decimal" autoComplete="off" value={amount} onChange={(event) => { setAmount(amountInput(event.target.value)); setError('') }} className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none" placeholder="5,000" />
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[['₦10,000', 1_000_000], ['₦20,000', 2_000_000], ['Everything', Math.max(0, availableKobo)]].map(([label, value]) => (
            <button key={String(label)} type="button" onClick={() => setAmount((Number(value) / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 }))} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-primary hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{label}</button>
          ))}
        </div>
        {!canWithdraw ? <p className="text-sm text-muted">{reason}</p> : null}
        {error ? <p role="alert" className="flex items-start gap-2 text-sm text-danger-text"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</p> : null}
        <Button type="button" size="lg" disabled={!canWithdraw || amountKobo < minPayoutKobo || amountKobo > availableKobo} onClick={() => setConfirming(true)}>
          Review withdrawal
        </Button>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-ink">Payout history</h2>
        {isLoading ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-surface" aria-label="Loading payout history" /> : null}
        {loadError ? <p role="alert" className="mt-4 text-sm text-danger-text">{loadError.message} <button type="button" className="font-semibold underline" onClick={() => void mutate()}>Try again</button></p> : null}
        {!isLoading && !loadError && rows.length === 0 ? <div className="mt-4"><EmptyState title="No withdrawals yet" description="Your withdrawal requests and transfer updates will appear here." /></div> : null}
        {rows.length ? <ul className="mt-4 divide-y divide-line">
          {rows.map((row) => <li key={row.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold text-ink">{formatNaira(row.amountKobo)}</p><p className="mt-1 text-xs text-muted">{row.bankName} · •••• {row.accountLast4} · {new Date(row.createdAt).toLocaleDateString('en-NG')}</p>{row.failureReason ? <p className="mt-2 text-sm text-danger-text">{row.failureReason}</p> : null}</div>
            <StatusChip status={row.status} />
          </li>)}
        </ul> : null}
      </Card>

      {confirming ? <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="confirm-payout-title" className="w-full max-w-md rounded-2xl border border-line bg-white p-6">
          <h2 id="confirm-payout-title" className="font-heading text-xl font-bold text-navy-900">Confirm withdrawal</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Request {formatNaira(amountKobo)} to {bank?.bankName} account ending {bank?.accountLast4}. {payoutMode === 'manual_review' ? 'SkillsAir will review this request.' : 'Eligible requests can be sent automatically.'}</p>
          {error ? <p role="alert" className="mt-3 text-sm text-danger-text">{error}</p> : null}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" type="button" disabled={submitting} onClick={() => setConfirming(false)}>Go back</Button>
            <Button type="button" loading={submitting} onClick={() => void submitPayout()}>Confirm withdrawal</Button>
          </div>
        </section>
      </div> : null}
    </div>
  )
}
