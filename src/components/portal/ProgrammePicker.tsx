'use client'

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ProgrammeOption } from '@/lib/programmes'

export function ProgrammePicker({
  programmes,
  value,
  onChange,
}: {
  programmes: ProgrammeOption[]
  value: string
  onChange: (slug: string) => void
}) {
  const [query, setQuery] = useState('')
  const selected = programmes.find((programme) => programme.slug === value) ?? null
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return programmes
    return programmes.filter((programme) =>
      [programme.title, programme.shortDescription, ...programme.schools]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [programmes, query])

  return (
    <div className="w-full">
      <label htmlFor="programme-picker" className="mb-1.5 block text-sm font-medium text-ink-2">
        Programme
      </label>
      <Combobox
        value={selected}
        by="slug"
        onChange={(programme: ProgrammeOption | null) => {
          onChange(programme?.slug ?? '')
          setQuery('')
        }}
      >
        <div className="relative">
          <ComboboxInput
            id="programme-picker"
            displayValue={(programme: ProgrammeOption | null) => programme?.title ?? ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search programmes or schools"
            autoComplete="off"
            className="min-h-12 w-full rounded-xl border border-line bg-white pl-4 pr-12 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <ComboboxButton
            aria-label="Show programmes"
            className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-r-xl text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </ComboboxButton>
          <ComboboxOptions
            anchor="bottom"
            className="z-30 mt-1 max-h-72 w-[var(--input-width)] overflow-auto rounded-xl border border-line bg-white p-1 shadow-lg empty:invisible"
          >
            {filtered.map((programme) => (
              <ComboboxOption
                key={programme.slug}
                value={programme}
                className="group flex min-h-12 cursor-pointer items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink-2 data-[focus]:bg-primary-100 data-[focus]:text-primary"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{programme.title}</span>
                  {programme.schools.length > 0 ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      {programme.schools.join(' · ')}
                    </span>
                  ) : null}
                </span>
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary opacity-0 group-data-[selected]:opacity-100"
                />
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {query && filtered.length === 0 ? (
        <p role="status" className="mt-2 text-sm text-muted">
          No programmes match “{query}”.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Choose a published programme. You can search by programme or school name.
        </p>
      )}
    </div>
  )
}
