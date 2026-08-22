---
name: Dwelve Operations
description: The room at night — a lit aurora field, glass instrument panels, and a queue you read from the wall colour before you read a word.
colors:
  void: "#f4f6fb"
  void-deep: "#e8ebf3"
  panel-solid: "#ffffff"
  t1: "#0b0e16"
  t2: "#4b5468"
  t3: "#697187"
  pen: "#5b34e8"
  pen-hover: "#4a26cf"
  pen-ink: "#ffffff"
  ring: "#6d4aff"
  open: "#b04a09"
  open-lit: "#ea8c3e"
  review: "#0d6f80"
  review-lit: "#22a6bd"
  resolved: "#05704a"
  resolved-lit: "#10a06b"
  dismissed: "#58617a"
  dismissed-lit: "#7d879d"
  danger: "#b3231f"
  danger-lit: "#e2564f"
  aurora-calm: "#0f9e86"
  aurora-cool: "#2563d8"
  aurora-pen: "#5b34e8"
  aurora-load: "#d97317"
  dark-void: "#06070d"
  dark-void-deep: "#030408"
  dark-panel-solid: "#12141d"
  dark-t1: "#eef1f8"
  dark-t2: "#9aa4bb"
  dark-t3: "#778096"
  dark-pen: "#8b6cff"
  dark-pen-ink: "#0b0716"
  dark-open: "#ffab5c"
  dark-review: "#5ad4e6"
  dark-resolved: "#5fdc9d"
  dark-dismissed: "#97a2b9"
  dark-danger: "#ff8177"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  count:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  figure:
    fontFamily: "Bricolage Grotesque, Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  h2:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: "1.45rem"
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  note:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.125rem"
    letterSpacing: "normal"
  label:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1.125rem"
    letterSpacing: "0.06em"
    textTransform: "uppercase"
  machine:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  testimony:
    fontFamily: "Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  xs: "6px"
  sm: "9px"
  md: "13px"
  lg: "18px"
  xl: "24px"
  pill: "99px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  panel:
    backgroundColor: "rgb(255 255 255 / 0.74)"
    textColor: "{colors.t1}"
    rounded: "{rounded.lg}"
    backdropFilter: "blur(20px) saturate(150%)"
  panel-raised:
    backgroundColor: "rgb(255 255 255 / 0.92)"
    textColor: "{colors.t1}"
    rounded: "{rounded.lg}"
    backdropFilter: "blur(28px) saturate(160%)"
  panel-well:
    backgroundColor: "rgb(14 18 32 / 0.035)"
    textColor: "{colors.t1}"
    rounded: "{rounded.md}"
  plate-daylight:
    backgroundColor: "#ffffff"
    textColor: "#0b0e16"
    rounded: "{rounded.md}"
  button-primary:
    backgroundColor: "{colors.pen}"
    textColor: "{colors.pen-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "38px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.pen-hover}"
    textColor: "{colors.pen-ink}"
  button-glass:
    backgroundColor: "rgb(255 255 255 / 0.74)"
    textColor: "{colors.t1}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "38px"
  button-danger:
    backgroundColor: "rgb(255 255 255 / 0.74)"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "38px"
  input:
    backgroundColor: "rgb(14 18 32 / 0.035)"
    textColor: "{colors.t1}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "38px"
    typography: "{typography.body}"
  chip-open:
    backgroundColor: "rgb(176 74 9 / 0.10)"
    textColor: "{colors.open}"
    rounded: "{rounded.xs}"
    padding: "4px 10px"
  chip-review:
    backgroundColor: "rgb(13 111 128 / 0.10)"
    textColor: "{colors.review}"
    rounded: "{rounded.xs}"
    padding: "4px 10px"
  chip-resolved:
    backgroundColor: "rgb(5 112 74 / 0.10)"
    textColor: "{colors.resolved}"
    rounded: "{rounded.xs}"
    padding: "4px 10px"
  chip-dismissed:
    backgroundColor: "rgb(88 97 122 / 0.10)"
    textColor: "{colors.dismissed}"
    rounded: "{rounded.xs}"
    padding: "4px 10px"
  nav-tab-active:
    backgroundColor: "rgb(255 255 255 / 0.92)"
    textColor: "{colors.t1}"
    rounded: "{rounded.sm}"
    height: "36px"
---

# Design System: Dwelve Operations

## Overview

An operations room, not a document. The ground is a deep field with a slow
aurora behind it; the interface is a set of glass instrument panels floating a
few millimetres above that field, and the data on them is emissive — lit from
behind rather than printed.

This is deliberately the inverse of the product frontend. That app is a light,
warm, document-shaped surface a student reads for an hour, set in IBM Plex with
soft-depth cards. This is an instrument an operator watches. Two different jobs,
two different rooms — and an operator moving between the two windows should
never have to check which one they are looking at.

**Dark-first**, with light as a genuine second character for daytime work rather
than an inversion: at noon the field goes to a cool off-white and glass becomes
frosted rather than lit, but the aurora, the panel vocabulary and every semantic
colour keep their meaning.

## The signature — the aurora is the queue

The field behind the glass is not decoration and it is not random. `--pulse`
(0 → 1) is computed in `Aurora.tsx` from the live open-report count: at rest the
field sits cool — green-cyan, wide, slow — and as work stacks up it warms toward
amber and the drift period shortens from 64s to 42s. The console's first
question is *how much is waiting*, and the room answers it before a word is read.

Saturation point is 24 open reports, chosen from what this queue actually looks
like: past a couple of dozen standing reports a hotter wall says nothing new,
and below it the gradient genuinely distinguishes five from twenty.

**It is never the only channel.** Every count the field encodes is also stated in
text on the same screen, and the drift carries the same reading as the hue for
anyone who reads movement more easily than colour. Nothing is load-bearing for
someone who cannot see it.

## The second signature — the sealed credential

A password cannot be shown, because `User.passwordHash` is a bcrypt hash and the
plaintext was never stored. What the console can do is issue a new one, and that
card (`CredentialPanel`) is the loudest object in the application — a lit violet
panel where everything around it is glass — because it is the only state here
that cannot be returned to. It is masked until revealed, copyable as a
login/password pair, and it says on its face that reloading will not bring it
back.

## Colors

Strategy: **restrained in deployment, semantic in vocabulary.** The room is
field, glass and text. Colour appears only where it carries meaning, and every
colour on screen has a legend somewhere.

### Primary

`pen` is the operator's pen: primary actions, the current selection, the
drag-selection band on a chart. Never decoration. It is the product's own action
colour and keeps that meaning across both apps.

### Secondary — acuity

The four dispositions, carrying the product's semantics unchanged: `open` (work
not started), `review` (work in hand), `resolved` (a fix), `dismissed` (a
conclusion, deliberately colourless — a dismissal is not an achievement and a
colour would let it read as one down the column).

Each has a `-lit` sibling for a glow and a `-wash` for chip grounds.

### Neutral

`void` is the field, `panel` the glass over it, `panel-raised` glass lifted, and
`panel-sunk` a recess. Text ramps `t1` → `t2` → `t3`.

### Named Rules

- **No state is carried by colour alone.** Every disposition owns a drawn mark as
  well as a hue. See Signature Component below.
- **Every text token clears 4.5:1** against the lightest ground it lands on, in
  both characters — including `t3`, which is the quietest step but still carries
  functional text (column heads, metadata, pager counts). These were solved for,
  not eyeballed: the value that *looked* like a correct third step came out at
  3.6:1.
- **Chart series take the plate's own pen set**, declared in that plate's legend.
  Roles are not dispositions, so the membership ring uses pen, review and
  resolved with its own legend rather than borrowing disposition meanings.
- **`pen` never tints a surface** except `pen-wash` for a current selection.
- **A delta is text ink with a drawn caret**, never green-up/red-down; that would
  borrow a disposition's meaning to say "went up".

## Typography

Four faces, one per genuinely different kind of text, because a case file puts
three of them on one screen at once and separating them typographically means no
labels are needed to say which is which.

- **Bricolage Grotesque** — the console announcing. A display grotesque with real
  character in its joins, which is exactly wrong for a 13px table cell and
  exactly right for a count read across a room. **Display only**: page titles and
  figures, a handful of elements per page.
- **Instrument Sans** — the console speaking. Every other interface surface.
- **JetBrains Mono** — the machine reporting: idents, UUIDs, user agents,
  viewports, builds, and the issued credential. Chosen because it disambiguates
  0/O and 1/l/I harder than the alternatives, and a mistyped credential is a
  support ticket.
- **Newsreader** — a person's own words, and nothing else. Route-scoped to the
  case file (`preload: false`), the only place testimony appears.

None of these is the frontend's face.

### Hierarchy

A fixed rem scale, never fluid: an operator reads this at a steady DPI all day,
and a heading that shrinks inside a narrow pane reads as broken rather than
responsive. The overview's opening line is the single exception — it is the
page's thesis and clamps between 2rem and 3.5rem.

`display` 56px → `count` 44px → `figure` 28px → `h2` 15px → `body` 13px →
`note`/`label` 12px.

### Named Rules

- **12px is the floor.** Nothing functional is set smaller.
- **No eyebrows.** A heading carries its own weight; `.label` labels a column, a
  field or a `<dt>`, never a heading.
- **Figures are tabular** console-wide, so counts do not jitter down a column.
- **Prose measure is capped** (`.testimony` at 68ch, page intros at ~64ch);
  tables and machine data run denser.

## Layout

The page scrolls; the field behind it does not. The command rail floats over the
field as a sticky sheet of glass rather than sitting on it as a bar, so the room
stays one continuous thing however far down you are. Content caps at 1520px.

The docket is the one two-pane surface: a sticky column beside a scrolling case
file above `lg`, and the whole page below it, where the case file becomes its own
route.

## Elevation & Depth

**Depth is light, not shadow.** A panel is a sheet of glass: a translucent
ground, a lit top edge where the light catches it, and a hairline everywhere
else. Raising something makes it brighter and its edge sharper — it never
darkens the surface underneath.

### Shadow Vocabulary

- `lift-1` — a panel resting over the field: an inset top-edge highlight plus a
  soft ambient pool.
- `lift-2` — a panel lifted: the command rail, the palette, a chart readout, the
  login sheet.
- `lift-pen` — a violet glow, for the primary action and the credential card.

### Named Rules

- **Rules divide within a panel, never between panels.** Panels are separated by
  the field showing between them.
- **Pressed controls move.** `active:translate-y-px` with the glow removed.
- **Glass may hold a well, never another panel.** A recess is a different
  material gesture; a second sheet of glass doubles the blur cost and flattens
  both.

## Shapes

9–18px corners. These are instrument panels, not paper cards and not stickers.
The 99px pill is reserved for the scrollbar thumb, which is not part of the panel
scale.

## Motion

- **160ms** on controls, with a `cubic-bezier(0.2, 0.8, 0.2, 1)` curve: fast
  enough that an operator in flow never waits for choreography, shaped enough
  that a control feels like an object.
- **Figures count up once** on first paint, ease-out cubic over 900ms — a number
  that lands reads as just measured, which is what a live instrument should look
  like. The final value is what the server renders, so no state ever shows
  something untrue.
- **The aurora drifts** over 42–64s depending on the pulse.
- **`prefers-reduced-motion` is honoured throughout**, in CSS and in the two
  JavaScript effects that CSS cannot reach (`useCountUp`, `useSpotlight`). The
  aurora keeps its *colour* when motion is reduced — that is the reading — and
  only the drift stops.

## Components

### Buttons

`primary` (the pen, with a real glow), `glass`, `ghost`, `danger`. One shape and
one height across the whole console.

### Panels

`Panel` is the only container, with an optional ruled head and footer.
`PanelWell` is the recess inside it.

### Inputs / Fields

38px tall, recessed ground — a field is the one place you put something *into*,
and the ground going darker than its surroundings says so before any border
does. Focus lights the recess: a violet edge plus a 3px glow ring.

### Navigation

The rail is a floating glass sheet. The current section is a lit pill: the ground
changes material *and* the label goes to full ink, so the state survives being
unable to see the violet.

### Command palette (⌘K)

Not a search index — every entry is a route the console could already reach. It
recognises a pasted UUID (opens the case directly) and a case ident (goes to the
docket search that can resolve it), and otherwise offers all three directory
searches, because it cannot know whether a term is a school or a person but it
can offer both.

### Signature Component — the acuity mark

Four silhouettes, not four colours: a solid block for work not started, a
half-filled block for work in hand, a check for a fix, a strike for a dismissal.
Drawn SVG at 12px, because no icon library has a glyph meaning "half done" that
does not also mean something else. This is what makes the console readable in
greyscale, on a projector, and to an operator who cannot separate amber from
green. It survived the redesign because it was never a stylistic choice.

### Signature Component — the case row carrier

A strip of acuity colour down the leading edge that *glows*, because in this room
an acuity colour is a light source and light spills. `dismissed` carries no glow
by design.

## Do's and Don'ts

### Do:

- Give every colour a legend and every state a shape.
- Keep the evidence on a daylight plate. A screenshot of a light product matted
  on a dark ground is a lightbox.
- Use `cn()` from `src/lib/utils.ts` — it is tailwind-merge taught this console's
  font-size names. Every `--text-*` added to `globals.css` must be added there.
- Read chart colours through `useChartPalette`; `var()` does not resolve in SVG
  presentation attributes.
- Confirm a destructive action inline, in the console's own words.

### Don't:

- Put an eyebrow above a heading.
- Ship functional text below 12px, or a text colour under 4.5:1.
- Nest a panel inside a panel.
- Raise `window.confirm` — it is the one surface here nobody designed, and it
  cannot state what an action does.
- Let the pen mean anything but "action" or "selected".
- Write `var(--font-sans|mono|serif)` in hand-authored CSS; use `var(--stack-*)`.
- Let the aurora become the only channel for anything.
