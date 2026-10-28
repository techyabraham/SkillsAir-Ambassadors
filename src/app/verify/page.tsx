import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { VerifyForm } from '@/components/portal/VerifyForm'
export const metadata: Metadata = { title: 'Verify your email' }
export default function VerifyPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Brand className="mb-7" />
        <Card className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-accent-text">One last step</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-navy-900">Verify your email</h1>
          <p className="mt-2 mb-6 text-sm leading-6 text-muted">
            We sent a six-digit code and a secure verification link to your inbox.
          </p>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface" />}>
            <VerifyForm />
          </Suspense>
        </Card>
      </div>
    </main>
  )
}
