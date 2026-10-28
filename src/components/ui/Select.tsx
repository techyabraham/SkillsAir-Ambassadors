import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: string[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Choose one',
  id,
  className,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={cn(
          'min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1.5 text-sm text-danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
