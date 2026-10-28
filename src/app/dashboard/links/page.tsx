import type { Metadata } from 'next'
import { serverBackendData } from '@/lib/backend-api'
import { LinkBuilder } from '@/components/portal/LinkBuilder'
export const metadata: Metadata = { title: 'Link builder' }
interface Profile {
  ambassador: { code: string }
}
export default async function LinksPage() {
  const profile = await serverBackendData<Profile>('ambassadors/me')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Share SkillsAir</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Link builder
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create a tracked link to a course or any SkillsAir page.
        </p>
      </div>
      {profile ? (
        <LinkBuilder code={profile.ambassador.code} />
      ) : (
        <p role="alert" className="text-danger-text">
          Your referral code could not be loaded.
        </p>
      )}
    </div>
  )
}
