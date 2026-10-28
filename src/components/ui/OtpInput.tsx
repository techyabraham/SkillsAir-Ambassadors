'use client'

import { useRef } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export function OtpInput({ value, onChange, disabled = false, error }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? '')

  function update(index: number, input: string) {
    const nextDigit = input.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = nextDigit
    onChange(next.join('').slice(0, 6))
    if (nextDigit && index < 5) refs.current[index + 1]?.focus()
  }

  function paste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    onChange(pasted)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div>
      <div className="flex justify-between gap-2" aria-label="Six-digit verification code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`Verification digit ${index + 1}`}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            maxLength={1}
            value={digit}
            onChange={(event) => update(index, event.target.value)}
            onPaste={paste}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !digits[index] && index > 0)
                refs.current[index - 1]?.focus()
              if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
              if (event.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus()
            }}
            className="h-13 min-w-0 w-full rounded-xl border border-line bg-white text-center text-xl font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:bg-surface"
          />
        ))}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
