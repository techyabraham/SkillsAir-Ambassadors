import Link from 'next/link'
import { serverBackendData } from '@/lib/backend-api'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { MoneyText } from '@/components/ui/MoneyText'
import { StatusChip } from '@/components/ui/StatusChip'
interface Earning {
  id: number
  type: 'commission' | 'reversal' | 'adjustment'
  status: 'pending' | 'approved' | 'void'
  amountKobo: number
  productTitle: string
  customer: string
  createdAt: string
  availableAt?: string | null
}
export default async function EarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const params = await searchParams
  const status = ['pending', 'approved', 'void'].includes(params.status ?? '')
    ? params.status!
    : 'all'
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const rows = await serverBackendData<Earning[]>(
    `ambassadors/me/earnings?status=${status}&page=${page}&limit=20`,
  )
  const grouped: Record<string, Earning[]> = {}
  for (const row of rows ?? []) {
    const date = new Date(row.createdAt)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    const key = `${weekStart.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })} · Week of ${weekStart.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`
    ;(grouped[key] ??= []).push(row)
  }
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Commission history</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">Earnings</h1>
        <p className="mt-2 text-sm text-muted">
          Pending commissions become available after the refund approval window.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ['all', 'All'],
          ['pending', 'Pending'],
          ['approved', 'Approved'],
          ['void', 'Void'],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/dashboard/earnings?status=${key}`}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${status === key ? 'border-primary bg-primary-100 text-primary' : 'border-line bg-white text-ink-2'}`}
          >
            {label}
          </Link>
        ))}
      </div>
      {rows?.length ? (
        <div className="space-y-5">
          {Object.entries(grouped).map(([label, entries]) => (
            <section key={label}>
              <h2 className="mb-3 text-sm font-semibold text-ink-2">{label}</h2>
              <Card className="divide-y divide-line overflow-hidden">
                {entries.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {row.productTitle ||
                          (row.type === 'reversal' ? 'Commission reversal' : 'Referral commission')}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {row.customer} ·{' '}
                        {new Date(row.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      {row.status === 'pending' && row.availableAt && (
                        <p className="mt-1 text-xs text-pending-chip-text">
                          Available{' '}
                          {new Date(row.availableAt).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span
                        className={
                          row.amountKobo < 0
                            ? 'font-semibold text-danger-text'
                            : 'font-semibold text-ink'
                        }
                      >
                        <MoneyText kobo={row.amountKobo} />
                      </span>
                      <StatusChip status={row.type === 'reversal' ? 'reversed' : row.status} />
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          ))}
          <div className="flex justify-between text-sm">
            {page > 1 ? (
              <Link
                href={`/dashboard/earnings?status=${status}&page=${page - 1}`}
                className="min-h-11 inline-flex items-center font-semibold text-primary underline"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {rows.length === 20 && (
              <Link
                href={`/dashboard/earnings?status=${status}&page=${page + 1}`}
                className="min-h-11 inline-flex items-center font-semibold text-primary underline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No earnings to show"
          description="Referral commissions will appear here after a referred customer completes an eligible purchase."
        />
      )}
    </div>
  )
}
