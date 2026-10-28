import { NextRequest, NextResponse } from 'next/server'

const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:3001').replace(/\/$/, '')

function accessExpiresAt(token: string | undefined): number | null {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(
      atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')),
    ) as { exp?: unknown }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function loginRedirect(request: NextRequest, clear = false) {
  const login = new URL('/login', request.url)
  login.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  const response = NextResponse.redirect(login)
  if (clear) {
    response.cookies.delete('amb_access')
    response.cookies.delete('amb_refresh')
    response.cookies.delete('amb_user_id')
  }
  return response
}

/** Refresh near-expiry cookies before server components render; the layout still validates ambassador status with the backend. */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get('amb_access')?.value
  const refresh = request.cookies.get('amb_refresh')?.value
  if (!access && !refresh) return loginRedirect(request)

  const expiresAt = accessExpiresAt(access)
  const needsRefresh = !access || expiresAt === null || expiresAt < Date.now() + 60_000
  if (!needsRefresh) return NextResponse.next()
  if (!refresh) return loginRedirect(request, true)

  try {
    const refreshed = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    if (!refreshed.ok) {
      if (refreshed.status === 401) return loginRedirect(request, true)
      const login = new URL('/login', request.url)
      login.searchParams.set('service', 'unavailable')
      return NextResponse.redirect(login)
    }
    const json = (await refreshed.json().catch(() => null)) as {
      data?: { authToken?: unknown; refreshToken?: unknown }
    } | null
    const pair = json?.data
    if (typeof pair?.authToken !== 'string' || typeof pair.refreshToken !== 'string')
      return loginRedirect(request, true)

    request.cookies.set('amb_access', pair.authToken)
    request.cookies.set('amb_refresh', pair.refreshToken)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('cookie', request.cookies.toString())
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }
    response.cookies.set('amb_access', pair.authToken, options)
    response.cookies.set('amb_refresh', pair.refreshToken, options)
    return response
  } catch {
    const login = new URL('/login', request.url)
    login.searchParams.set('service', 'unavailable')
    return NextResponse.redirect(login)
  }
}

export const config = { matcher: ['/dashboard/:path*'] }
