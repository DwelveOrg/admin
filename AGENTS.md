# Dwelve Operations Agent Guide

## Project identity

This repository is Dwelve's internal platform-operator console. It serves a small, English-only
`SUPER_ADMIN` audience that monitors the whole platform, manages user/school lifecycle, issues
one-time credentials, and triages user reports. It is deliberately a separate application, domain,
bundle, and session from the student/teacher product.

The console is implemented and production-oriented. It has no database of its own and depends on
the sibling NestJS API for every record and mutation.

## Technology stack

- Next.js 16 App Router, React 19, strict TypeScript, Node.js 22+
- Tailwind CSS 4 and a repository-specific glass/instrument design system
- JWE `httpOnly` operator session via `jose`; Zod-validated server-only backend requests
- Recharts for overview time series; hand-drawn SVG for distribution rings
- Vercel deployment intent; ESLint, TypeScript, production build, audit, and CodeQL gates

## Repository map

```text
src/app/(console)/        Protected overview, users, schools, and reports routes
src/app/login/            The only interactive public page
src/app/session/end/      Always-reachable operator-cookie cleanup route
src/components/console/   Command rail, palette, filters, status, page furniture
src/components/ui/        Operations-specific panels, controls, aurora, interaction hooks
src/lib/auth/             Separate cookie, token refresh, and login/logout flow
src/lib/api/              Low-level server-only backend transport and safe errors
src/lib/platform/         Platform overview/user/school API, schemas, and actions
src/lib/reports/          Report API, schemas, actions, and route guards
DESIGN.md                 Canonical visual and interaction contract
docs/                     Stable architecture, API, security, and operations knowledge
.agent-memory/            Decisions and gotchas worth retaining
```

## Critical engineering rules

- Only `SUPER_ADMIN` enters. `loginAction` must verify `globalRole` before writing any cookie, and
  backend authorization remains authoritative on every request.
- The `dwelve_ops` session and `SESSION_SECRET` are a separate trust domain from the product app.
  Never reuse the cookie name or secret.
- `src/proxy.ts` is closed by default: only `/login` and `/session/end` are public. A new route is
  protected by omission. Preserve private/no-store, nonce CSP, and no-index behavior.
- All API calls remain server-side through `backendJson`/`authedBackendJson`, named request functions,
  and Zod schemas. Do not expose tokens or the API base to browser code.
- A resolution note is delivered to the reporter when a report transitions to Resolved or Dismissed.
  UI that collects the note must disclose that; editing an already-closed note does not notify again.
- Existing passwords cannot be read. Issuing a new credential returns it once, persists no plaintext,
  revokes sessions, and refuses `SUPER_ADMIN` targets. Do not add a reveal-existing-password fiction.
- Full UUIDs are lookup keys; six-character case idents are human labels only.
- Screenshots are the only direct browser data fetch. Use `resolveMediaUrl`; reject unsupported URL
  schemes and keep CSP/image hosts aligned with storage configuration.
- Preserve the visual system in `DESIGN.md`. Reuse `Panel`, `PanelWell`, `Button`, disposition marks,
  chart kit, and typography roles. Glass never nests another `Panel`; depth comes from light.
- The aurora encodes the live open-report count but is never the only channel for that state.
- `cn()` extends `tailwind-merge` for custom font-size tokens. Add new type tokens to both
  `globals.css` and `src/lib/utils.ts` or class merging can silently destroy contrast.
- Font variables stay on `<html>` because root stack variables depend on them. The inline theme
  script must carry the per-request CSP nonce.
- SVG presentation attributes do not reliably resolve CSS `var()` here; use the chart palette/style
  pattern. Recharts `activeTooltipIndex` may be a string. Keep explicit chart focusability.
- Reduced motion is enforced in CSS and JavaScript (`useCountUp`, `useSpotlight`); preserve both.
- Do not introduce a dependency or duplicate a primitive without checking the existing stack.

## Default development loop

Before non-trivial work:

1. Read this file and route the task through `docs/README.md`.
2. Read `DESIGN.md` for UI/chart work and search `.agent-memory/` for the domain.
3. Inspect current implementation, callers, Zod schemas, backend endpoint, and security boundary.
4. Form a short plan and identify likely files.

During implementation, stay within scope, preserve unrelated behavior, reuse established
abstractions, and update stable documentation with behavior. Add memory only for a non-obvious
decision, recurring failure, limitation, or expensive discovery.

Before completion:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Exercise the real affected flow against a local backend, including `SUPER_ADMIN` refusal boundaries,
errors, destructive confirmation, keyboard/focus behavior, both themes, reduced motion, and the
changed diff. There is no first-party automated test suite; never claim success solely from code.

> When implementation changes stable project behavior, update the relevant `/docs` source of truth
> in the same task.

> When you discover a non-obvious fact, decision, limitation, recurring bug, or important gotcha
> that future agents may otherwise rediscover, write or update a persistent memory note.

Source priority: executable code; configuration and backend schemas; this file; `/docs` and
`DESIGN.md`; persistent memory; old comments and handoffs. Investigate conflicts before changing an
invariant. Never commit secrets, credentials, private report evidence, or local environment files.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
