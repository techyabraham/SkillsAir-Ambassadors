import { NextRequest, NextResponse } from 'next/server'
import { backendData, backendFetch, requestJson, setSessionCookies } from '@/lib/backend-api'

interface LoginData {
  user: { id: number; email: string; firstName: string; lastName: string; role: string }
  authToken: string
  refreshToken: string
}

export async function POST(req: NextRequest) {
  const body = await requestJson(req)
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Enter your email and password.' },
      },
      { status: 400 },
    )
  try {
    const upstream = await backendFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const json = await upstream.json().catch(() => null)
    if (!upstream.ok)
      return NextResponse.json(
        json ?? { success: false, error: { code: 'AUTH_REQUIRED', message: 'Sign-in failed.' } },
        { status: upstream.status },
      )
    const data = backendData<LoginData>(json)
    if (
      !data ||
      !Number.isSafeInteger(data.user?.id) ||
      typeof data.authToken !== 'string' ||
      typeof data.refreshToken !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_BUSY',
            message: 'The SkillsAir service returned an invalid sign-in response.',
          },
        },
        { status: 502 },
      )
    }
    const response = NextResponse.json({ success: true, data: { user: data.user } })
    setSessionCookies(
      response,
      { authToken: data.authToken, refreshToken: data.refreshToken },
      data.user.id,
    )
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
