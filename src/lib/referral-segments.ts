/**
 * The three stages of someone an ambassador referred, as the backend's
 * /ambassadors/me/referrals?segment= names them, in funnel order.
 */
export const REFERRAL_SEGMENTS = {
  applicants: {
    tab: 'Applied',
    description: 'Applied to a SkillsAir programme through your link but have not created an account yet.',
    empty: 'No applicants yet',
  },
  prospects: {
    tab: 'Signed up',
    description: 'Created a SkillsAir account through your link but have not paid yet. A friendly nudge helps.',
    empty: 'No sign-ups yet',
  },
  customers: {
    tab: 'Paid',
    description: 'Paid at least once. You earn on every payment they make, renewals included.',
    empty: 'No paying customers yet',
  },
} as const

export type ReferralSegment = keyof typeof REFERRAL_SEGMENTS

/** The segment named in the URL; paying customers when it is missing or unknown. */
export function referralSegment(value: string | undefined): ReferralSegment {
  return value === 'applicants' || value === 'prospects' || value === 'customers' ? value : 'customers'
}
