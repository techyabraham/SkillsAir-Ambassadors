import { describe, expect, it } from 'vitest'
import { isStrongPassword, passwordRules } from './password'

describe('isStrongPassword', () => {
  it('matches the backend five-rule password policy', () => {
    expect(isStrongPassword('SkillsAir1!')).toBe(true)
    expect(isStrongPassword('skillsair1!')).toBe(false)
    expect(isStrongPassword('SkillsAir!')).toBe(false)
    expect(isStrongPassword('Skill1!')).toBe(false)
    expect(passwordRules).toHaveLength(5)
  })
})
