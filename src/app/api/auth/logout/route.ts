import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, clearSessionCookies } from '@/lib/backend-api'

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('amb_refresh')?.value
  const accessToken = req.cookies.get('amb_access')?.value
  if (refreshToken) {
    await backendFetch(
      'auth/logout',
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
      accessToken,
    ).catch(() => undefined)
  }
  const response = NextResponse.json({ success: true, data: { loggedOut: true } })
  clearSessionCookies(response)
  return response
}
