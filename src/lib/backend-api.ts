import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
export { backendErrorMessage } from './api-errors'

type JsonRecord = Record<string, unknown>
interface TokenPair {
  authToken: string
  refreshToken: string
}

const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export function backendUrl(path: string): string {
  return `${BACKEND_URL}/api/${path.replace(/^\/+/, '')}`
}

export function backendData<T>(value: unknown): T | null {
  if (value && typeof value === 'object' && 'data' in value) return (value as { data: T }).data
  return null
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(backendUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
    signal: init.signal ?? AbortSignal.timeout(12_000),
  })
}

function tokensFrom(value: unknown): TokenPair | null {
  const data = backendData<JsonRecord>(value)
  if (!data || typeof data.authToken !== 'string' || typeof data.refreshToken !== 'string')
    return null
  return { authToken: data.authToken, refreshToken: data.refreshToken }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}

export function setSessionCookies(
  response: NextResponse,
  tokens: TokenPair,
  userId?: number,
): void {
  const options = cookieOptions()
  response.cookies.set('amb_access', tokens.authToken, options)
  response.cookies.set('amb_refresh', tokens.refreshToken, options)
  if (userId !== undefined) response.cookies.set('amb_user_id', String(userId), options)
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete('amb_access')
  response.cookies.delete('amb_refresh')
  response.cookies.delete('amb_user_id')
}

/** For authenticated API routes: refresh once on a 401 and never return tokens to the browser. */
export async function proxyBackend(
  req: NextRequest,
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  let accessToken = req.cookies.get('amb_access')?.value
  const refreshToken = req.cookies.get('amb_refresh')?.value
  let refreshed: TokenPair | null = null
  let clearSession = false
  try {
    let upstream = await backendFetch(path, init, accessToken)
    if (upstream.status === 401 && refreshToken) {
      const refreshResponse = await backendFetch('auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
      if (refreshResponse.ok) {
        const refreshJson = await refreshResponse.json().catch(() => null)
        refreshed = tokensFrom(refreshJson)
        if (refreshed) {
          accessToken = refreshed.authToken
          upstream = await backendFetch(path, init, accessToken)
          if (upstream.status === 401) clearSession = true
        } else clearSession = true
      } else clearSession = true
    }
    const body = await upstream.json().catch(() => ({
      success: false,
      error: {
        code: 'SERVICE_BUSY',
        message: 'The SkillsAir service returned an invalid response.',
      },
    }))
    const response = NextResponse.json(body, { status: upstream.status })
    if (refreshed) setSessionCookies(response, refreshed)
    if (clearSession) clearSessionCookies(response)
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

/** Server-component data fetch. The proxy refreshes near-expiry cookies and persists its rotated pair. */
export async function serverBackendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies()
  return backendFetch(path, init, cookieStore.get('amb_access')?.value)
}

export async function serverBackendData<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | null> {
  const response = await serverBackendFetch(path, init)
  if (!response.ok) return null
  return backendData<T>(await response.json().catch(() => null))
}

export function requestJson(req: Request): Promise<JsonRecord> {
  return req.json().catch(() => ({})) as Promise<JsonRecord>
}

export function jsonApiError(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'VALIDATION_ERROR', message } },
    { status },
  )
}
