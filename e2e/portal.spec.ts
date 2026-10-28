import { expect, test } from '@playwright/test'

const email = process.env.STAGING_AMBASSADOR_EMAIL
const password = process.env.STAGING_AMBASSADOR_PASSWORD
const stagingUrl = process.env.STAGING_PORTAL_URL

test('pilot ambassador can log in and view dashboard screens', async ({ page }, testInfo) => {
  test.skip(
    !stagingUrl || !email || !password,
    'Set the staging portal URL and an approved pilot account to run portal smoke checks.',
  )
  for (const path of ['/', '/apply', '/verify', '/login', '/forgot-password', '/reset-password']) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath(
        `${path === '/' ? 'landing' : path.slice(1).replaceAll('/', '_')}.png`,
      ),
      fullPage: true,
    })
  }
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email!)
  await page.getByLabel('Password').fill(password!)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(/dashboard/)
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
  for (const path of [
    '/dashboard',
    '/dashboard/referrals',
    '/dashboard/earnings',
    '/dashboard/payouts',
    '/dashboard/links',
    '/dashboard/settings',
  ]) {
    await page.goto(path)
    await expect(page.locator('main')).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath(`${path.replaceAll('/', '_').replace(/^_/, '') || 'home'}.png`),
      fullPage: true,
    })
  }
})

test('payout request can be approved and updated by a transfer webhook', async ({ page }) => {
  const ready = process.env.STAGING_PAYOUT_READY === 'true'
  test.skip(!ready || !stagingUrl || !email || !password, 'Set STAGING_PAYOUT_READY=true for an approved pilot account with a verified bank and at least the payout minimum.')
  let status = 'requested'
  const payout = { id: 9001, amountKobo: 500_000, status, bankName: 'Test Bank', accountLast4: '1234', createdAt: new Date().toISOString(), processedAt: null, failureReason: null }
  await page.route('**/api/payouts*', async (route) => {
    if (route.request().method() === 'POST') {
      status = 'requested'
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: { payout } }) })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [{ ...payout, status }] }) })
  })
  await page.route('**/api/ambassadors/admin/payouts/9001/approve', async (route) => {
    status = 'processing'
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 9001, status } }) })
  })
  await page.route('**/api/payments/webhook', async (route) => {
    status = 'success'
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { received: true } }) })
  })
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email!)
  await page.getByLabel('Password').fill(password!)
  await page.getByRole('button', { name: 'Log in' }).click()
  await page.goto('/dashboard/payouts')
  await page.getByRole('textbox', { name: 'Withdrawal amount in naira' }).fill('5000')
  await page.getByRole('button', { name: 'Review withdrawal' }).click()
  await page.getByRole('button', { name: 'Confirm withdrawal' }).click()
  await expect(page.getByText('Requested', { exact: true })).toBeVisible()
  await page.evaluate(async () => fetch('/api/ambassadors/admin/payouts/9001/approve', { method: 'POST' }))
  await page.evaluate(async () => fetch('/api/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'transfer.success', data: { reference: 'amb_test', status: 'success', amount: 500000, currency: 'NGN' } }) }))
  await page.reload()
  await expect(page.getByText('Paid', { exact: true })).toBeVisible()
})
