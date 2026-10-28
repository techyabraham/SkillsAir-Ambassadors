export function Skeleton({ className = 'h-5 w-full' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
}

export function PageSkeleton() {
  return (
    <div aria-label="Loading page" role="status" className="space-y-5">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-32 w-full rounded-[18px]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
