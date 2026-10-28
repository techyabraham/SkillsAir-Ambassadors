import type { Metadata } from 'next'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import { ApplyWizard } from '@/components/portal/ApplyWizard'
import { serverBackendData } from '@/lib/backend-api'

export const metadata: Metadata = { title: 'Apply' }
interface Config {
  programOpen: boolean
  heardAboutOptions: string[]
}
export default async function ApplyPage() {
  const config = await serverBackendData<Config>('ambassadors/config')
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <header className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <Brand />
        <Link
          href="/login"
          className="min-h-11 inline-flex items-center px-3 text-sm font-semibold text-primary"
        >
          Already have an account? Log in
        </Link>
      </header>
      <ApplyWizard
        config={{
          programOpen: config?.programOpen ?? true,
          heardAboutOptions: config?.heardAboutOptions ?? [
            'Instagram',
            'Facebook',
            'WhatsApp',
            'X (Twitter)',
            'TikTok',
            'YouTube',
            'A friend',
            'Other',
          ],
        }}
      />
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-muted">
        Your application and payout details are protected.{' '}
        <Link href="/" className="text-primary underline">
          Back to SkillsAir Ambassadors
        </Link>
      </p>
    </main>
  )
}
