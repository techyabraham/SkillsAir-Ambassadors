import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { promotionAssetGroups, promotionAssetsForProgramme } from './promotion-assets'

const programme = (slug: string, title: string, schools: string[] = []) => ({ slug, title, schools })

describe('promotion assets', () => {
  it('has a Feed and a Story image on disk for every group', () => {
    for (const group of promotionAssetGroups) {
      expect(group.assets.map((asset) => asset.format)).toEqual(['Feed', 'Story'])
      for (const asset of group.assets) {
        expect(fs.existsSync(path.join(process.cwd(), 'public', asset.src))).toBe(true)
      }
    }
  })

  it.each([
    ['cybersecurity', 'Cyber Security', 'cyber-security'],
    ['ethical-hacking', 'Ethical Hacking', 'ethical-hacking'],
    ['data-analysis', 'Data Analysis', 'data-analysis'],
    ['graphics-design', 'Graphics Design', 'graphics-design'],
    ['uiux', 'UI/UX', 'ui-ux-design'],
    ['website-development-full-stack', 'Website Development (Full Stack)', 'website-development'],
    ['frontend-development', 'Frontend Development', 'website-development'],
    ['mobile-app-development', 'Mobile App Development', 'mobile-app-development'],
    ['cloud-engineering', 'Cloud Engineering (AWS Solutions Architect)', 'cloud-engineering'],
    ['product-management', 'Product Management', 'product-management'],
    ['smart-phone-videography', 'Smart Phone Videography And Content Creation', 'smartphone-videography'],
    ['freelancers-academy', "Freelancer's Academy", 'general'],
  ])('matches %s to the %s creatives', (slug, title, expected) => {
    expect(promotionAssetsForProgramme(programme(slug, title)).id).toBe(expected)
  })

  it('falls back to keywords for programmes added later', () => {
    expect(promotionAssetsForProgramme(programme('advanced-penetration', 'Advanced Hacking')).id).toBe('ethical-hacking')
    expect(promotionAssetsForProgramme(programme('sql-for-everyone', 'SQL', ['School of Data'])).id).toBe('data-analysis')
    expect(promotionAssetsForProgramme(programme('music', 'Music Production')).id).toBe('general')
  })
})
