'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { BankCombobox, type BankOption } from '@/components/ui/BankCombobox'
import { Stepper } from '@/components/ui/Stepper'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { isStrongPassword, passwordRules } from '@/lib/password'
import { backendErrorMessage } from '@/lib/api-errors'

type FormState = {
  username: string
  firstName: string
  lastName: string
  email: string
  promotionPlan: string
  about: string
  heardAbout: string
  bankCode: string
  accountNumber: string
}
const empty: FormState = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  promotionPlan: '',
  about: '',
  heardAbout: '',
  bankCode: '',
  accountNumber: '',
}
const labels = ['Identity', 'Payout', 'Promotion', 'Review']

export function ApplyWizard({
  config,
}: {
  config: { heardAboutOptions: string[]; programOpen: boolean }
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormState>(empty)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(0)
  const [signedIn, setSignedIn] = useState(false)
  const [banks, setBanks] = useState<BankOption[]>([])
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [skipBank, setSkipBank] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [profileResult, bankResult] = await Promise.allSettled([
          fetch('/api/auth/me'),
          fetch('/api/banks'),
        ])
        const profileResponse = profileResult.status === 'fulfilled' ? profileResult.value : null
        const bankResponse = bankResult.status === 'fulfilled' ? bankResult.value : null
        const profileJson = await profileResponse?.json().catch(() => null)
        const bankJson = await bankResponse?.json().catch(() => null)
        if (!alive) return
        const user = profileJson?.data?.user
        if (profileResponse?.ok && user?.email) {
          setSignedIn(true)
          setForm((current) => ({
            ...current,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            email: user.email,
          }))
          setStep(1)
        } else {
          try {
            const saved = sessionStorage.getItem('amb_apply_draft')
            if (saved)
              setForm((current) => ({ ...current, ...(JSON.parse(saved) as Partial<FormState>) }))
          } catch {
            /* An invalid draft is ignored. */
          }
        }
        const rows = bankJson?.data
        if (Array.isArray(rows))
          setBanks(
            rows.filter(
              (row): row is BankOption =>
                typeof row?.code === 'string' && typeof row?.name === 'string',
            ),
          )
        if (!bankResponse || bankResult.status === 'rejected')
          setError(
            'The bank directory is temporarily unavailable. You can skip this step and add a payout account later.',
          )
      } catch {
        if (alive)
          setError(
            'Some application services are temporarily unavailable. Please refresh and try again.',
          )
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!signedIn && !loading) {
      const safeDraft = { ...form, accountNumber: '' }
      try {
        sessionStorage.setItem('amb_apply_draft', JSON.stringify(safeDraft))
      } catch {
        /* Storage can be disabled. */
      }
    }
  }, [form, signedIn, loading])

  useEffect(() => {
    if (form.accountNumber.length !== 10 || !form.bankCode) return
    let alive = true
    const timer = window.setTimeout(async () => {
      setResolving(true)
      try {
        const response = await fetch('/api/banks/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bankCode: form.bankCode, accountNumber: form.accountNumber }),
        })
        const json = await response.json().catch(() => null)
        if (alive) {
          setResolvedName(
            response.ok && typeof json?.data?.accountName === 'string' ? json.data.accountName : '',
          )
          if (!response.ok)
            setError(
              json?.error?.message ??
                'We could not confirm this account. Check the number and bank.',
            )
          else setError('')
        }
      } catch {
        if (alive) {
          setResolvedName('')
          setError(
            'Account verification is temporarily unavailable. You can skip this step and add a bank later.',
          )
        }
      } finally {
        if (alive) setResolving(false)
      }
    }, 300)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [form.accountNumber, form.bankCode])

  const passwordStatus = useMemo(
    () => passwordRules.map((rule) => ({ label: rule.label, passed: rule.test(password) })),
    [password],
  )
  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }
  function updateBankCode(value: string) {
    update('bankCode', value)
    setResolvedName('')
    setError('')
    setSkipBank(false)
  }
  function updateAccountNumber(value: string) {
    update('accountNumber', value.replace(/\D/g, '').slice(0, 10))
    setResolvedName('')
    setError('')
    setSkipBank(false)
    setResolving(false)
  }
  function next() {
    setError('')
    if (step === 0 || (signedIn && step === 1)) {
      if (!form.username.match(/^[a-z0-9._]{3,30}$/))
        return setError(
          'Choose a username with 3–30 lowercase letters, numbers, dots or underscores.',
        )
      if (
        step === 0 &&
        !signedIn &&
        (!form.firstName.trim() ||
          !form.lastName.trim() ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      )
        return setError('Enter your first name, last name and a valid email address.')
      if (step === 0 && !signedIn && !isStrongPassword(password))
        return setError('Your password must pass all five security checks.')
      if (step === 0 && !signedIn && password !== confirmPassword)
        return setError('Your passwords do not match.')
    }
    if (
      step === 1 &&
      !skipBank &&
      (form.bankCode || form.accountNumber) &&
      (!resolvedName || form.accountNumber.length !== 10)
    )
      return setError(
        'Choose a bank and confirm a valid 10-digit account, or skip this step for now.',
      )
    if (step === 2 && !form.promotionPlan.trim())
      return setError('Tell us how you plan to promote SkillsAir.')
    setStep((current) => Math.min(3, current + 1))
  }

  async function submit() {
    setError('')
    setSubmitting(true)
    const payload: Record<string, unknown> = {
      username: form.username,
      promotionPlan: form.promotionPlan,
      about: form.about,
      heardAbout: form.heardAbout,
      ...(!signedIn
        ? {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password,
            confirmPassword,
          }
        : {}),
      ...(!skipBank && resolvedName
        ? { bank: { bankCode: form.bankCode, accountNumber: form.accountNumber } }
        : {}),
    }
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(
          backendErrorMessage(json, 'We could not submit your application. Please try again.'),
        )
      try {
        sessionStorage.removeItem('amb_apply_draft')
      } catch {
        /* Ignore unavailable storage. */
      }
      const sentTo = encodeURIComponent(json?.data?.verification?.sentTo ?? form.email)
      router.push(`/verify?email=${sentTo}`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'We could not submit your application.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <Card className="mx-auto max-w-2xl p-6" aria-label="Loading application">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-48 animate-pulse rounded-xl bg-slate-100" />
      </Card>
    )
  if (!config.programOpen)
    return (
      <Card className="mx-auto max-w-2xl p-8">
        <h1 className="font-heading text-2xl font-bold">Applications are closed</h1>
        <p className="mt-3 text-muted">Please check back later.</p>
      </Card>
    )

  return (
    <Card className="mx-auto max-w-2xl p-5 sm:p-8">
      <p className="text-sm font-semibold text-accent-text">Step {step + 1} of 4</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
        Become a SkillsAir ambassador
      </h1>
      {signedIn && step > 0 ? (
        <p className="mt-2 text-sm text-muted">
          Applying as <strong className="text-ink">{form.email}</strong>
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Earn by sharing practical tech skills with your community.
        </p>
      )}
      <div className="mt-7">
        <Stepper current={step + 1} labels={labels} />
      </div>
      <div className="mt-8 space-y-5">
        {step === 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Username"
                name="username"
                autoComplete="username"
                required
                value={form.username}
                onChange={(e) => update('username', e.target.value.toLowerCase())}
                hint="Your public handle, 3–30 characters."
              />
              {!signedIn && (
                <>
                  <Input
                    label="First name"
                    name="firstName"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    autoComplete="family-name"
                    required
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                  />
                </>
              )}
            </div>
            {!signedIn && (
              <>
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <PasswordInput
                  label="Password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ul
                  className="grid gap-2 text-sm sm:grid-cols-2"
                  aria-label="Password requirements"
                >
                  {passwordStatus.map((item) => (
                    <li
                      key={item.label}
                      className={`flex items-center gap-2 ${item.passed ? 'text-success-text' : 'text-muted'}`}
                    >
                      {item.passed ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : (
                        <Circle className="size-4" aria-hidden="true" />
                      )}
                      {item.label}
                    </li>
                  ))}
                </ul>
                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  hint={
                    confirmPassword && password === confirmPassword ? 'Passwords match.' : undefined
                  }
                  error={
                    confirmPassword && password !== confirmPassword
                      ? 'Passwords do not match.'
                      : undefined
                  }
                />
              </>
            )}
          </>
        )}
        {step === 1 && (
          <>
            {signedIn && (
              <Input
                label="Username"
                name="username"
                autoComplete="username"
                required
                value={form.username}
                onChange={(e) => update('username', e.target.value.toLowerCase())}
                hint="Your public handle, 3–30 lowercase letters, numbers, dots or underscores."
              />
            )}
            <div>
              <h2 className="font-semibold text-ink">Where should we send your earnings?</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Add a Nigerian bank account now, or skip and add one later in Settings.
              </p>
            </div>
            <BankCombobox banks={banks} value={form.bankCode} onChange={updateBankCode} />
            <Input
              label="10-digit account number"
              name="accountNumber"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              value={form.accountNumber}
              onChange={(e) => updateAccountNumber(e.target.value)}
            />
            {resolving && (
              <p
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 text-sm text-muted"
              >
                <LoaderCircle className="size-4 animate-spin" />
                Confirming account name…
              </p>
            )}
            {resolvedName && (
              <p
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 rounded-xl bg-success-bg p-4 text-sm font-medium text-success-text"
              >
                <Check className="size-5" />
                Account name confirmed: {resolvedName}
              </p>
            )}
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-primary underline underline-offset-4"
              onClick={() => {
                setSkipBank(true)
                setResolvedName('')
                setError('')
              }}
            >
              Skip for now
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-2">
                How will you promote SkillsAir? <span className="text-danger-text">*</span>
              </span>
              <textarea
                value={form.promotionPlan}
                onChange={(e) => update('promotionPlan', e.target.value.slice(0, 2000))}
                rows={5}
                maxLength={2000}
                required
                className="w-full rounded-xl border border-line bg-white p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Tell us which communities or channels you’ll reach."
              />
              <span className="mt-1 block text-right text-xs text-muted">
                {form.promotionPlan.length}/2000
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-2">
                A little about you
              </span>
              <textarea
                value={form.about}
                onChange={(e) => update('about', e.target.value.slice(0, 2000))}
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-line bg-white p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Your interests, experience or audience."
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-2">
                How did you hear about us?
              </span>
              <select
                value={form.heardAbout}
                onChange={(e) => update('heardAbout', e.target.value)}
                className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Choose one (optional)</option>
                {config.heardAboutOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <ReviewRow
              label="Applicant"
              value={`${form.firstName} ${form.lastName} · ${form.email}`}
              onEdit={signedIn ? undefined : () => setStep(0)}
            />
            <ReviewRow
              label="Username"
              value={`@${form.username}`}
              onEdit={() => setStep(signedIn ? 1 : 0)}
            />
            <ReviewRow
              label="Payout account"
              value={
                resolvedName
                  ? `${resolvedName} · ${banks.find((bank) => bank.code === form.bankCode)?.name} · •••• ${form.accountNumber.slice(-4)}`
                  : 'Add this later'
              }
              onEdit={() => setStep(1)}
            />
            <ReviewRow
              label="Promotion plan"
              value={form.promotionPlan}
              onEdit={() => setStep(2)}
            />
            <p className="rounded-xl bg-primary-100 p-4 text-sm leading-6 text-primary">
              We’ll email you a six-digit verification code and a secure link. Your application is
              reviewed before your referral link is activated.
            </p>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-danger-bg p-3 text-sm text-danger-text">
          {error}
        </p>
      )}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > (signedIn ? 1 : 0) ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError('')
              setStep((current) => current - 1)
            }}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <Button type="button" onClick={next}>
            Continue
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" loading={submitting} onClick={submit}>
            Submit application
          </Button>
        )}
      </div>
    </Card>
  )
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink">
          {value || 'Not provided'}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          className="min-h-11 px-3 text-sm font-semibold text-primary underline underline-offset-4"
          onClick={onEdit}
        >
          Edit
        </button>
      )}
    </div>
  )
}
