'use client'

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export interface BankOption {
  code: string
  name: string
}

interface BankComboboxProps {
  banks: BankOption[]
  value: string
  onChange: (code: string) => void
  error?: string
}

export function BankCombobox({ banks, value, onChange, error }: BankComboboxProps) {
  const [query, setQuery] = useState('')
  const selected = banks.find((bank) => bank.code === value) ?? null
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? banks.filter((bank) => bank.name.toLowerCase().includes(needle)) : banks
  }, [banks, query])

  return (
    <div className="w-full">
      <label htmlFor="bank-search" className="mb-1.5 block text-sm font-medium text-ink-2">
        Bank
      </label>
      <Combobox
        value={selected}
        onChange={(bank: BankOption | null) => {
          onChange(bank?.code ?? '')
          setQuery('')
        }}
      >
        <div className="relative">
          <ComboboxInput
            id="bank-search"
            aria-invalid={Boolean(error)}
            displayValue={(bank: BankOption | null) => bank?.name ?? ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, e.g. Opay, Kuda, Access"
            className={cn(
              'min-h-12 w-full rounded-xl border bg-white pl-4 pr-11 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              error ? 'border-danger-text' : 'border-line',
            )}
          />
          <Combobox.Button
            aria-label="Show banks"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted"
          >
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </Combobox.Button>
          <ComboboxOptions
            anchor="bottom"
            className="z-30 mt-1 max-h-64 w-[var(--input-width)] overflow-auto rounded-xl border border-line bg-white p-1 shadow-lg empty:invisible"
          >
            {filtered.map((bank) => (
              <ComboboxOption
                key={bank.code}
                value={bank}
                className="group flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-2 data-[focus]:bg-primary-100 data-[selected]:font-semibold"
              >
                <span>{bank.name}</span>
                <Check
                  aria-hidden="true"
                  className="size-4 text-primary opacity-0 group-data-[selected]:opacity-100"
                />
              </ComboboxOption>
            ))}
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted">No banks match that search.</p>
            ) : null}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error ? (
        <p className="mt-1.5 text-sm text-danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
