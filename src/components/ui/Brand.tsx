import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Brand({
  className,
  onDark = false,
  size = 'md',
}: {
  className?: string
  onDark?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <Link
      href="/"
      aria-label="SkillsAir Ambassadors home"
      className={cn(
        'inline-flex items-center gap-2 font-heading font-bold tracking-tight',
        size === 'sm' ? 'text-base' : 'text-xl',
        onDark ? 'text-white' : 'text-navy-900',
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 28 28" className="size-7 shrink-0">
        <rect x="2" y="3" width="24" height="5" rx="2" fill="#15803d" />
        <rect x="2" y="11" width="24" height="5" rx="2" fill="#eab308" />
        <rect x="2" y="19" width="24" height="5" rx="2" fill="#b91c1c" />
      </svg>
      <span>
        Skills<span className="text-accent-text">Air</span>
        <span className="ml-1.5 text-sm font-medium text-muted">Ambassadors</span>
      </span>
    </Link>
  )
}
