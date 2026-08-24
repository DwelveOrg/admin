# Separate Operator Trust Domain

## Context

The operator console reads data and performs actions that no school member, including a school
administrator, may access. It is a separate app rather than a privileged route in the product.

## Knowledge

Only backend `User.globalRole = SUPER_ADMIN` grants access. Login verifies the role before writing a
cookie. The console uses cookie `dwelve_ops` and its own `SESSION_SECRET`; the product session must not
decrypt here or vice versa. Proxy checks improve routing, while the NestJS API reloads global role and
enforces every operation.

## Relevant files

- `src/lib/auth/actions.ts`
- `src/lib/auth/constants.ts`
- `src/lib/auth/session-token.ts`
- `src/proxy.ts`
- `docs/security/SECURITY.md`

## Implications

Never share cookie names or session secrets, never treat school `ADMIN` as platform authority, and
never move report/platform endpoints into browser code. A new route remains closed by default.

## Related memories

- [[Operator refresh write boundary]]
