# One Time Credential Handoff

## Context

Operators need to restore account access, but existing password plaintext is not stored and cannot be
derived from the bcrypt hash.

## Knowledge

`POST /platform/users/:userId/password` creates a new credential, revokes the target's sessions, and
returns plaintext exactly once. The console holds it only in response/UI state; refresh cannot bring
it back. `SUPER_ADMIN` targets are refused so operator-password reset remains an auditable backend CLI
operation.

## Relevant files

- `src/lib/platform/api.ts`
- `src/lib/platform/actions.ts`
- `src/app/(console)/users/[userId]/`
- `README.md`

## Implications

Do not add an existing-password reveal, store the issued value, place it in a GET URL/log, or make it
recoverable after reload. The handoff screen must explain its one-time nature and support careful copy.

## Related memories

- [[Separate operator trust domain]]
