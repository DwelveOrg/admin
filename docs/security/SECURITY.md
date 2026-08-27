# Authentication, Authorization, and Security

## Trust boundary

This console is a distinct privileged application. Only a backend account whose global role is
`SUPER_ADMIN` may enter. School membership roles (`ADMIN`, `TEACHER`, `STUDENT`) never grant platform
access.

## Login and session

1. `/login` posts credentials through the `loginAction` Server Action.
2. `POST /auth/login` returns identity, required `globalRole`, and API tokens.
3. `loginAction` checks `SUPER_ADMIN` before it calls `createSession`.
4. The encrypted JWE cookie is named `dwelve_ops`, `httpOnly`, `sameSite=lax`, path `/`, and secure in
   production. Its expiry follows the refresh-token `exp` when readable.
5. `src/proxy.ts` decrypts the cookie for routing and proactively rotates expiring tokens.
6. The backend reloads global role for API authorization; revocation therefore takes effect on the
   next API request even if a cookie still says `SUPER_ADMIN`.

`SESSION_SECRET` must be a long random secret unique to this console. Sharing it with the product
would collapse separate trust domains. Tokens must never reach browser storage or client props.

## Route and response protection

- Proxy policy is closed by default. Only `/login` and `/session/end` bypass the session requirement.
- `/session/end` stays reachable so a revoked operator can clear a stale cookie instead of looping
  through API `403` responses.
- Every response is `private, no-store`, no-index/no-follow, and frame-denied.
- `next.config.ts` supplies baseline HSTS, MIME, referrer, opener, feature, and robot headers.
- `src/proxy.ts` creates a per-request CSP nonce and forwards it in `x-nonce` to the root layout.
  The pre-paint theme script must use that nonce. Production script policy has no `unsafe-inline`.
- The current CSP still permits inline styles. Do not render raw report/user HTML.

## Server/API boundary

- `DWELVE_API_BASE_URL` is server-only. Browser components never call the API directly.
- All API responses used by the UI are Zod-validated.
- Backend authorization is authoritative on every platform and report operation.
- Requests use IDs for correlation and no-store caching. Do not log credentials, tokens, full
  report testimony/evidence, or query strings containing sensitive information.
- Report screenshot URLs are untrusted strings: `resolveMediaUrl` accepts HTTP(S) or a genuine local
  relative path and rejects other schemes. CSP and Next image hosts must match the configured media
  host.

## Navigation and search boundary

- Global search is a client-side route launcher, not a client API or cross-domain index. Text searches
  navigate to server-rendered user, school, or report directories.
- UUID format does not reveal whether a key belongs to a report, user, or school. The palette offers
  all three protected routes and never treats a guessed resource type as authorization or existence.
- Common view switches write only documented role/status/search values to the query string. Do not put
  credentials, tokens, report testimony, or other sensitive values in these shareable URLs.
- Sidebar queue counts are a convenience channel. The protected route read and backend authorization
  remain authoritative; a failed shell count degrades to zero without weakening either boundary.

## Credential and lifecycle invariants

- Existing password plaintext does not exist and cannot be revealed from a bcrypt hash.
- Password issuance uses `POST`, returns plaintext once, never persists it in this repository, and
  revokes the target's sessions. `SUPER_ADMIN` targets must use the auditable backend CLI instead.
- Case idents are not database keys. All lookups and writes use full UUIDs.
- Resolution/dismissal notes are delivered to reporters on the first terminal transition. UI must
  disclose this at the input.
- School deactivation and user blocking are backend-coordinated operations; do not emulate cleanup
  with multiple frontend calls.

## Security-sensitive locations

- `src/proxy.ts`
- `src/lib/auth/`
- `src/lib/api/backend.ts`
- `src/lib/platform/actions.ts`
- `src/lib/reports/actions.ts`
- `src/lib/media.ts`
- `next.config.ts`

## Known gaps

- No first-party automated security/session tests exist in this repository.
- A dedicated private vulnerability-report address is not published in repository docs.
- CSP/media-host and production session settings require deployment-level verification.
