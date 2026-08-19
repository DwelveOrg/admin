# Dwelve Operations

The operator console. Problem reports users file from inside Dwelve arrive here,
and a platform admin reads them, decides what happens, and — on closing one —
tells the person who filed it.

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
/login                  the only door
/reports                the docket — filters, counts, case list
/reports/<uuid>         one case, with the docket beside it
```

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

Light-first, which is unusual for an operator tool and follows from the content:
the evidence on screen is screenshots of a light product, and a near-black chrome
makes every one of them glare. Dark is supported for evening triage.

Three typefaces, one per kind of text, because three kinds share a case file and
telling them apart is a reading aid rather than decoration:

- **Instrument Sans** — the console speaking
- **IBM Plex Mono** — the machine reporting (idents, UUIDs, user agents, viewports)
- **Newsreader** — the reporter's own words, and nothing else

Violet and the four disposition colours are the product's own tokens, unchanged.
Same company; green has to keep meaning the same thing in both places.

## Deploying

Vercel project with this directory as the root. Set `DWELVE_API_BASE_URL` and a
fresh `SESSION_SECRET` in Production. The app sends `X-Robots-Tag: noindex,
nofollow` and `X-Frame-Options: DENY` on every route.
