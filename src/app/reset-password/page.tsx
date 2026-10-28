import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { ResetPasswordForm } from '@/components/portal/AuthForm'
export const metadata: Metadata = { title: 'Set a new password' }
export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Brand className="mb-7" />
        <Card className="p-6 sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-navy-900">Choose a new password</h1>
          <p className="mt-2 mb-6 text-sm text-muted">
            Use a strong password you don’t use elsewhere.
          </p>
          <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-surface" />}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </main>
  )
}
