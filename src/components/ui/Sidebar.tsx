import Link from 'next/link'
import { Brand } from './Brand'
import { SignOutButton } from './SignOutButton'
import { dashboardNavigation } from '@/lib/dashboard-navigation'

export function Sidebar({ name, code }: { name: string; code: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-navy-900 px-5 py-7 text-white lg:flex">
      <Brand onDark />
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        Ambassadors
      </p>
      <nav aria-label="Dashboard" className="mt-3 flex flex-1 flex-col gap-1">
        {dashboardNavigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/20 pt-4">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-1 text-xs text-slate-300">Code {code}</p>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
