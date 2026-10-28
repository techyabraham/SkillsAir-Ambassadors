import { Skeleton } from '@/components/ui/Skeleton'

export default function LinksLoading() {
  return (
    <div role="status" aria-label="Loading programme links" className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-[18px]" />
      <span className="sr-only">Loading programmes and referral links</span>
    </div>
  )
}
