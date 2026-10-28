import type { Metadata } from 'next'
import { serverBackendData } from '@/lib/backend-api'
import { PayoutManager } from '@/components/portal/PayoutManager'
export const metadata: Metadata = { title: 'Payouts' }
interface Profile {
  bank: { bankName: string; accountName: string; accountLast4: string; holdUntil?: string | null } | null
}
interface Summary { wallet: { availableKobo: number } }
interface Config { payoutMode: 'manual_review' | 'automatic'; minPayoutKobo: number; payoutsEnabled: boolean }
export default async function PayoutsPage() {
  const [profile, summary, config] = await Promise.all([
    serverBackendData<Profile>('ambassadors/me'),
    serverBackendData<Summary>('ambassadors/me/summary'),
    serverBackendData<Config>('ambassadors/config'),
  ])
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Your money</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">Payouts</h1>
        <p className="mt-2 text-sm text-muted">
          Request withdrawals to your verified Nigerian bank account.
        </p>
      </div>
      <PayoutManager availableKobo={summary?.wallet.availableKobo ?? 0} minPayoutKobo={config?.minPayoutKobo ?? 500000} payoutsEnabled={config?.payoutsEnabled ?? false} payoutMode={config?.payoutMode ?? 'manual_review'} bank={profile?.bank ?? null} />
    </div>
  )
}
