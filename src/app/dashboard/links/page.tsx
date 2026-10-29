import type { Metadata } from 'next'
import { serverBackendData } from '@/lib/backend-api'
import { LinkBuilder } from '@/components/portal/LinkBuilder'
import { loadPromotableProgrammes } from '@/lib/programmes'
import { SKILLSAIR_MAIN_SITE_URL } from '@/lib/referral-links'
export const metadata: Metadata = { title: 'Link builder' }
interface Profile {
  ambassador: { code: string }
}
export default async function LinksPage() {
  const [profile, catalogue] = await Promise.all([
    serverBackendData<Profile>('ambassadors/me'),
    loadPromotableProgrammes(),
  ])
  const mainSiteUrl = SKILLSAIR_MAIN_SITE_URL
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-accent-text">Share SkillsAir</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Programme links
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choose a programme to create a tracked link that takes people straight to its page.
        </p>
      </div>
      {profile ? (
        <LinkBuilder
          code={profile.ambassador.code}
          mainSiteUrl={mainSiteUrl}
          programmes={catalogue.programmes}
          catalogueUnavailable={catalogue.unavailable}
        />
      ) : (
        <p role="alert" className="text-danger-text">
          Your referral code could not be loaded.
        </p>
      )}
    </div>
  )
}
