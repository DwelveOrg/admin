import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Drops the session and returns to the login screen.
 *
 * It exists because of one case the proxy cannot handle on its own: an operator
 * whose `SUPER_ADMIN` was revoked while they were signed in. The cookie still
 * says they are an operator — it is ours, written when they still were — so the
 * proxy waves them through, and the first API call of the render answers 403.
 * Without somewhere to send them that would surface as an error boundary, which
 * reads like an outage rather than like a role change.
 *
 * A Route Handler rather than a redirect out of the render, because clearing the
 * cookie is the whole point and Next only permits cookie writes outside the
 * render phase. The proxy lets this path through unauthenticated, so it works
 * regardless of what the stale cookie claims.
 */
export function GET(request: NextRequest) {
  const reason = request.nextUrl.searchParams.get("reason");
  const destination = new URL("/login", request.url);

  if (reason) destination.searchParams.set("reason", reason);

  const response = NextResponse.redirect(destination);
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
