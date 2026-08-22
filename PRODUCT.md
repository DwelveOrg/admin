# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dwelve platform admins — the internal Dwelve team. An operator is an account whose
`User.globalRole` is `SUPER_ADMIN`; a school `ADMIN` is explicitly *not* one and is
refused at sign-in before any cookie is written. The population is very small and
known by name. There is no signup: access is granted from the backend CLI
(`npm run admin:grant`) and revoked the same way, taking effect on the operator's
next request.

Two jobs, done in the same sitting:

1. **Watch the platform.** Is adoption moving, are people actually taking tests,
   how many schools are live, how much support work is queued.
2. **Act on individuals.** Find any account on the platform — student, teacher,
   school admin or operator — and block or restore it across every school; hand
   someone a working login when they have lost theirs; open a school and read its
   membership, or deactivate it with the full cleanup; read a problem report
   someone filed from inside the product and answer it.

## Product Purpose

The operator console for the Dwelve platform. It is the only surface where a
platform admin can see across all schools at once and take actions no school
admin is allowed to take. Closing a problem report is not a bookkeeping act —
the backend writes a notification to the reporter in the same transaction,
carrying the resolution note, which they read inside the product.

Success is an operator opening it and knowing within seconds how much is waiting,
then closing that queue without leaving the app.

## Positioning

Deliberately a separate application, repository, domain and session from the
product frontend — not a route inside it. A problem report carries another user's
words, page URL and screenshot, so none of it should ship in the bundle a student
loads. The session cookie is `dwelve_ops` under its own `SESSION_SECRET`, so a
student's cookie cannot decrypt here and an operator's cannot decrypt there.

## Operating Context

Desktop, at a laptop. Dark-first, because this is an instrument watched rather
than a document read; light is a full second character for working beside the
product itself.
The operator is usually moving between this console, the product itself, a
terminal, and a chat window — case idents (`R-8F3A21`) and full UUIDs get pasted
between all four, which is why both are on screen and one copy-click away.

Routes:

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

## Capabilities and Constraints

- **Owns no data.** No database, no Redis, no storage bucket. Every read and
  write goes through the NestJS API. All calls are server-side, from Server
  Components and server actions.
- **Closed by default.** `src/proxy.ts` requires a session for everything except
  `/login` and `/session/end`; a route added later is protected by omission.
- **Screenshots are the one direct browser fetch**, from the same CDN the product
  uses. Locally the backend returns a relative URL that `resolveMediaUrl` re-bases.
- **Terminology is fixed**: case *ident* (`R-8F3A21`, six hex of the UUID, a label
  and never a key), *docket*, *disposition* (Open / In review / Resolved /
  Dismissed), *claimant*, *testimony*, *evidence*.
- **Report kinds**: Bug, Feedback, Question. **Report statuses**: OPEN, IN_REVIEW,
  RESOLVED, DISMISSED; the last two are terminal and notify the reporter.
- A report outlives its reporter — `IssueReport.userId` is nullable, so a deleted
  account does not take its bug reports with it.
- Overview ranges are 7 / 30 / 90 days and live in the query string.
- **A password can be issued, never read.** `User.passwordHash` is a bcrypt hash,
  so no surface can show an existing password. The console issues a new one,
  returns it exactly once, revokes the account's live sessions, and persists it
  nowhere. A `SUPER_ADMIN` target is refused — that reset stays on the backend
  CLI, where it is auditable.
- The user directory spans both role systems in one filter: `SUPER_ADMIN` is
  global, `ADMIN`/`TEACHER`/`STUDENT` are memberships, and `NO_SCHOOL` is the
  absence of one.
- English only. The operators are the Dwelve team.
- Ships `X-Robots-Tag: noindex, nofollow` and `X-Frame-Options: DENY`.

## Brand Commitments

- The name is **Dwelve**; this app is **Dwelve Operations**.
- **Violet is the product's action colour** and the four disposition colours carry
  meanings shared with the product — amber Open, cyan In review, green Resolved,
  neutral Dismissed. Green has to keep meaning the same thing in both places.
  These semantics are binding; their exact hex values are not.
- The resolution note is delivered to the reporter. Any UI that collects it must
  say so where it is typed.

## Evidence on Hand

Real, from the live NestJS API: platform totals (accounts, student accounts,
active schools, open/total reports), daily growth series (users and schools
joined, running totals), daily activity series (attempts started, attempts
submitted, reports filed), membership distribution by role, report distribution
by status, paginated user and school lists with memberships, owners and
footprint counts, per-school membership pages with roles and class counts, and
full report records with message, screenshot, page URL, viewport, locale, app
version and user agent.

No marketing copy, no logo file, no illustration library, no photography. Nothing
about customers, pricing or benchmarks may be invented — this is an internal tool
and has no such claims to make.

## Product Principles

1. **How much is waiting is the first question.** Counts are stated, never
   hidden; zero is the most reassuring thing this app can say.
2. **The evidence is the content.** Screenshots of a light product are the
   objects on screen; chrome must not fight them.
3. **Three kinds of text share a case file** — the console speaking, the machine
   reporting, and the reporter's own words. Telling them apart is a reading aid,
   not decoration.
4. **An ident is for talking, a UUID is for querying.** Both stay on screen.
5. **Closing a case speaks to a person.** The interface must never let an
   operator forget that.
6. **Say what the system cannot do, rather than hiding it.** An operator who
   looks for a password reveal and finds nothing concludes they lack access. The
   console states that the value does not exist and offers the action that does.

## Accessibility & Inclusion

No external standard was established. Operators work all day in this tool, so
keyboard reachability, visible focus, honoured `prefers-reduced-motion`, and
disposition state that survives colour-blindness (never colour alone) are
treated as requirements rather than nice-to-haves.
