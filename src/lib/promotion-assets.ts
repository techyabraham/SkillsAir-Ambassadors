export interface PromotionAsset {
  title: string
  format: 'Feed' | 'Story'
  width: number
  height: number
  src: string
  filename: string
  alt: string
}

export type PromotionAssetGroupId =
  | 'general'
  | 'cyber-security'
  | 'data-analysis'
  | 'graphics-design'
  | 'ui-ux-design'
  | 'website-development'
  | 'mobile-app-development'
  | 'cloud-engineering'
  | 'product-management'
  | 'smartphone-videography'
  | 'ethical-hacking'

export interface PromotionAssetGroup {
  id: PromotionAssetGroupId
  title: string
  description: string
  assets: PromotionAsset[]
}

/** The deadline printed on the current creatives. Update it whenever the fliers are replaced. */
export const PROMOTION_ASSETS_DEADLINE = '30 November'

const FORMATS = [
  { format: 'Feed', width: 1080, height: 1350, placement: 'social media feed' },
  { format: 'Story', width: 1080, height: 1920, placement: 'social media story' },
] as const

function group(id: PromotionAssetGroupId, title: string, description: string): PromotionAssetGroup {
  const subject = id === 'general' ? 'General SkillsAir' : `SkillsAir ${title}`
  return {
    id,
    title,
    description,
    assets: FORMATS.map(({ format, width, height, placement }) => {
      const filename = `skillsair-${id}-${format.toLowerCase()}-${width}x${height}.png`
      return {
        title: `${title} ${format} creative`,
        format,
        width,
        height,
        src: `/promotion-assets/${filename}`,
        filename,
        alt: `${subject} scholarship promotion, sized for a ${placement}.`,
      }
    }),
  }
}

export const promotionAssetGroups: PromotionAssetGroup[] = [
  group('general', 'General SkillsAir', 'Introduce SkillsAir and the current scholarship offer.'),
  group('cyber-security', 'Cyber Security', 'Promote the Cyber Security programme.'),
  group('ethical-hacking', 'Ethical Hacking', 'Promote the Ethical Hacking programme.'),
  group('data-analysis', 'Data Analysis', 'Promote the Data Analysis programme.'),
  group('graphics-design', 'Graphics Design', 'Promote the Graphics Design programme.'),
  group('ui-ux-design', 'UI/UX Design', 'Promote the UI/UX Design programme.'),
  group('website-development', 'Website Development', 'Promote the Website Development programmes.'),
  group('mobile-app-development', 'Mobile App Development', 'Promote the Mobile App Development programme.'),
  group('cloud-engineering', 'Cloud Engineering', 'Promote the Cloud Engineering programme.'),
  group('product-management', 'Product Management', 'Promote the Product Management programme.'),
  group('smartphone-videography', 'Smartphone Videography', 'Promote the Smartphone Videography programme.'),
]

/** Programme slugs (skillsair.com/courses/<slug>) with their own creatives. */
const GROUP_BY_SLUG: Record<string, PromotionAssetGroupId> = {
  cybersecurity: 'cyber-security',
  'ethical-hacking': 'ethical-hacking',
  'data-analysis': 'data-analysis',
  'graphics-design': 'graphics-design',
  uiux: 'ui-ux-design',
  'website-development-full-stack': 'website-development',
  'frontend-development': 'website-development',
  'mobile-app-development': 'mobile-app-development',
  'cloud-engineering': 'cloud-engineering',
  'product-management': 'product-management',
  'smart-phone-videography': 'smartphone-videography',
}

/** Keyword fallback for programmes added after this list, checked in order. */
const GROUP_BY_KEYWORD: [RegExp, PromotionAssetGroupId][] = [
  [/\bethical\b|\bhacking\b/, 'ethical-hacking'],
  [/\bcyber\b|\bsecurity\b/, 'cyber-security'],
  [/\bdata\b/, 'data-analysis'],
  [/\bui\b|\bux\b|uiux/, 'ui-ux-design'],
  [/\bgraphics?\b/, 'graphics-design'],
  [/\bmobile app\b/, 'mobile-app-development'],
  [/\bwebsite\b|\bweb\b|\bfrontend\b|\bfull stack\b/, 'website-development'],
  [/\bcloud\b|\baws\b/, 'cloud-engineering'],
  [/\bproduct\b/, 'product-management'],
  [/\bvideography\b|\bvideo\b/, 'smartphone-videography'],
]

export function promotionAssetsForProgramme(programme: {
  slug: string
  title: string
  schools: string[]
}): PromotionAssetGroup {
  const programmeText = [programme.slug, programme.title, ...programme.schools]
    .join(' ')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[-_/]/g, ' ')

  const groupId =
    GROUP_BY_SLUG[programme.slug] ??
    GROUP_BY_KEYWORD.find(([pattern]) => pattern.test(programmeText))?.[1] ??
    'general'

  return promotionAssetGroups.find((item) => item.id === groupId) ?? promotionAssetGroups[0]!
}
