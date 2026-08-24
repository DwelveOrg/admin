# Development, Environment, and Deployment

## Local setup

Requires Node.js 22.13+, npm, and the sibling NestJS backend.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The console runs at `http://localhost:3001`; the documented local API is
`http://localhost:5001/api/v1`. Grant/revoke operators and issue operator passwords with the backend
CLI commands documented in [`../../README.md`](../../README.md). Never use real report/user data in
fixtures, screenshots, or committed environment files.

## Environment variables

| Variable                 | Purpose                                                     |                         Required | Exposure                              |
| ------------------------ | ----------------------------------------------------------- | -------------------------------: | ------------------------------------- |
| `DWELVE_API_BASE_URL`    | Versioned NestJS API origin                                 | Yes outside development fallback | Server only                           |
| `SESSION_SECRET`         | Encrypt/decrypt `dwelve_ops` JWE cookie                     |                              Yes | Server-only secret; unique to console |
| `NEXT_PUBLIC_MEDIA_HOST` | Optional absolute host for report screenshot CSP/Next Image |                               No | Browser-visible host name             |
| `NODE_ENV`               | Framework runtime/build mode                                |                Framework-managed | Server/build                          |

Production fails closed if `DWELVE_API_BASE_URL` is absent. Development alone defaults to port 5001.
`NEXT_PUBLIC_MEDIA_HOST` must be a host name, agree with backend `PUBLIC_UPLOAD_BASE_URL`, and is
embedded in client-visible configuration.

## Commands and checks

| Command               | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Turbopack development server on port 3001 |
| `npm run dev:webpack` | Webpack development fallback on port 3001 |
| `npx tsc --noEmit`    | Strict type checking                      |
| `npm run lint`        | ESLint                                    |
| `npm run build`       | Webpack production build                  |
| `npm run start`       | Serve an existing build on port 3001      |

There is no first-party test runner. `.github/workflows/ci.yml` runs install, type check, lint, build,
and high-severity dependency audit. CodeQL and Dependabot are configured.

Verification for meaningful work:

1. Run type check, lint, and build.
2. Exercise the affected flow against a backend using an operator and a refused non-operator.
3. Verify both themes, keyboard/focus behavior, reduced motion, narrow/desktop layouts, and errors.
4. For charts, verify pointer, keyboard, selection/reset, legends, and theme-token refresh.
5. For mutations, verify confirmation, backend authorization, safe failures, and resulting server data.
6. Review response headers/CSP for route or media changes and inspect `git diff`.

## Deployment

Checked-in intent is a dedicated Vercel project rooted at this repository. Configure a unique
`SESSION_SECRET`, the production API base, and the media host when it differs from the default.
All API calls are server-side, so the backend browser CORS allow-list does not need this console's
origin. Screenshot delivery must be allowed by CSP and Next image configuration.

Before release, confirm `X-Robots-Tag`, CSP nonce/theme script, private/no-store, frame denial, login,
role revocation, session refresh, `/session/end`, one report transition, and one destructive lifecycle
operation.

## Unknown or external

- Production console domain, DNS ownership, deploy triggers, preview-access policy, environment
  promotion, and rollback process are **Unknown** from the repository.
- The README records Vercel -> DigitalOcean API -> hosted PostgreSQL/Redis/Spaces intent, but actual
  production resources, regions, and current provider settings require external verification.
- No checked-in browser/end-to-end smoke suite, analytics, or error-monitoring client exists.

## Troubleshooting

- Operator loops or sees `403` after role revocation: use `/session/end?reason=revoked` to clear the
  stale cookie; do not weaken backend role checks.
- Theme flashes or remains light: confirm `x-nonce` reaches `layout.tsx` and matches the CSP.
- Screenshot is absent locally: ensure the backend returns a relative `/api/v1/uploads/...` path and
  `resolveMediaUrl` rebases it to the API origin.
- Primary label loses contrast after a type-token change: add the custom size token to the extended
  `tailwind-merge` configuration in `src/lib/utils.ts`.
- Chart color disappears: avoid `fill="var(--token)"`; use `useChartPalette` and style values.
