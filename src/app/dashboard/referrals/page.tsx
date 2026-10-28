import Link from 'next/link'
import { serverBackendData } from '@/lib/backend-api'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
interface Referral {
  name: string
  email?: string | null
  joinedAt: string
  paidOrders: number
  lastPurchaseAt?: string | null
}
export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; page?: string }>
}) {
  const params = await searchParams
  const segment = params.segment === 'prospects' ? 'prospects' : 'customers'
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const rows = await serverBackendData<Referral[]>(
    `ambassadors/me/referrals?segment=${segment}&page=${page}&limit=20`,
  )
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Your community</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Referrals
        </h1>
        <p className="mt-2 text-sm text-muted">
          See who joined through your link and which customers have purchased.
        </p>
      </div>
      <div className="flex gap-2 border-b border-line">
        <Tab href="/dashboard/referrals?segment=customers" active={segment === 'customers'}>
          Customers
        </Tab>
        <Tab href="/dashboard/referrals?segment=prospects" active={segment === 'prospects'}>
          Prospects
        </Tab>
      </div>
      {rows?.length ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {rows.map((row, index) => (
              <div
                key={`${row.joinedAt}-${index}`}
                className="grid gap-2 p-4 sm:grid-cols-[1fr_1.4fr_1fr_1fr] sm:items-center sm:px-6"
              >
                <div>
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    Joined{' '}
                    {new Date(row.joinedAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <p className="break-all text-sm text-muted">{row.email || 'Email hidden'}</p>
                <p className="text-sm text-ink">
                  {row.paidOrders} paid {row.paidOrders === 1 ? 'order' : 'orders'}
                </p>
                <p className="text-sm text-muted">
                  {row.lastPurchaseAt
                    ? `Last purchase ${new Date(row.lastPurchaseAt).toLocaleDateString('en-NG')}`
                    : 'No purchases yet'}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-line p-4 text-sm">
            <span className="text-muted">Page {page}</span>
            <div className="flex gap-3">
              {page > 1 && (
                <Link
                  href={`/dashboard/referrals?segment=${segment}&page=${page - 1}`}
                  className="font-semibold text-primary underline"
                >
                  Previous
                </Link>
              )}
              {rows.length === 20 && (
                <Link
                  href={`/dashboard/referrals?segment=${segment}&page=${page + 1}`}
                  className="font-semibold text-primary underline"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title={segment === 'customers' ? 'No customers yet' : 'No prospects yet'}
          description="As people join SkillsAir through your referral link, they’ll appear here."
        />
      )}
    </div>
  )
}
function Tab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-semibold ${active ? 'border-primary text-primary' : 'border-transparent text-muted'}`}
    >
      {children}
    </Link>
  )
}
