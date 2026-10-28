'use client'

import { useState } from 'react'
import { BankCombobox } from '@/components/ui/BankCombobox'
import { BottomDock } from '@/components/ui/BottomDock'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { MoneyText } from '@/components/ui/MoneyText'
import { OtpInput } from '@/components/ui/OtpInput'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'
import { Sidebar } from '@/components/ui/Sidebar'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusChip } from '@/components/ui/StatusChip'
import { Stepper } from '@/components/ui/Stepper'
import { useToast } from '@/components/ui/Toast'

export function ComponentGallery() {
  const [otp, setOtp] = useState('123')
  const [bank, setBank] = useState('')
  const { showToast } = useToast()
  return (
    <div className="min-h-screen bg-surface lg:pl-64">
      <Sidebar name="Ada Skills" code="AIR12345" />
      <main className="mx-auto max-w-5xl space-y-5 p-5 pb-24">
        <h1 className="font-heading text-3xl font-bold text-navy-900">Portal component gallery</h1>
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="whatsapp">WhatsApp</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="Input" placeholder="Type here" />
          <PasswordInput label="Password" />
          <Select label="Select" options={['Instagram', 'WhatsApp']} />
          <BankCombobox
            banks={[
              { code: '058', name: 'Guaranty Trust Bank' },
              { code: '044', name: 'Access Bank' },
            ]}
            value={bank}
            onChange={setBank}
          />
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Verification code</h2>
          <OtpInput value={otp} onChange={setOtp} />
          <OtpInput value="12" onChange={() => undefined} error="Enter all six digits." disabled />
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold">Statuses</h2>
          <div className="flex flex-wrap gap-2">
            {(
              ['pending', 'approved', 'paid', 'void', 'reversed', 'processing', 'failed'] as const
            ).map((status) => (
              <StatusChip key={status} status={status} />
            ))}
          </div>
          <MoneyText kobo={4520000} decimals={2} />
          <StatCard label="Customers" value="128" />
        </Card>
        <Card className="space-y-4 p-5">
          <Skeleton />
          <Stepper current={2} labels={['Identity', 'Payout', 'Promotion', 'Review']} />
          <EmptyState title="Nothing here yet" description="New activity will appear here." />
          <Button variant="outline" onClick={() => showToast('Copied!', 'success')}>
            Show toast
          </Button>
        </Card>
        <BottomDock />
      </main>
    </div>
  )
}
