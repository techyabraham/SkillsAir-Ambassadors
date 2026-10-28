import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusChip } from './StatusChip'

describe('StatusChip', () => {
  it.each([
    ['pending', 'Pending'],
    ['approved', 'Approved'],
    ['paid', 'Paid'],
    ['void', 'Voided'],
    ['processing', 'Processing'],
    ['failed', 'Failed'],
    ['reversed', 'Reversed'],
  ] as const)('maps %s to its label', (status, label) => {
    render(<StatusChip status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
