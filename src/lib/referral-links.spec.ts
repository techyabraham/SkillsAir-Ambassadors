import { describe, expect, it } from 'vitest'
import { buildCustomReferralLink, buildProgrammeReferralLink } from './referral-links'

describe('ambassador referral links', () => {
  it('builds a link to the selected programme page', () => {
    expect(
      buildProgrammeReferralLink('https://skillsair.com', 'product-design', 'AB12CD34'),
    ).toBe('https://skillsair.com/programmes/product-design?skr=AB12CD34')
  })

  it('keeps the custom page query and fragment and replaces an older code', () => {
    expect(
      buildCustomReferralLink(
        'https://skillsair.com/schools/design?tab=programmes&REF=OLD12345&skr=STALE123#courses',
        'https://skillsair.com/',
        'AB12CD34',
      ),
    ).toBe(
      'https://skillsair.com/schools/design?tab=programmes&skr=AB12CD34#courses',
    )
  })

  it('rejects URLs outside the configured site', () => {
    expect(() =>
      buildCustomReferralLink(
        'https://skillsair.com.evil.example/course',
        'https://skillsair.com',
        'AB12CD34',
      ),
    ).toThrow('Enter a public page on the SkillsAir website.')
  })

  it('rejects malformed programme slugs and referral codes', () => {
    expect(() =>
      buildProgrammeReferralLink('https://skillsair.com', '../login', 'AB12CD34'),
    ).toThrow('This programme does not have a valid page address.')
    expect(() =>
      buildProgrammeReferralLink('https://skillsair.com', 'product-design', 'bad-code'),
    ).toThrow('Your referral code could not be loaded.')
  })
})
