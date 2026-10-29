import { BookOpen, CircleDollarSign, Home, Image as ImageIcon, Link2, Settings, Users } from 'lucide-react'

export const dashboardNavigation = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
  { href: '/dashboard/earnings', label: 'Earnings', icon: CircleDollarSign },
  { href: '/dashboard/payouts', label: 'Payouts', icon: BookOpen },
  { href: '/dashboard/links', label: 'Link builder', icon: Link2 },
  { href: '/dashboard/assets', label: 'Promotion assets', icon: ImageIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const

export const bottomNavigation = dashboardNavigation.slice(0, 4)

export function isDashboardNavigationActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
}
