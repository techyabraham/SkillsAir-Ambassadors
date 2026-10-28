import { NextRequest } from 'next/server'
import { proxyBackend, requestJson } from '@/lib/backend-api'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString()
  return proxyBackend(req, `ambassadors/me/payouts${query ? `?${query}` : ''}`)
}

export async function POST(req: NextRequest) {
  const body = await requestJson(req)
  const requestId = req.headers.get('idempotency-key')
  const headers = new Headers()
  if (requestId) headers.set('Idempotency-Key', requestId)
  return proxyBackend(req, 'ambassadors/me/payouts', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}
