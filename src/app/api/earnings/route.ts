import { NextRequest } from 'next/server'
import { proxyBackend } from '@/lib/backend-api'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString()
  return proxyBackend(req, `ambassadors/me/earnings${query ? `?${query}` : ''}`)
}
