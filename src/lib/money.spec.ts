import { describe, expect, it } from 'vitest'
import { formatNaira } from './money'

describe('formatNaira', () => {
  it('formats whole naira as Nigerian currency', () => {
    expect(formatNaira(1_250_000)).toBe('₦12,500')
  })
  it('formats two decimal places for balances', () => {
    expect(formatNaira(4_520_000, { decimals: 2 })).toBe('₦45,200.00')
  })
  it('rejects non-integer kobo', () => {
    expect(() => formatNaira(1.5)).toThrow(TypeError)
  })
})
