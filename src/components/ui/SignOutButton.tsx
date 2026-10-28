'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()
  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    router.replace('/login')
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="flex min-h-11 items-center gap-2 rounded-lg text-sm text-slate-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </button>
  )
}
