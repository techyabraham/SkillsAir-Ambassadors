import { describe, expect, it } from 'vitest'
import { REFERRAL_SEGMENTS, referralSegment } from './referral-segments'

describe('referral segments', () => {
  it('lists the funnel in order: applied, signed up, paid', () => {
    expect(Object.keys(REFERRAL_SEGMENTS)).toEqual(['applicants', 'prospects', 'customers'])
    expect(Object.values(REFERRAL_SEGMENTS).map((segment) => segment.tab)).toEqual(['Applied', 'Signed up', 'Paid'])
  })

  it('reads the segment from the URL and falls back to paying customers', () => {
    expect(referralSegment('applicants')).toBe('applicants')
    expect(referralSegment('prospects')).toBe('prospects')
    expect(referralSegment('customers')).toBe('customers')
    expect(referralSegment(undefined)).toBe('customers')
    expect(referralSegment('everyone')).toBe('customers')
  })
})
