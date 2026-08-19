import { decodeJwt } from "jose";

import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "./constants";
import { encryptSession } from "./session-token";
import type { SessionPayload } from "./types";

export type SessionProfile = Omit<SessionPayload, "expiresAt">;

export type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  expires: Date;
};

export type SessionCookie = {
  name: typeof SESSION_COOKIE_NAME;
  value: string;
  options: SessionCookieOptions;
};

/**
 * Every write of the session cookie must carry these attributes. Exported so a
 * caller rewriting the existing value cannot drop `httpOnly` or `secure` by
 * omission — a bare `set(name, value)` would do exactly that.
 */
export function sessionCookieOptions(expires: Date): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  };
}

/**
 * Builds the cookie without touching `next/headers`, so the proxy can write the
 * same cookie the app does. That split is load-bearing: Next only allows cookie
 * writes during the action phase, so a Server Component render cannot persist a
 * rotated token — see `src/proxy.ts`.
 */
export async function buildSessionCookie(profile: SessionProfile): Promise<SessionCookie> {
  const expires = getSessionExpiry(profile.refreshToken);

  return {
    name: SESSION_COOKIE_NAME,
    value: await encryptSession({ ...profile, expiresAt: expires.toISOString() }),
    options: sessionCookieOptions(expires),
  };
}

/**
 * The cookie has to outlive the access token and expire with the refresh token,
 * otherwise a rotation becomes impossible once the shorter lifetime elapses.
 *
 * Decoding here reads only the standard `exp` claim of a token our own backend
 * issued and which lives inside an httpOnly encrypted cookie. Verification and
 * rotation remain the backend's job.
 */
export function getSessionExpiry(refreshToken?: string) {
  if (refreshToken) {
    try {
      const expiresAt = decodeJwt(refreshToken).exp;

      if (typeof expiresAt === "number" && expiresAt * 1000 > Date.now()) {
        return new Date(expiresAt * 1000);
      }
    } catch {
      // Fall through to the short-lived default for a malformed token.
    }
  }

  return new Date(Date.now() + SESSION_DURATION_MS);
}
