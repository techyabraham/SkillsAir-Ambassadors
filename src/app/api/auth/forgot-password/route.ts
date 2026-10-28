import { NextRequest, NextResponse } from 'next/server'
import { backendFetch, requestJson } from '@/lib/backend-api'

export async function POST(req: NextRequest) {
  try {
    const body = await requestJson(req)
    const upstream = await backendFetch('auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ ...body, app: 'ambassador' }),
    })
    return NextResponse.json(await upstream.json().catch(() => ({})), { status: upstream.status })
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
