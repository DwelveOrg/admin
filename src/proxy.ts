import { NextRequest, NextResponse } from "next/server";

import { REQUIRED_GLOBAL_ROLE, SESSION_COOKIE_NAME } from "./lib/auth/constants";
import { buildSessionCookie } from "./lib/auth/session-cookie";
import { decryptSession } from "./lib/auth/session-token";
import {
  isAccessTokenExpiring,
  refreshTokensOnce,
  rotatedSessionProfile,
} from "./lib/auth/token-refresh";
import type { SessionPayload } from "./lib/auth/types";

/**
 * The route guard.
 *
 * Unlike the product frontend, where routes are split into protected and public
 * lists, this application is closed by default: everything except `/login`
 * requires a session, because everything except `/login` is operator-only.
 * A route added later is protected by omission rather than exposed by it.
 *
 * The role is re-read from the cookie on every navigation, not only at sign-in.
 * That alone is not what enforces it — the cookie is ours to write, so a stale
 * `globalRole` inside it proves nothing. `JwtStrategy` reloads the role from
 * PostgreSQL on every API call, and `ReportsService` checks it again, so a
 * revoked operator's requests fail even while holding a valid-looking cookie.
 * This check exists so they meet a login screen rather than a wall of errors.
 */
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLogin = path === "/login";

  // The one path that must answer regardless of what the cookie claims: it is
  // how an operator whose role was revoked gets rid of a cookie that still says
  // otherwise. Guarding it would strand exactly the person it exists for.
  if (path === "/session/end") {
    return NextResponse.next();
  }

  const session = await decryptSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isOperator = Boolean(session?.userId) && session?.globalRole === REQUIRED_GLOBAL_ROLE;

  if (!isOperator && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // An operator who lands on the login screen is sent back to work — unless they
  // arrived carrying a reason, which means something just signed them out. If
  // the cookie clear did not take (a browser refusing it, a path mismatch), then
  // bouncing them to /reports would 403, redirect back here, and loop forever.
  // Honouring the reason costs nothing and makes that loop unreachable.
  if (isOperator && isLogin && !req.nextUrl.searchParams.has("reason")) {
    return NextResponse.redirect(new URL("/reports", req.url));
  }

  return withRefreshedSession(req, session);
}

/**
 * Rotates an expiring access token before the render that needs it runs.
 *
 * This has to happen here rather than in `authedBackendJson`, because Next only
 * allows cookie writes during the action phase: a Server Component render that
 * refreshed would spend the single-use refresh token and then be unable to save
 * its replacement, ending the session for good. Access tokens live 15 minutes
 * while the session cookie lives as long as the refresh token, so this is the
 * ordinary path for any session more than a few minutes old.
 */
async function withRefreshedSession(req: NextRequest, session: SessionPayload | null) {
  if (!session?.refreshToken || !isAccessTokenExpiring(session.accessToken)) {
    return NextResponse.next();
  }

  let cookie;

  try {
    const tokens = await refreshTokensOnce(session.refreshToken);
    cookie = await buildSessionCookie(rotatedSessionProfile(session, tokens));
  } catch {
    // Leave the existing cookie alone. A revoked or expired refresh token
    // surfaces as SessionExpiredError from the read that follows, and a
    // transient failure costs one unrefreshed navigation.
    return NextResponse.next();
  }

  // Written onto the request as well as the response: the response cookie is
  // what the browser sends next time, while this render reads the request.
  req.cookies.set(cookie.name, cookie.value);

  const response = NextResponse.next({ request: { headers: req.headers } });
  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}

/** Skip static assets and Next internals so session decryption only runs on real navigations. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
