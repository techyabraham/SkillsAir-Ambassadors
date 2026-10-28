import { spawnSync } from 'node:child_process'

if (!process.env.STAGING_PORTAL_URL) {
  console.log('Playwright staging checks skipped. Set STAGING_PORTAL_URL and approved pilot credentials to run them.')
  process.exit(0)
}

const result = spawnSync('playwright', ['test'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
process.exit(result.status ?? 1)
