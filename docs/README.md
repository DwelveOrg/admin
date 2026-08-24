# Dwelve Operations Documentation

Use this index to load only the context relevant to the task.

| Task                                                                | Read first                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Product purpose, roles, or operator workflow                        | [`../PRODUCT.md`](../PRODUCT.md), [`../README.md`](../README.md)                         |
| Layers, routes, state, or request flow                              | [`architecture/ARCHITECTURE.md`](./architecture/ARCHITECTURE.md)                         |
| Endpoint or response-contract work                                  | [`api/API.md`](./api/API.md)                                                             |
| Authentication, authorization, CSP, sessions, or credentials        | [`security/SECURITY.md`](./security/SECURITY.md)                                         |
| Visual system, components, charts, responsiveness, or accessibility | [`../DESIGN.md`](../DESIGN.md)                                                           |
| Environment, development, CI, deployment, or troubleshooting        | [`operations/DEVELOPMENT_AND_DEPLOYMENT.md`](./operations/DEVELOPMENT_AND_DEPLOYMENT.md) |
| Non-obvious decisions and gotchas                                   | [`../.agent-memory/README.md`](../.agent-memory/README.md)                               |

## Knowledge boundaries

- `AGENTS.md` tells agents how to work and what invariants not to violate.
- `/docs` and the root product/design documents describe the current system.
- `.agent-memory` preserves reasoning and costly discoveries.
- Temporary plans, command logs, and task status do not belong in those layers.

## Maintenance

Keep one canonical owner per concept and cross-link instead of copying. Update API/security docs with
stable behavior, `DESIGN.md` with visual-system changes, and environment docs with `.env.example`.
Mark unverifiable facts as **Unknown** or **Needs verification** and never store credentials, report
evidence, user data, or actual secret values.

Source priority when facts conflict: executable code; backend/configuration/schema; `AGENTS.md`;
current docs and `DESIGN.md`; persistent memory; historical comments and handoffs. Investigate the
conflict because documentation may describe an invariant the implementation violates.
