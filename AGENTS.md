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

**A password cannot be shown, and the UI must say so.** `User.passwordHash` is a
bcrypt hash; the plaintext was never stored, so there is no endpoint that could
produce it. `CredentialPanel` states this on the screen rather than hiding the
absence — an operator who goes looking for a reveal button and finds none will
conclude they lack access, which is the wrong conclusion. What the console
offers instead is issuing a new credential, returned exactly once and persisted
nowhere.

## Design

The model is **the room at night**: a deep field with a slow aurora behind it,
glass instrument panels floating above it, emissive data. `DESIGN.md` is the
full contract — what follows is the part that fails silently if you get it wrong.

The direction contract lives in `src/app/layout.tsx` and is emitted as a real
HTML comment at the top of `<body>` — a JSX comment would be compiled away and a
contract the build erases is one nobody can audit.

**The aurora is the queue.** `Aurora.tsx` computes `--pulse` from the live
open-report count and the field warms and quickens with it. This is a *reading*,
not ambience: if you change what feeds it, you are changing what the room says.
It is never the only channel — every count it encodes is also stated in text.

**Dark-first, and light is a real second character.** The inverse of the product
frontend on purpose. The one thing that never goes dark is the evidence plate:
`.plate-daylight` pins a screenshot of a light product to a light ground in both
characters, because matting one on dark makes it a lightbox.

**Depth is light, not shadow.** A panel is glass — translucent ground, lit top
edge, hairline elsewhere. Raising something makes it brighter, never darkens
underneath. Glass may hold a `PanelWell` (a recess); it may not hold a second
`Panel`.

**Colour means something or it is not there.** The pen is the operator's action
colour and the current selection, nothing decorative. The four disposition
colours are the product's own semantics, unchanged in meaning.

**No state is carried by colour alone.** Each disposition owns a drawn mark as
well as a hue (`DispositionMark`): a solid block not started, a half block in
hand, a check for a fix, a strike for a dismissal.

**Every text token clears 4.5:1** on the lightest ground it lands on, in both
characters — `t3` included, which is quiet but still carries column heads and
metadata. Solve for it; the value that looks like a correct third step lands
around 3.6:1. There is a checker in the design notes of `DESIGN.md`.

Four faces, one per kind of text, and the split is structural:

| Face | Class | Carries |
|---|---|---|
| Bricolage Grotesque | `.display` `.figure` | the console announcing — titles and counts only |
| Instrument Sans | (default) | the console speaking |
| JetBrains Mono | `.ident` `.machine` | the machine reporting |
| Newsreader | `.testimony` | the reporter's own words, and nothing else |

The font variables live on `<html>`, not `<body>`. `--stack-*` in `globals.css`
are declared on `:root` and built from them; a custom property containing
`var()` resolves on the element that declares it, so moving the faces to
`<body>` makes every stack invalid at `:root` and silently drops all four back
to the UA sans.

Do not write `var(--font-sans|mono|serif)` in hand-authored CSS. `@theme inline`
does not emit those on `:root` — it only substitutes into Tailwind's utilities.
Use `var(--stack-*)`.

**12px is the type floor.** Nothing functional is set smaller; `--text-note` is
the smallest step. There are no eyebrows above headings — a heading carries its
own weight.

**`cn()` is not plain `twMerge`.** `src/lib/utils.ts` extends tailwind-merge with
this console's font-size names. Without that it cannot tell `text-13` from
`text-pen-ink`, files them in one conflict group and drops whichever came first
— which is how the primary button's label once shipped near-black on violet at
1.9:1. Every `--text-*` you add to `globals.css` must be added there too.

**The inline theme script needs the CSP nonce.** `src/proxy.ts` sets
`script-src 'self' 'nonce-…' 'strict-dynamic'` with no `unsafe-inline`, so the
pre-paint theme script in `layout.tsx` reads `x-nonce` from headers. Without it
the script is refused and the dark character is lost entirely — and in this
design the ground is a full-viewport lit field, so that flash is the whole
screen rather than a corner of it.

**Reduced motion is honoured in three places, not one.** CSS handles the aurora
drift and transitions; `useCountUp` and `useSpotlight` in
`components/ui/interaction.tsx` are JavaScript and a media query cannot reach
them. The aurora keeps its *colour* when motion is reduced — that is the
reading — and only the drift stops.

### Charts

Recharts drives the two time-series panels on `/`. The distribution rings are
hand-drawn SVG: Recharts 3 removed `activeIndex` from `Pie`, so a controlled
hover-lift plus click-through to a filtered route would fight the component.

Two traps, both of which fail silently:

- **`var()` does not resolve in SVG presentation attributes.** `fill="var(--x)"`
  paints nothing. `useChartPalette` in `chart-kit.tsx` reads the tokens off the
  document and re-reads them when the theme class flips; the hand-drawn ring
  sets colour through `style`, never the attribute. Its fallback map must stay in
  step with `.dark` in `globals.css`.
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
