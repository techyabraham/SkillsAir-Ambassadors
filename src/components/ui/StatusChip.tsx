import { cn } from '@/lib/utils'

export type ChipStatus =
  | 'pending'
  | 'approved'
  | 'paid'
  | 'void'
  | 'reversed'
  | 'processing'
  | 'failed'
  | 'requested'
  | 'success'
  | 'rejected'
  | 'reserved'

const copy: Record<ChipStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  void: 'Voided',
  reversed: 'Reversed',
  processing: 'Processing',
  failed: 'Failed',
  requested: 'Requested',
  success: 'Paid',
  rejected: 'Rejected',
  reserved: 'Reserved',
}
const colours: Record<ChipStatus, string> = {
  pending: 'bg-pending-bg text-pending-chip-text',
  approved: 'bg-success-bg text-success-text',
  paid: 'bg-primary-100 text-primary',
  void: 'bg-surface text-muted',
  reversed: 'bg-danger-bg text-danger-text',
  processing: 'bg-primary-100 text-primary',
  failed: 'bg-danger-bg text-danger-text',
  requested: 'bg-pending-bg text-pending-chip-text',
  success: 'bg-success-bg text-success-text',
  rejected: 'bg-danger-bg text-danger-text',
  reserved: 'bg-primary-100 text-primary',
}

export function StatusChip({ status, className }: { status: ChipStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        colours[status],
        className,
      )}
    >
      {copy[status]}
    </span>
  )
}
