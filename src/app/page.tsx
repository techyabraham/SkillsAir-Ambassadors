import Link from 'next/link'
import { ArrowRight, BadgePercent, Banknote, ShieldCheck } from 'lucide-react'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { serverBackendData } from '@/lib/backend-api'

interface PortalConfig {
  programOpen: boolean
  commissionPercent: number
  approvalDelayDays: number
  minPayoutKobo: number
  heardAboutOptions: string[]
  shareMessage: string
}

const faq = [
  [
    'Who can become an ambassador?',
    'Anyone with a SkillsAir account can apply. We review applications before your referral link becomes active.',
  ],
  [
    'When do commissions become available?',
    'Commissions are held for the approval period to account for refunds, then added to your available balance.',
  ],
  [
    'How do payouts work?',
    'Add a Nigerian bank account and request a withdrawal once your available balance reaches the minimum. Payouts are reviewed by the SkillsAir team.',
  ],
]

export default async function HomePage() {
  const config = await serverBackendData<PortalConfig>('ambassadors/config')
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/apply"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Become an ambassador
          </Link>
        </nav>
      </header>
      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 text-sm font-semibold text-primary">
              <BadgePercent aria-hidden="true" className="size-4" />
              SkillsAir Ambassadors
            </p>
            <h1 className="mt-6 max-w-2xl font-heading text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              Share skills that change lives. Earn when people learn.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-2">
              Recommend practical tech courses to your community and earn a commission when someone
              learns through your link.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
              >
                Apply to join <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-primary bg-white px-5 text-base font-semibold text-primary hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
              >
                Log in to your portal
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Applications are reviewed by the SkillsAir team.
            </p>
          </div>
          <Card className="overflow-hidden border-navy-900 bg-navy-900 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold text-slate-200">Your share can add up</p>
            <p className="mt-3 font-heading text-5xl font-bold">
              {config ? `${config.commissionPercent}%` : '—'}
            </p>
            <p className="mt-2 max-w-sm leading-6 text-slate-200">
              commission on eligible course purchases
              {config ? `, available after ${config.approvalDelayDays} days` : ''}.
            </p>
            <div className="my-7 h-px bg-white/20" />
            <div className="flex items-start gap-3">
              <Banknote aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-orange-300" />
              <p className="text-sm leading-6 text-slate-100">
                Request a payout to your Nigerian bank account when your available balance reaches ₦
                {config ? (config.minPayoutKobo / 100).toLocaleString('en-NG') : '5,000'}.
              </p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-orange-300" />
              <p className="text-sm leading-6 text-slate-100">
                Track clicks, referrals and commissions in one clear dashboard.
              </p>
            </div>
          </Card>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-ink">
            Simple to share. Clear to track.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            [
              '01',
              'Apply',
              'Tell us who you are and how you plan to introduce SkillsAir to your community.',
            ],
            ['02', 'Share', 'Once approved, use your unique link on any SkillsAir page or course.'],
            ['03', 'Earn', 'See eligible purchases and available commissions in your portal.'],
          ].map(([step, title, copy]) => (
            <Card key={step} className="p-5 sm:p-6">
              <span className="text-sm font-bold text-accent-text">{step}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-text">
            Questions
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-ink">A few useful details</h2>
          <div className="mt-6 space-y-3">
            {faq.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-line bg-white p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl text-primary group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <footer className="flex flex-col items-center justify-between gap-3 px-5 py-7 text-sm text-muted sm:flex-row sm:px-8">
        <Brand size="sm" />
        <p>© SkillsAir. Learn skills. Build your future.</p>
      </footer>
    </main>
  )
}
