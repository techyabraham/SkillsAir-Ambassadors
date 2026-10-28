import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
        {props.required ? (
          <span aria-hidden="true" className="ml-1 text-danger-text">
            *
          </span>
        ) : null}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={cn(
          'min-h-12 w-full rounded-xl border bg-white px-4 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          error ? 'border-danger-text' : 'border-line',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={messageId} className="mt-1.5 text-sm text-danger-text" role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={messageId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
