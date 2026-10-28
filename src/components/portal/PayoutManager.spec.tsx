import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PayoutManager } from './PayoutManager'
import { ToastProvider } from '@/components/ui/Toast'

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('swr', () => ({ default: () => ({ data: { success: true, data: [] }, error: null, isLoading: false, mutate }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

function mount() {
  return render(<ToastProvider><PayoutManager
    availableKobo={2_500_000}
    minPayoutKobo={500_000}
    payoutsEnabled
    payoutMode="manual_review"
    bank={{ bankName: 'Test Bank', accountName: 'Abraham Tobi', accountLast4: '1234' }}
  /></ToastProvider>)
}

describe('PayoutManager', () => {
  it('submits a confirmed withdrawal with a stable idempotency key across network retry', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { payout: { id: 12 } } }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('crypto', { randomUUID: () => '12345678-1234-4234-9234-123456789012' })
    mutate.mockResolvedValue(undefined)
    mount()

    fireEvent.change(screen.getByRole('textbox', { name: 'Withdrawal amount in naira' }), { target: { value: '5,000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review withdrawal' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm withdrawal' }))
    await screen.findAllByText(/could not confirm whether your request reached SkillsAir/i)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm withdrawal' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST', headers: expect.objectContaining({ 'Idempotency-Key': '12345678-1234-4234-9234-123456789012' }) })
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({ headers: expect.objectContaining({ 'Idempotency-Key': '12345678-1234-4234-9234-123456789012' }) })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({ amountKobo: 500_000 })
    expect(await screen.findByRole('status')).toHaveTextContent('Withdrawal request received.')
    vi.unstubAllGlobals()
  })

  it('disables withdrawal below the minimum and when payouts are paused', () => {
    const { rerender } = render(<ToastProvider><PayoutManager availableKobo={499_999} minPayoutKobo={500_000} payoutsEnabled payoutMode="manual_review" bank={{ bankName: 'Test Bank', accountName: 'A User', accountLast4: '1234' }} /></ToastProvider>)
    expect(screen.getByText(/balance must reach/)).toBeInTheDocument()
    rerender(<ToastProvider><PayoutManager availableKobo={2_000_000} minPayoutKobo={500_000} payoutsEnabled={false} payoutMode="manual_review" bank={{ bankName: 'Test Bank', accountName: 'A User', accountLast4: '1234' }} /></ToastProvider>)
    expect(screen.getByText(/temporarily paused/)).toBeInTheDocument()
  })
})
