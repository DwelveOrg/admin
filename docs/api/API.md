# Operations API Contract Map

The backend's canonical route and authorization documentation is
[Backend API routes](../../../backend_nestJS/docs/api/API_ROUTES.md). This document records the subset
consumed by the operations console.

All calls are server-only. `DWELVE_API_BASE_URL` must include `/api/v1`; requests carry a bearer token,
`X-Request-Id`, `cache: no-store`, a 15-second default timeout, and a Zod response schema.

## Authentication

| Method and route     | Purpose                                   | Frontend implementation                   |
| -------------------- | ----------------------------------------- | ----------------------------------------- |
| `POST /auth/login`   | Verify credentials and obtain role/tokens | `src/lib/auth/api.ts`                     |
| `POST /auth/refresh` | Rotate a single-use refresh token         | `src/lib/auth/api.ts`, `token-refresh.ts` |
| `POST /auth/logout`  | Revoke current refresh session            | `src/lib/auth/api.ts`                     |

`globalRole` is required in the login response. `loginAction` writes no cookie unless it is
`SUPER_ADMIN`.

## Platform overview, users, and schools

| Method and route                          | Purpose                                                         | Notes                                             |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| `GET /platform/overview?days=…`           | Totals, growth/activity series, membership/report distributions | Days are selected in the URL                      |
| `GET /platform/users`                     | Search/filter/paginate all accounts                             | Filters span global and membership roles          |
| `GET /platform/users/:userId`             | User detail and memberships                                     | Full UUID is the key                              |
| `PATCH /platform/users/:userId/access`    | Block or restore global access                                  | Destructive/security-sensitive                    |
| `POST /platform/users/:userId/password`   | Issue a password once and revoke sessions                       | Refuses `SUPER_ADMIN`; plaintext is response-only |
| `GET /platform/schools`                   | Search/filter/paginate schools                                  | Cross-tenant operator view                        |
| `GET /platform/schools/:schoolId`         | School footprint/detail                                         | Full UUID is the key                              |
| `GET /platform/schools/:schoolId/members` | Paginated cross-role members                                    | Platform-only endpoint                            |
| `DELETE /platform/schools/:schoolId`      | Coordinated school deactivation                                 | Backend owns cleanup/lifecycle                    |

Implementation: `src/lib/platform/api.ts`, schemas in `src/lib/platform/schemas.ts`, mutations in
`src/lib/platform/actions.ts`.

## Reports

| Method and route           | Purpose                                                | Notes                                       |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| `GET /reports`             | Search/filter/paginate report docket and status counts | Count-only shell read requests one row      |
| `GET /reports/:reportId`   | Full case, reporter context, evidence metadata         | Report may outlive a deleted reporter       |
| `PATCH /reports/:reportId` | Change status and/or resolution note                   | First terminal transition notifies reporter |

Implementation: `src/lib/reports/api.ts`, `schemas.ts`, and `actions.ts`.

## Authorization and errors

- Every platform/report read and write requires backend-verified `SUPER_ADMIN`; a school `ADMIN` is
  unrelated authority.
- A cookie's role improves routing UX but never replaces the API guard.
- `401` may refresh only from a cookie-writable boundary. `403` is preserved as revocation/refusal.
- Raw validation payloads, stack traces, tokens, and credentials must not enter logs or client error
  strings.
- Response schema changes require coordinated backend DTO/service docs, frontend Zod schema, action,
  page behavior, and this map.
