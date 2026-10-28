const REFERRAL_CODE = /^[A-Z0-9]{8}$/
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i

function allowedSiteOrigin(mainSiteUrl: string): URL {
  let site: URL
  try {
    site = new URL(mainSiteUrl)
  } catch {
    throw new Error('The SkillsAir site address is not configured correctly.')
  }

  const localHttp =
    site.protocol === 'http:' &&
    (site.hostname === 'localhost' || site.hostname === '127.0.0.1')
  if (
    (site.protocol !== 'https:' && !localHttp) ||
    site.pathname !== '/' ||
    site.search ||
    site.hash ||
    site.username ||
    site.password
  ) {
    throw new Error('The SkillsAir site address is not configured correctly.')
  }
  return site
}

function validCode(code: string): string {
  if (!REFERRAL_CODE.test(code)) throw new Error('Your referral code could not be loaded.')
  return code
}

function setReferralCode(url: URL, referralCode: string): void {
  const oldKeys: string[] = []
  url.searchParams.forEach((_value, key) => {
    if (key.toLowerCase() === 'skr' || key.toLowerCase() === 'ref') oldKeys.push(key)
  })
  for (const key of oldKeys) url.searchParams.delete(key)
  url.searchParams.set('skr', validCode(referralCode))
}

export function buildProgrammeReferralLink(
  mainSiteUrl: string,
  slug: string,
  referralCode: string,
): string {
  const cleanSlug = slug.trim()
  if (!SAFE_SLUG.test(cleanSlug)) throw new Error('This programme does not have a valid page address.')

  const url = new URL('/programmes/' + encodeURIComponent(cleanSlug), allowedSiteOrigin(mainSiteUrl))
  setReferralCode(url, referralCode)
  return url.toString()
}

export function buildCustomReferralLink(
  target: string,
  mainSiteUrl: string,
  referralCode: string,
): string {
  const site = allowedSiteOrigin(mainSiteUrl)
  let url: URL
  try {
    url = new URL(target)
  } catch {
    throw new Error('Enter a valid public SkillsAir page URL.')
  }

  if (
    url.origin !== site.origin ||
    url.protocol !== site.protocol ||
    url.username ||
    url.password
  ) {
    throw new Error('Enter a public page on the SkillsAir website.')
  }
  setReferralCode(url, referralCode)
  return url.toString()
}
