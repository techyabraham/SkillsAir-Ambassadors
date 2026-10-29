export interface PromotionAsset {
  title: string
  format: 'Feed' | 'Story'
  width: number
  height: number
  src: string
  filename: string
  alt: string
}

export interface PromotionAssetGroup {
  id: 'general' | 'cyber-security' | 'data-analysis'
  title: string
  description: string
  assets: PromotionAsset[]
}

export const promotionAssetGroups: PromotionAssetGroup[] = [
  {
    id: 'general',
    title: 'General SkillsAir',
    description: 'Introduce SkillsAir and the current scholarship offer.',
    assets: [
      {
        title: 'General Feed creative',
        format: 'Feed',
        width: 1080,
        height: 1350,
        src: '/promotion-assets/skillsair-general-feed-1080x1350.png',
        filename: 'skillsair-general-feed-1080x1350.png',
        alt: 'General SkillsAir scholarship promotion, sized for a social media feed.',
      },
      {
        title: 'General Story creative',
        format: 'Story',
        width: 1080,
        height: 1920,
        src: '/promotion-assets/skillsair-general-story-1080x1920.png',
        filename: 'skillsair-general-story-1080x1920.png',
        alt: 'General SkillsAir scholarship promotion, sized for a social media story.',
      },
    ],
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    description: 'Promote the School of Security and its Cyber Security programme.',
    assets: [
      {
        title: 'Cyber Security Feed creative',
        format: 'Feed',
        width: 1080,
        height: 1350,
        src: '/promotion-assets/skillsair-cyber-security-feed-1080x1350.png',
        filename: 'skillsair-cyber-security-feed-1080x1350.png',
        alt: 'SkillsAir Cyber Security scholarship promotion, sized for a social media feed.',
      },
      {
        title: 'Cyber Security Story creative',
        format: 'Story',
        width: 1080,
        height: 1920,
        src: '/promotion-assets/skillsair-cyber-security-story-1080x1920.png',
        filename: 'skillsair-cyber-security-story-1080x1920.png',
        alt: 'SkillsAir Cyber Security scholarship promotion, sized for a social media story.',
      },
    ],
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Promote the School of Data and its Data Analysis programme.',
    assets: [
      {
        title: 'Data Analysis Feed creative',
        format: 'Feed',
        width: 1080,
        height: 1350,
        src: '/promotion-assets/skillsair-data-analysis-feed-1080x1350.png',
        filename: 'skillsair-data-analysis-feed-1080x1350.png',
        alt: 'SkillsAir Data Analysis scholarship promotion, sized for a social media feed.',
      },
      {
        title: 'Data Analysis Story creative',
        format: 'Story',
        width: 1080,
        height: 1920,
        src: '/promotion-assets/skillsair-data-analysis-story-1080x1920.png',
        filename: 'skillsair-data-analysis-story-1080x1920.png',
        alt: 'SkillsAir Data Analysis scholarship promotion, sized for a social media story.',
      },
    ],
  },
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

  const groupId = /\bcyber\b|\bsecurity\b/.test(programmeText)
    ? 'cyber-security'
    : /\bdata\b/.test(programmeText)
      ? 'data-analysis'
      : 'general'

  return promotionAssetGroups.find((group) => group.id === groupId) ?? promotionAssetGroups[0]!
}
