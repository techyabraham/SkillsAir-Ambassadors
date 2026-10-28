import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { serverBackendData } from '@/lib/backend-api'

interface Profile {
  user: { firstName: string; email: string }
  ambassador: {
    status: 'pending' | 'active' | 'blocked'
    emailVerified: boolean
    blockedReason?: string
  }
}
export default async function StatusPage() {
  const profile = await serverBackendData<Profile>('ambassadors/me')
  if (!profile) redirect('/login')
  if (!profile.ambassador.emailVerified)
    redirect(`/verify?email=${encodeURIComponent(profile.user.email)}`)
  if (profile.ambassador.status === 'active') redirect('/dashboard')
  const blocked = profile.ambassador.status === 'blocked'
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Brand className="mb-7" />
        <Card className="p-6 sm:p-9">
          <span
            className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-semibold ${blocked ? 'bg-danger-bg text-danger-text' : 'bg-pending-bg text-pending-chip-text'}`}
          >
            {blocked ? 'Blocked' : 'Pending review'}
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-navy-900">
            {blocked ? 'Your account is currently paused' : 'Application received'}
          </h1>
          {blocked ? (
            <>
              <p className="mt-4 leading-7 text-ink-2">
                {profile.ambassador.blockedReason ||
                  'Please contact the SkillsAir team for more information about your account.'}
              </p>
              <p className="mt-3 text-sm text-muted">
                Your account history and approved earnings are retained. Withdrawals are unavailable
                while your account is blocked.
              </p>
              <a
                href="mailto:support@skillsair.com"
                className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                Contact SkillsAir support
              </a>
            </>
          ) : (
            <>
              <p className="mt-4 leading-7 text-ink-2">
                Thanks, {profile.user.firstName}. The SkillsAir team will review your application.
                We’ll email you when your referral link is ready.
              </p>
              <div className="mt-6 rounded-xl bg-primary-100 p-4 text-sm leading-6 text-primary">
                You can close this page. Once approved, log in to see your link, referrals and
                earnings.
              </div>
            </>
          )}
          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary underline"
          >
            Back to SkillsAir Ambassadors
          </Link>
        </Card>
      </div>
    </main>
  )
}
