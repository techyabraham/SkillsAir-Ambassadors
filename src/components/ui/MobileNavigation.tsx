'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { dashboardNavigation, isDashboardNavigationActive } from '@/lib/dashboard-navigation'
import { Brand } from './Brand'
import { SignOutButton } from './SignOutButton'

export function MobileNavigation({ name, code }: { name: string; code: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        type="button"
        aria-label="Open dashboard menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="ambassador-mobile-navigation"
        onClick={() => setOpen(true)}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-navy-900 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/50" />
        <div className="fixed inset-0 flex">
          <DialogPanel
            id="ambassador-mobile-navigation"
            className="flex h-full w-[min(86vw,20rem)] flex-col bg-navy-900 px-5 py-6 text-white shadow-xl"
          >
            <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
            <div className="flex items-center justify-between gap-3">
              <Brand onDark />
              <button
                type="button"
                aria-label="Close dashboard menu"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
              Ambassadors
            </p>
            <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto">
              {dashboardNavigation.map(({ href, label, icon: Icon }) => {
                const active = isDashboardNavigationActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${active ? 'bg-white/15 font-semibold text-white' : 'text-slate-100 hover:bg-white/10'}`}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-white/20 pt-4">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="mt-1 text-xs text-slate-300">Code {code}</p>
              <div className="mt-4">
                <SignOutButton />
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
