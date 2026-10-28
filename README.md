# SkillsAir Ambassadors portal

The ambassador portal is a Next.js 16 app for SkillsAir referral partners. It keeps no business data: browser requests go to same-origin route handlers, which call the SkillsAir backend.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set `BACKEND_URL` to the SkillsAir API origin (normally `http://localhost:3001`). `MAIN_SITE_URL` is the public course site and `PORTAL_URL` is the portal’s public origin. Set the backend’s `AMBASSADOR_PORTAL_URL` to the same portal origin so verification and reset emails point here. The portal does not need the Paystack secret or database credentials.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
```

Vitest covers money formatting, the shared password policy, OTP paste handling, status labels and application password guidance. The Playwright smoke test is opt-in: set `STAGING_PORTAL_URL`, `STAGING_AMBASSADOR_EMAIL` and `STAGING_AMBASSADOR_PASSWORD` for an already-approved pilot account. It records mobile 360×800 and desktop 1280×900 screenshots under the Playwright output directory. The complete application/verification/approval journey also requires the staging mailbox and an admin activation step.

## Session and authorization

`amb_access`, `amb_refresh` and the internal user id are HttpOnly cookies. Refresh tokens are exchanged server-side and client components never receive either token. `src/proxy.ts` redirects dashboard navigation without an access cookie; the dashboard layout then asks the backend for the ambassador profile and redirects pending, blocked or unverified accounts before showing dashboard data. The backend remains the authorization boundary for every data endpoint.

## Production container

The multi-stage `Dockerfile` builds Next.js standalone output and serves it on port 3000. Configure `BACKEND_URL`, `MAIN_SITE_URL` and `PORTAL_URL` at runtime. Deploy the portal from this repository as its own service at `ambassador.skillsair.com`.

## Phase 3 boundaries

Withdrawals are not enabled in this phase; the Payouts screen shows the bank account and the “Withdrawals open soon” state. The static bank fallback mentioned by the build brief could not be sourced because `tmp/NigerianBankDirectory.php` was not present in the supplied backend checkout. The bank endpoint uses Paystack and its Redis cache; the portal presents a retryable service error if both are unavailable rather than fabricating bank records.
