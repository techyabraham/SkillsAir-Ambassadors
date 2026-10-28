import { NextRequest } from 'next/server'
import { proxyBackend, requestJson } from '@/lib/backend-api'

export async function POST(req: NextRequest) {
  return proxyBackend(req, 'ambassadors/verify-email', {
    method: 'POST',
    body: JSON.stringify(await requestJson(req)),
  })
}
