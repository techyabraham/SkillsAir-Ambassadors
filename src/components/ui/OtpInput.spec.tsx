import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OtpInput } from './OtpInput'

describe('OtpInput', () => {
  it('accepts a pasted six-digit code as a single value', () => {
    const onChange = vi.fn()
    render(<OtpInput value="" onChange={onChange} />)
    fireEvent.paste(screen.getByLabelText('Verification digit 1'), {
      clipboardData: { getData: () => '123456' },
    })
    expect(onChange).toHaveBeenCalledWith('123456')
  })
})
