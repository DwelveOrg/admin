# UUID Domain Ambiguity

## Context

Reports, users, and schools all use full UUIDs. A pasted UUID has a valid lookup shape but contains
no information about which record domain owns it.

## Knowledge

The command palette must not route every UUID to `/reports/:id`. It offers report, user, and school
destinations and lets the selected protected route plus backend authorization determine whether the
record exists. Six-character case idents remain report-only human labels and route through docket
search rather than direct lookup.

## Relevant files

- `src/components/console/CommandPalette.tsx`
- `src/lib/case-ident.ts`
- `docs/security/SECURITY.md`

## Implications

UUID syntax is validation, not resource discovery or authorization. Any future universal lookup must
either keep explicit domain choices or add a backend endpoint that resolves type under `SUPER_ADMIN`
authorization; it must not guess on the client.
