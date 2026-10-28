import { NextRequest } from 'next/server'
import { proxyBackend, requestJson } from '@/lib/backend-api'

export async function PUT(req: NextRequest) {
  return proxyBackend(req, 'ambassadors/me/bank-account', {
    method: 'PUT',
    body: JSON.stringify(await requestJson(req)),
  })
}
