# Dwelve Operations

The operator console. Platform admins monitor adoption and activity, manage
student account access, deactivate schools, and triage problem reports users
file from inside Dwelve. Closing a report tells the person who filed it.

Separate application, separate repository, separate domain, separate session.
Not a route inside the product frontend, on purpose: a report carries another
user's words, page URL, and screenshot, so none of this should be shipped in the
bundle a student loads.

## Who can open it

Only an account whose `User.globalRole` is `SUPER_ADMIN`. A school `ADMIN` is
**not** a platform admin and this app will refuse them at sign-in, before any
cookie is written.

There is no signup here. Create the account in the product, then promote it from
the backend:

```bash
cd ../backend_nestJS
npm run admin:grant -- you@dwelve.com
npm run admin:grant -- --list          # confirm
npm run admin:password -- you@dwelve.com # generate/reset the login password
npm run admin:grant -- old@dwelve.com --revoke
```

Revocation takes effect on the operator's next request — `JwtStrategy` re-reads
the role from PostgreSQL every time — so there is no need to wait for a session
to expire.

## Running it

```bash
npm install
cp .env.example .env.local     # then fill it in
npm run dev                    # http://localhost:3001
```

`.env.local` needs two values:

| Variable               | Notes                                                          |
| ---------------------- | -------------------------------------------------------------- |
| `DWELVE_API_BASE_URL`  | The same NestJS API the product uses. Server-side only.         |
| `SESSION_SECRET`       | **Must differ from the frontend's.** 32 random bytes.           |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Sharing the frontend's secret would mean a student's session cookie decrypts
here and an operator's decrypts there. They are different trust domains.

## What it talks to

Nothing of its own. No database, no Redis, no storage bucket — every read and
write goes through the NestJS API, which owns all of those.

```
admin (Vercel)  ──►  NestJS API (DigitalOcean)  ──►  Neon Postgres
                                                └──►  Upstash Redis
                                                └──►  Spaces (screenshots)
```

Screenshots are the one thing the browser fetches directly, from the same CDN
the product uses. In local development the backend stores them on disk and
returns a *relative* URL; `resolveMediaUrl` re-bases those onto the API origin so
they still load.

The backend's CORS allowlist does not need this app's origin: every API call is
made server-side, from Server Components and server actions.

## The shape of it

```
/                       platform growth, activity, membership and report charts
/users                  every account — search, role filter, global access control
/users/<uuid>           one account: memberships, sign-in, credential handover
/schools                cross-school search and coordinated school deactivation
/schools/<uuid>         one school: footprint, membership list, deactivation
/login                  the only door
/reports                the docket — filters, counts, case list
/reports/<uuid>         one case, with the docket beside it
```

`/students` permanently redirects to `/users?role=STUDENT`; operators paste
console URLs to each other and a link that worked last week should not 404.

Everything except `/login` requires a session. `src/proxy.ts` is closed by
default rather than working from a list of protected routes, so a route added
later is protected by omission instead of exposed by it.

Cases are labelled `R-8F3A21` — six hex characters of the UUID, which is what an
operator says out loud and pastes into a commit message. It is a label, never a
key: links, lookups and writes all use the full UUID, and the case file keeps it
one copy-click away.

## The note is not an internal comment

When a case is set to Resolved or Dismissed, the backend writes a notification to
the reporter in the same transaction, carrying the resolution note. They read it
in the product. Only the transition notifies — editing the note on an
already-closed case does not fire a second time.

## Design

The model is **the room at night**: a deep field with a slow aurora behind it,
glass instrument panels floating above it, data that looks lit rather than
printed. Deliberately the inverse of the product frontend — that app is a light
document a student reads for an hour, this is an instrument an operator watches,
and moving between the two windows should never require checking which is which.

**The aurora is the queue.** The field's colour and drift are computed from the
live open-report count: cool and slow when the board is clear, warming toward
amber and quickening as work stacks up. The console's first question is how much
is waiting, and the room answers it before a word is read. It is never the only
channel — every count it encodes is also stated in text on the same screen.

**Dark-first**, with light as a real second character for daytime work. The one
thing that never goes dark is the evidence: a screenshot of a light product is
pinned to a daylight plate in both characters, because matting one on a dark
ground turns it into a lightbox.

Four typefaces, one per kind of text, because a case file puts three of them on
one screen and telling them apart is a reading aid rather than decoration:

- **Bricolage Grotesque** — the console announcing. Display only: page titles and
  the counts read from across a room.
- **Instrument Sans** — the console speaking. Every other interface surface.
- **JetBrains Mono** — the machine reporting (idents, UUIDs, user agents, and the
  issued credential), chosen because it separates 0/O and 1/l/I hardest.
- **Newsreader** — the reporter's own words, and nothing else.

Violet and the four disposition colours keep the product's own meanings. Same
company; green has to keep meaning the same thing in both places. Nothing carries
its state in colour alone — each disposition owns a drawn mark as well as a hue,
so the docket reads in greyscale and to a colour-blind operator. Every text
colour clears 4.5:1 in both characters.

`⌘K` opens the command palette: paste a UUID to open that case, a case ident to
find it, or any term to search users, schools and reports.

The dashboard's two trend panels are interactive: a crosshair readout naming
every series at the day under the pointer, series you can mute from the legend,
drag across the plate to read a shorter window, arrow keys to step day by day,
Esc to reset. The distribution rings link into the matching part of the docket.

`DESIGN.md` is the full system; `AGENTS.md` carries the traps that fail silently.

## Handing over a login

An operator can read any account's login and issue it a new password from
`/users/<uuid>`. There is no way to *read* an existing password and there cannot
be one — `User.passwordHash` is a bcrypt hash, so the plaintext was never stored
by anyone. Issuing a new one returns it exactly once, in that response: nothing
persists it, a reload will not bring it back, and every live session for that
account is signed out behind it. A platform admin's password still has to be
reset from the backend CLI, so that escalation stays somewhere auditable.

## Deploying

Vercel project with this directory as the root. Set `DWELVE_API_BASE_URL` and a
fresh `SESSION_SECRET` in Production. The app sends `X-Robots-Tag: noindex,
nofollow` and `X-Frame-Options: DENY` on every route. The proxy also applies a
per-request nonce-based Content Security Policy and marks every response
`private, no-store`; operator case data must never enter a shared browser/CDN
cache. Backend calls carry request IDs and time out after 15 seconds by default.
