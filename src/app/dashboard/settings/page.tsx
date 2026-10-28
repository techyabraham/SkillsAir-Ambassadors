import type { Metadata } from 'next'
import { serverBackendData } from '@/lib/backend-api'
import { Card } from '@/components/ui/Card'
import { BankAccountForm } from '@/components/portal/BankAccountForm'
import { ChangePasswordForm } from '@/components/portal/ChangePasswordForm'
export const metadata: Metadata = { title: 'Settings' }
interface Profile {
  user: { firstName: string; lastName: string; email: string }
  bank: {
    bankName: string
    accountName: string
    accountLast4: string
    holdUntil?: string | null
  } | null
}
export default async function SettingsPage() {
  const profile = await serverBackendData<Profile>('ambassadors/me')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Your account</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">Settings</h1>
      </div>
      <Card className="p-5 sm:p-7">
        <h2 className="font-heading text-lg font-bold text-ink">Profile</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Name</dt>
            <dd className="mt-1 text-sm text-ink">
              {profile ? `${profile.user.firstName} ${profile.user.lastName}` : 'Unavailable'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 break-all text-sm text-ink">
              {profile?.user.email ?? 'Unavailable'}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-muted">
          To update your name or email, contact SkillsAir support.
        </p>
      </Card>
      <BankAccountForm current={profile?.bank ?? null} />
      <ChangePasswordForm />
    </div>
  )
}
