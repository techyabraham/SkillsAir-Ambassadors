import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[18px] border border-line bg-white', className)} {...props} />
}

export function StatCard({
  label,
  value,
  note,
  icon,
  className,
}: {
  label: string
  value: ReactNode
  note?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('min-h-28 p-4 sm:p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</div>
          {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
        </div>
        {icon ? <span className="rounded-xl bg-primary-100 p-2 text-primary">{icon}</span> : null}
      </div>
    </Card>
  )
}
