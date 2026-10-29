'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bottomNavigation, isDashboardNavigationActive } from '@/lib/dashboard-navigation'

export function BottomDock() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden"
    >
      {bottomNavigation.map(({ href, label, icon: Icon }) => {
        const active = isDashboardNavigationActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'font-semibold text-primary' : 'text-muted'}`}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
