import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { LoginForm } from '@/components/portal/AuthForm'
export const metadata: Metadata = { title: 'Log in' }
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Brand className="mb-7" />
        <Card className="p-6 sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-navy-900">Welcome back</h1>
          <p className="mt-2 mb-6 text-sm text-muted">Log in with your SkillsAir account.</p>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-surface" />}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-muted">
            New to Ambassadors?{' '}
            <Link href="/apply" className="font-semibold text-primary underline">
              Apply now
            </Link>
          </p>
        </Card>
      </div>
    </main>
  )
}
