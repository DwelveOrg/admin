# Persistent Agent Memory

This directory preserves non-obvious security decisions and failure modes that future agents should
not have to rediscover. `/docs`, `PRODUCT.md`, and `DESIGN.md` describe current truth; memory explains
why constraints exist. Temporary progress and routine commands do not belong here.

## Index

### Decisions

- [[Separate operator trust domain]] — why console sessions cannot be shared with the product

### Gotchas

- [[CSP nonce and theme bootstrap]] — the nonce/header/font placement chain that fails silently
- [[One time credential handoff]] — why a reset credential is response-only and not recoverable
- [[Operator refresh write boundary]] — why render-time refresh must not spend rotating tokens

## Maintenance

Search the affected domain before editing, read useful linked notes, then inspect current code and
backend authorization. Update an existing note when possible. Never store passwords, issued
credentials, tokens, report testimony/evidence, user data, command logs, or speculative behavior.

Source priority: code; current configuration/backend schema; `AGENTS.md`; current docs and
`DESIGN.md`; memory; history and handoffs. Resolve conflicts rather than silently picking one.
