import type { Metadata } from 'next'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import { Card } from '@/components/ui/Card'
import { ForgotPasswordForm } from '@/components/portal/AuthForm'
export const metadata: Metadata = { title: 'Forgot password' }
export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Brand className="mb-7" />
        <Card className="p-6 sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-navy-900">Reset your password</h1>
          <p className="mt-2 mb-6 text-sm leading-6 text-muted">
            We’ll send a secure reset link if an account matches that email.
          </p>
          <ForgotPasswordForm />
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
          >
            Back to log in
          </Link>
        </Card>
      </div>
    </main>
  )
}
