import Link from 'next/link'
import { CircleAlert } from 'lucide-react'

export function ApiNotice({
  title = 'We could not load this yet',
  message = 'Please try again in a moment.',
}: {
  title?: string
  message?: string
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-3 rounded-[18px] border border-line bg-white p-5 sm:flex-row sm:items-center"
    >
      <CircleAlert className="size-5 shrink-0 text-pending-text" aria-hidden="true" />
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      <Link
        href="/dashboard"
        className="min-h-11 rounded-xl px-3 py-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:ml-auto"
      >
        Back to home
      </Link>
    </div>
  )
}
