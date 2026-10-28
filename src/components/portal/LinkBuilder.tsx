'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { ProgrammePicker } from '@/components/portal/ProgrammePicker'
import { useToast } from '@/components/ui/Toast'
import type { ProgrammeOption } from '@/lib/programmes'
import { buildCustomReferralLink, buildProgrammeReferralLink } from '@/lib/referral-links'

export function LinkBuilder({
  code,
  mainSiteUrl,
  programmes,
  catalogueUnavailable,
}: {
  code: string
  mainSiteUrl: string
  programmes: ProgrammeOption[]
  catalogueUnavailable: boolean
}) {
  const [selectedSlug, setSelectedSlug] = useState('')
  const [customTarget, setCustomTarget] = useState(() => new URL('/', mainSiteUrl).toString())
  const [customResult, setCustomResult] = useState('')
  const [customError, setCustomError] = useState('')
  const [copiedLink, setCopiedLink] = useState('')
  const { showToast } = useToast()
  const selectedProgramme = programmes.find((programme) => programme.slug === selectedSlug) ?? null
  const programmeLink = useMemo(
    () =>
      selectedProgramme
        ? buildProgrammeReferralLink(mainSiteUrl, selectedProgramme.slug, code)
        : '',
    [code, mainSiteUrl, selectedProgramme],
  )

  async function copy(link: string, label: string) {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(link)
      showToast(label + ' copied.')
    } catch {
      showToast('Copy is unavailable in this browser. Select and copy the link.', 'error')
    }
  }

  function buildCustomLink() {
    setCustomError('')
    setCustomResult('')
    setCopiedLink('')
    try {
      setCustomResult(buildCustomReferralLink(customTarget, mainSiteUrl, code))
    } catch (cause) {
      setCustomError(cause instanceof Error ? cause.message : 'Enter a valid SkillsAir page URL.')
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-5 p-5 sm:p-7">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">Choose a programme to promote</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Select a published programme and your tracked link will be ready to share.
          </p>
        </div>

        {catalogueUnavailable ? (
          <p role="alert" className="rounded-xl border border-pending-text/30 bg-pending-bg p-3 text-sm text-pending-chip-text">
            The programme catalogue is temporarily unavailable. Try again shortly, or create a link
            to another SkillsAir page below.
          </p>
        ) : programmes.length > 0 ? (
          <ProgrammePicker
            programmes={programmes}
            value={selectedSlug}
            onChange={(slug) => {
              setSelectedSlug(slug)
              setCopiedLink('')
            }}
          />
        ) : (
          <EmptyState
            title="No programmes are available yet"
            description="Published, promotable programmes will appear here. You can still make a link to another SkillsAir page below."
          />
        )}

        {selectedProgramme ? (
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary-100/50 p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Programme referral link
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-navy-900">
                {selectedProgramme.title}
              </h3>
              {selectedProgramme.schools.length > 0 ? (
                <p className="mt-1 text-sm text-muted">{selectedProgramme.schools.join(' · ')}</p>
              ) : null}
              {selectedProgramme.shortDescription ? (
                <p className="mt-2 text-sm leading-6 text-ink-2">
                  {selectedProgramme.shortDescription}
                </p>
              ) : null}
            </div>
            <Input
              label="Your tracked link"
              value={programmeLink}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => event.currentTarget.select()}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => copy(programmeLink, 'Programme link')}>
                {copiedLink === programmeLink ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Copy aria-hidden="true" className="size-4" />
                )}
                {copiedLink === programmeLink ? 'Copied!' : 'Copy programme link'}
              </Button>
              <a
                href={programmeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Link2 aria-hidden="true" className="size-4" />
                Preview page
              </a>
            </div>
            <p aria-live="polite" className="sr-only">
              {copiedLink === programmeLink && programmeLink
                ? 'Programme referral link copied to clipboard.'
                : ''}
            </p>
          </div>
        ) : (
          <p role="status" className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
            Choose a programme to generate its referral link.
          </p>
        )}
      </Card>

      <details className="group rounded-[18px] border border-line bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-6">
          <span>Need a link to another SkillsAir page?</span>
          <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="space-y-4 border-t border-line p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted">
            Use this for the homepage, a school page, or another public page on SkillsAir.
          </p>
          <Input
            label="SkillsAir page URL"
            type="url"
            value={customTarget}
            onChange={(event) => {
              setCustomTarget(event.target.value)
              setCustomResult('')
              setCustomError('')
              setCopiedLink('')
            }}
            placeholder="https://skillsair.com/schools/design"
          />
          {customError ? (
            <p role="alert" className="text-sm text-danger-text">
              {customError}
            </p>
          ) : null}
          <Button type="button" variant="outline" onClick={buildCustomLink}>
            <Link2 aria-hidden="true" className="size-4" />
            Generate custom link
          </Button>
          {customResult ? (
            <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <Input
                label="Your tracked link"
                value={customResult}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
                onClick={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => copy(customResult, 'Referral link')}
              >
                {copiedLink === customResult ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Copy aria-hidden="true" className="size-4" />
                )}
                {copiedLink === customResult ? 'Copied!' : 'Copy link'}
              </Button>
              <p aria-live="polite" className="sr-only">
                {copiedLink === customResult ? 'Referral link copied to clipboard.' : ''}
              </p>
            </div>
          ) : null}
        </div>
      </details>
    </div>
  )
}
