import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { BottomDock } from '@/components/ui/BottomDock'
import { serverBackendData } from '@/lib/backend-api'
interface Profile {
  user: { firstName: string; lastName: string; email: string }
  ambassador: { code: string; status: 'pending' | 'active' | 'blocked'; emailVerified: boolean }
}
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await serverBackendData<Profile>('ambassadors/me')
  if (!profile) redirect('/login')
  if (!profile.ambassador.emailVerified)
    redirect(`/verify?email=${encodeURIComponent(profile.user.email)}`)
  if (profile.ambassador.status !== 'active') redirect('/status')
  const name = `${profile.user.firstName} ${profile.user.lastName}`.trim() || profile.user.email
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar name={name} code={profile.ambassador.code} />
      <div className="min-h-screen pb-20 lg:pl-64 lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
          <p className="text-sm font-semibold text-navy-900">SkillsAir Ambassadors</p>
          <p className="hidden text-sm text-muted sm:block">{name}</p>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main>
      </div>
      <BottomDock />
    </div>
  )
}
