<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Dwelve Operations

The operator console for Dwelve platform admins. Problem reports users file from
inside the product are read, dispositioned, and answered here.

Read `README.md` first. It covers who can open this app, how the role is granted,
and what the app talks to.

## The rules that are not negotiable

**Only `SUPER_ADMIN` gets in.** `loginAction` checks `globalRole` *before writing
any cookie*, so an ordinary account with the correct password produces no session
at all. Do not soften this into a post-login redirect.

**The session is not the product's session.** A different cookie name
(`dwelve_ops`) and a different `SESSION_SECRET`. Sharing either would make a
student's cookie decrypt here. `src/lib/auth/` mirrors the frontend's session
code on purpose — port fixes across rather than diverging.

**`src/proxy.ts` is closed by default.** Everything except `/login` and
`/session/end` needs a session. A new route is protected by omission; never
invert this into an allowlist of protected paths.

**The resolution note is delivered to the reporter.** Closing a case writes a
notification carrying the note, in the same backend transaction. Any UI that
collects that note must say so where it is typed — see `DecisionForm`.

## Design

Three typefaces, one per kind of text, and the split is structural rather than
decorative:

| Face | Class | Carries |
|---|---|---|
| Instrument Sans | (default) | the console speaking |
| IBM Plex Mono | `.ident` `.machine` `.field-label` | the machine reporting |
| Newsreader | `.testimony` | the reporter's own words, and nothing else |

The font variables live on `<html>`, not `<body>`. `--stack-*` in `globals.css`
are declared on `:root` and built from them; a custom property containing
`var()` resolves on the element that declares it, so moving the faces to
`<body>` makes every stack invalid at `:root` and silently drops all three back
to the UA sans.

Do not write `var(--font-sans|mono|serif)` in hand-authored CSS. `@theme inline`
does not emit those on `:root` — it only substitutes into Tailwind's utilities.
Use `var(--stack-*)`.

Light-first, because the evidence on screen is screenshots of a light product.
Violet and the four disposition colours are the product's own tokens, unchanged.

English only. The operators are the Dwelve team.

## Commands

```bash
npm run dev     # localhost:3001
npm run build
npm run lint
```

There is no test script. Validate with `npx tsc --noEmit`, `npm run lint`,
`npm run build`, and by driving the real flows against a local backend.
