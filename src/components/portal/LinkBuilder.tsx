'use client'

import { useState } from 'react'
import { Check, Copy, Link2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function LinkBuilder({ code }: { code: string }) {
  const [target, setTarget] = useState('https://skillsair.com/')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  function build() {
    setError('')
    setCopied(false)
    try {
      const url = new URL(target)
      if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'skillsair.com')
        throw new Error('Enter an https://skillsair.com page URL.')
      url.searchParams.set('ref', code)
      setResult(url.toString())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enter a valid SkillsAir URL.')
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      showToast('Referral link copied.')
    } catch {
      showToast('Copy is unavailable in this browser. Select and copy the link.', 'error')
    }
  }
  return (
    <Card className="space-y-5 p-5 sm:p-7">
      <div>
        <h2 className="font-heading text-lg font-bold text-ink">Create a referral link</h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Paste any public page on skillsair.com. Your referral code will be added automatically.
        </p>
      </div>
      <Input
        label="SkillsAir page URL"
        type="url"
        value={target}
        onChange={(event) => setTarget(event.target.value)}
        placeholder="https://skillsair.com/courses/course-name"
      />
      {error && (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      )}
      <Button type="button" onClick={build}>
        <Link2 className="size-4" />
        Build link
      </Button>
      {result && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="break-all text-sm text-primary">{result}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>
      )}
    </Card>
  )
}
