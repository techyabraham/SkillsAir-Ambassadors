import Link from 'next/link'
import { ArrowRight, MousePointerClick, Users, UserRoundCheck, Repeat2 } from 'lucide-react'
import { serverBackendData } from '@/lib/backend-api'
import { Card, StatCard } from '@/components/ui/Card'
import { MoneyText } from '@/components/ui/MoneyText'
import { ReferralLinkCard } from '@/components/portal/ReferralLinkCard'
import { Sparkline } from '@/components/portal/Sparkline'
import { StatusChip } from '@/components/ui/StatusChip'
import { EmptyState } from '@/components/ui/EmptyState'
import { WithdrawAction } from '@/components/portal/WithdrawAction'
import { LinkBuilder } from '@/components/portal/LinkBuilder'
import { loadPromotableProgrammes } from '@/lib/programmes'
import { SKILLSAIR_MAIN_SITE_URL } from '@/lib/referral-links'
interface Profile {
  user: { firstName: string }
  ambassador: { code: string }
  link: string
  bank: { holdUntil?: string | null } | null
}
interface Summary {
  wallet: { pendingKobo: number; availableKobo: number; totalEarnedKobo: number }
  last30Days: {
    clicks: number
    uniqueVisitors: number
    earningsKobo: number
    series: Array<{ date: string; kobo: number }>
  }
  totals: { prospects: number; customers: number; renewals: number }
}
interface Earning {
  id: number
  type: 'commission' | 'reversal' | 'adjustment'
  status: 'pending' | 'approved' | 'void'
  amountKobo: number
  productTitle: string
  customer: string
  createdAt: string
}
interface Config {
  shareMessage: string
  minPayoutKobo: number
  payoutsEnabled: boolean
}
export default async function DashboardPage() {
  const [profile, summary, activity, config, catalogue] = await Promise.all([
    serverBackendData<Profile>('ambassadors/me'),
    serverBackendData<Summary>('ambassadors/me/summary'),
    serverBackendData<Earning[]>('ambassadors/me/earnings?limit=5'),
    serverBackendData<Config>('ambassadors/config'),
    loadPromotableProgrammes(),
  ])
  const mainSiteUrl = SKILLSAIR_MAIN_SITE_URL
  const programmeLinks = profile ? (
    <section aria-label="Generate a programme referral link">
      <LinkBuilder
        code={profile.ambassador.code}
        mainSiteUrl={mainSiteUrl}
        programmes={catalogue.programmes}
        catalogueUnavailable={catalogue.unavailable}
      />
    </section>
  ) : null
  const payoutReason = !config?.payoutsEnabled
    ? 'Withdrawals are temporarily paused.'
    : !profile?.bank
      ? 'Add a verified bank account in Settings to withdraw.'
      : summary && summary.wallet.availableKobo < (config?.minPayoutKobo ?? 500000)
          ? `Available balance must reach ₦${((config?.minPayoutKobo ?? 500000) / 100).toLocaleString('en-NG')}.`
          : ''
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Your ambassador dashboard</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Welcome{profile?.user.firstName ? `, ${profile.user.firstName}` : ''}
        </h1>
        <p className="mt-2 text-sm text-muted">Here’s how your community is finding SkillsAir.</p>
      </div>
      {!summary ? (
        <>
          <EmptyState
            title="Your dashboard is taking a moment"
            description="We couldn’t load your latest figures. Refresh the page or try again shortly."
          />
          {programmeLinks}
        </>
      ) : (
        <>
          <Card className="overflow-hidden bg-navy-900 p-5 text-white sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-slate-200">Available to withdraw</p>
                <p className="mt-2 font-heading text-4xl font-bold tracking-tight">
                  <MoneyText kobo={summary.wallet.availableKobo} decimals={2} />
                </p>
                <WithdrawAction reason={payoutReason} holdUntil={profile?.bank?.holdUntil} />
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:min-w-64">
                <div>
                  <p className="text-xs text-slate-200">Pending</p>
                  <p className="mt-1 font-semibold">
                    <MoneyText kobo={summary.wallet.pendingKobo} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-200">Total earned</p>
                  <p className="mt-1 font-semibold">
                    <MoneyText kobo={summary.wallet.totalEarnedKobo} />
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <ReferralLinkCard
            link={profile?.link ?? ''}
            shareMessage={
              config?.shareMessage ??
              "I'm learning job-ready tech skills on SkillsAir. Start here: {link}"
            }
          />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              label="Clicks · last 30 days"
              value={summary.last30Days.clicks.toLocaleString('en-NG')}
              icon={<MousePointerClick className="size-5" />}
            />
            <StatCard
              label="Unique visitors"
              value={summary.last30Days.uniqueVisitors.toLocaleString('en-NG')}
              icon={<Users className="size-5" />}
            />
            <StatCard
              label="Customers"
              value={summary.totals.customers.toLocaleString('en-NG')}
              icon={<UserRoundCheck className="size-5" />}
            />
            <StatCard
              label="Renewals"
              value={summary.totals.renewals.toLocaleString('en-NG')}
              icon={<Repeat2 className="size-5" />}
            />
          </div>
          {programmeLinks}
          <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
            <Card className="p-5 sm:p-6">
              <Sparkline series={summary.last30Days.series} />
            </Card>
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-ink">Recent activity</h2>
                <Link
                  href="/dashboard/earnings"
                  className="min-h-11 inline-flex items-center text-sm font-semibold text-primary underline"
                >
                  All earnings
                </Link>
              </div>
              {activity?.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {activity.map((row) => (
                    <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {row.type === 'reversal' ? 'Commission reversal' : row.customer}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {row.productTitle || 'Referral commission'} ·{' '}
                          {new Date(row.createdAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-ink">
                          <MoneyText kobo={row.amountKobo} />
                        </p>
                        <StatusChip status={row.type === 'reversal' ? 'reversed' : row.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pt-5 text-sm leading-6 text-muted">
                  When someone purchases through your link, the commission will appear here.
                </p>
              )}
            </Card>
          </div>
          <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">Potential customers</p>
              <p className="mt-1 text-sm text-muted">
                {summary.totals.prospects.toLocaleString('en-NG')} people have joined through your
                link.
              </p>
            </div>
            <Link
              href="/dashboard/referrals?segment=prospects"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline"
            >
              View prospects
              <ArrowRight className="size-4" />
            </Link>
          </Card>
        </>
      )}
    </div>
  )
}
