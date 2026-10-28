'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem {
  id: number
  title: string
  kind: ToastKind
}
interface ToastContextValue {
  showToast: (title: string, kind?: ToastKind) => void
}
const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const showToast = useCallback((title: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random()
    setItems((current) => [...current, { id, title, kind }])
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000)
  }, [])
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-24 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 lg:bottom-5"
      >
        {items.map((item) => {
          const Icon =
            item.kind === 'success' ? CheckCircle2 : item.kind === 'error' ? CircleAlert : Info
          const colours =
            item.kind === 'error'
              ? 'border-danger-text text-danger-text'
              : item.kind === 'success'
                ? 'border-success-text text-success-text'
                : 'border-primary text-primary'
          return (
            <div
              key={item.id}
              role="status"
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-sm ${colours}`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-ink">{item.title}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
