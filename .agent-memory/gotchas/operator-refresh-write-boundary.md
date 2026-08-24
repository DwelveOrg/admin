# Operator Refresh Write Boundary

## Context

API refresh tokens rotate and can be used once. Next.js Server Component renders cannot persist a
replacement cookie.

## Knowledge

The proxy proactively refreshes an expiring access token and writes the rotated cookie to both the
current request and response. A reactive `authedBackendJson` refresh first probes
`canPersistSession`; if the boundary is read-only it leaves the refresh token unspent. A losing
concurrent refresh may retry with the rotated session written by the winner.

## Relevant files

- `src/proxy.ts`
- `src/lib/auth/backend.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/token-refresh.ts`

## Implications

Do not simplify refresh into an unconditional `401` retry from Server Components. Preserve identical
cookie attributes between proxy and actions and test expiry, concurrency, logout, and revoked roles.

## Related memories

- [[Separate operator trust domain]]
