import { formatNaira } from '@/lib/money'
import { cn } from '@/lib/utils'

export function MoneyText({
  kobo,
  decimals = 0,
  className,
  sign = false,
}: {
  kobo: number
  decimals?: 0 | 2
  className?: string
  sign?: boolean
}) {
  const absolute = formatNaira(Math.abs(kobo), { decimals })
  const value = sign && kobo > 0 ? `+${absolute}` : kobo < 0 ? `−${absolute}` : absolute
  return <span className={cn('tabular-nums', className)}>{value}</span>
}
