import { NextRequest, NextResponse } from 'next/server'
import { proxyBackend } from '@/lib/backend-api'

interface UserData {
  id?: number
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

function pickUser(value: unknown): UserData | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if ('doc' in row) return pickUser(row.doc)
  if ('data' in row) return pickUser(row.data)
  if ('user' in row) return pickUser(row.user)
  return {
    ...(typeof row.id === 'number' ? { id: row.id } : {}),
    ...(typeof row.email === 'string' ? { email: row.email } : {}),
    ...(typeof row.firstName === 'string' ? { firstName: row.firstName } : {}),
    ...(typeof row.lastName === 'string' ? { lastName: row.lastName } : {}),
    ...(typeof row.role === 'string' ? { role: row.role } : {}),
  }
}

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('amb_user_id')?.value
  if (!userId || !/^\d+$/.test(userId))
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_REQUIRED', message: 'Sign in to continue.' } },
      { status: 401 },
    )
  const upstream = await proxyBackend(req, `users/${userId}`)
  const json = await upstream.json().catch(() => null)
  if (!upstream.ok) return upstream
  const user = pickUser(json)
  if (!user?.id || !user.email)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVICE_BUSY',
          message: 'The SkillsAir service returned an invalid profile.',
        },
      },
      { status: 502 },
    )
  const response = NextResponse.json({ success: true, data: { user } })
  for (const cookie of upstream.cookies.getAll()) response.cookies.set(cookie)
  return response
}
