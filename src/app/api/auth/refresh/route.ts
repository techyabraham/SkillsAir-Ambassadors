import { NextRequest, NextResponse } from 'next/server'
import {
  backendData,
  backendFetch,
  clearSessionCookies,
  setSessionCookies,
} from '@/lib/backend-api'

interface Tokens {
  authToken: string
  refreshToken: string
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('amb_refresh')?.value
  if (!refreshToken)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      },
      { status: 401 },
    )
  try {
    const upstream = await backendFetch('auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    const json = await upstream.json().catch(() => null)
    const tokens = backendData<Tokens>(json)
    if (!upstream.ok || !tokens) {
      const response = NextResponse.json(
        json ?? {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Your session has expired. Please sign in again.',
          },
        },
        { status: upstream.status || 401 },
      )
      clearSessionCookies(response)
      return response
    }
    const response = NextResponse.json({ success: true, data: { refreshed: true } })
    setSessionCookies(response, tokens)
    return response
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVICE_BUSY',
          message: 'The SkillsAir service is temporarily unavailable.',
        },
      },
      { status: 502 },
    )
  }
}
