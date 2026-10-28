'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function WithdrawAction({
  reason,
  holdUntil,
}: {
  reason: string
  holdUntil?: string | null
}) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0)
    return () => window.clearTimeout(timer)
  }, [])
  const held = Boolean(holdUntil && (!now || Date.parse(holdUntil) > now))
  const message = held && holdUntil
    ? `Your bank account is on hold until ${new Date(holdUntil).toLocaleDateString('en-NG')}.`
    : reason
  if (message) return (
    <div className="mt-4 space-y-1">
      <button type="button" disabled aria-describedby="withdraw-reason" className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-white/70 px-4 text-sm font-semibold text-navy-900/70">
        Withdraw <ArrowRight className="size-4" />
      </button>
      <p id="withdraw-reason" className="max-w-xs text-xs text-slate-200">{message}</p>
    </div>
  )
  return (
    <Link href="/dashboard/payouts" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
      Withdraw <ArrowRight className="size-4" />
    </Link>
  )
}
