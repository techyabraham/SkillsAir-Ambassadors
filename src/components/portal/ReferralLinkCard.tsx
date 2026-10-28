'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

export function ReferralLinkCard({ link, shareMessage }: { link: string; shareMessage: string }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const message = shareMessage.replace('{link}', link)
  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      showToast('Referral link copied.')
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      showToast('Copy is unavailable. Select the link and copy it manually.', 'error')
    }
  }
  async function share() {
    if (navigator.share) {
      await navigator.share({ title: 'SkillsAir', text: message, url: link }).catch(() => undefined)
      return
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Your referral link</p>
          <p className="mt-1 text-sm text-muted">Works on every page and course.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copy} aria-live="polite">
            <span className="inline-flex items-center gap-2">
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </Button>
          <Button type="button" variant="whatsapp" onClick={share}>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">Share</span>
            </span>
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3 py-3 text-sm text-primary">
        <Share2 aria-hidden="true" className="size-4 shrink-0" />
        <a
          href={link}
          className="break-all underline decoration-primary/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {link}
        </a>
      </div>
    </Card>
  )
}
