<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Dwelve Operations

The operator console for Dwelve platform admins. It combines cross-platform
health and lifecycle controls with the problem reports users file from inside
the product.

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

The model is a **ward handover board**: the enamel board on a hospital wall at
shift change, ruled into columns, one magnetic tile per case, acuity colour
doing the triage before a word is read. Someone walks in, reads it from the
door, and knows how much is waiting and who needs a person now. That is this
console's first question, so the board answers it the same way.

The direction contract lives in `src/app/layout.tsx` and is emitted as a real
HTML comment at the top of `<body>` — a JSX comment would be compiled away and a
contract the build erases is one nobody can audit.

**Surfaces step wall → enamel → tile.** `--room` is the wall, `--board` is the
vitreous enamel field, `--tile` is a magnetic tile resting on it. The dark band
across the top is the board's steel frame and it earns the darkness by naming
the shift; everything below it stays enamel so the tiles own the field.

**Light-first**, because the evidence on screen is screenshots of a light
product and a dark chrome makes every one of them glare. Dark is a genuine
second character for evening triage, not an inversion.

**Colour means something or it is not there.** Violet is the operator's pen —
primary actions and current selection, nothing decorative. The four disposition
colours are the product's own semantics, unchanged in meaning. Every other pixel
is enamel, graphite and rule.

**No state is carried by colour alone.** Each disposition owns a drawn mark as
well as a hue (`DispositionMark`): a solid block not started, a half block in
hand, a check for a fix, a strike for a dismissal. The board reads correctly in
greyscale and to an operator who cannot separate amber from green.

**Depth is a real object on a board.** `--lift-1` is a tile resting on the
enamel, `--lift-2` is one picked up. Hard 1px rules and a 3px corner, never the
soft rounded card.

Three faces, one per kind of text, and the split is structural rather than
decorative:

| Face | Class | Carries |
|---|---|---|
| Archivo | (default) | the board speaking; `wdth` 84% for column heads |
| Azeret Mono | `.ident` `.machine` | the machine reporting |
| Petrona | `.testimony` | the reporter's own words, and nothing else |

Archivo is one family doing two jobs — the `wdth` axis supplies the condensed
setting a ruled board uses for column heads, so `.board-label` needs no second
sans. That axis is only available because `layout.tsx` requests
`axes: ["wdth"]`; drop it and every column head silently renders at normal width.

The font variables live on `<html>`, not `<body>`. `--stack-*` in `globals.css`
are declared on `:root` and built from them; a custom property containing
`var()` resolves on the element that declares it, so moving the faces to
`<body>` makes every stack invalid at `:root` and silently drops all three back
to the UA sans.

Do not write `var(--font-sans|mono|serif)` in hand-authored CSS. `@theme inline`
does not emit those on `:root` — it only substitutes into Tailwind's utilities.
Use `var(--stack-*)`.

**12px is the type floor.** Nothing functional is set smaller; `--text-note` is
the smallest step. There are no eyebrows above headings — a heading carries its
own weight.

**`cn()` is not plain `twMerge`.** `src/lib/utils.ts` extends tailwind-merge with
this board's font-size names. Without that it cannot tell `text-13` from
`text-violet-ink`, files them in one conflict group and drops whichever came
first — which is how the primary button's label once shipped near-black on
violet at 1.9:1.

**The inline theme script needs the CSP nonce.** `src/proxy.ts` sets
`script-src 'self' 'nonce-…' 'strict-dynamic'` with no `unsafe-inline`, so the
pre-paint theme script in `layout.tsx` reads `x-nonce` from headers. Without it
the script is refused and the dark character is lost entirely, not just the
flash it exists to prevent.

### Charts

Recharts drives the two time-series plates on `/`. The distribution rings are
hand-drawn SVG: Recharts 3 removed `activeIndex` from `Pie`, so a controlled
hover-lift plus click-through to a filtered route would fight the component.

Two traps, both of which fail silently:

- **`var()` does not resolve in SVG presentation attributes.** `fill="var(--x)"`
  paints nothing. `useBoardPalette` in `chart-kit.tsx` reads the tokens off the
  document and re-reads them when the theme class flips; the hand-drawn ring
  sets colour through `style`, never the attribute.
- **Recharts 3 types `activeTooltipIndex` as `number | string | null`.** Testing
  only for `number` yields nothing on every hover and reads as a dead feature.

`accessibilityLayer` wires the arrow-key handler but does not make the plot
focusable — both charts pass `tabIndex={0}` and `role="application"` explicitly,
and Recharts forwards those to the `<svg>`, not the wrapper.

English only. The operators are the Dwelve team.

## Commands

```bash
npm run dev     # localhost:3001
npm run build
npm run lint
```

There is no test script. Validate with `npx tsc --noEmit`, `npm run lint`,
`npm run build`, and by driving the real flows against a local backend.
