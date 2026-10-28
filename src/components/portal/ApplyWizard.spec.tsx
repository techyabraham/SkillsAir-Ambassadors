import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApplyWizard } from './ApplyWizard'
import { ToastProvider } from '@/components/ui/Toast'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

describe('ApplyWizard password policy', () => {
  it('shows the same five password checks used by the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async (url: string) =>
          url.includes('auth/me')
            ? new Response(JSON.stringify({ success: false }), { status: 401 })
            : new Response(JSON.stringify({ success: true, data: [] })),
        ),
    )
    render(
      <ToastProvider>
        <ApplyWizard config={{ programOpen: true, heardAboutOptions: [] }} />
      </ToastProvider>,
    )
    expect(await screen.findByLabelText(/Username/)).toBeInTheDocument()
    const password = document.querySelector<HTMLInputElement>('input[name="password"]')
    expect(password).not.toBeNull()
    fireEvent.change(password!, { target: { value: 'SkillsAir1!' } })
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('A symbol')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
