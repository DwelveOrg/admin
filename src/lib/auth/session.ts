import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./constants";
import {
  buildSessionCookie,
  getSessionExpiry,
  sessionCookieOptions,
  type SessionProfile,
} from "./session-cookie";
import { decryptSession } from "./session-token";
import type { Operator, SessionPayload } from "./types";

export type { SessionProfile };

export async function createSession(profile: SessionProfile) {
  const cookieStore = await cookies();
  const { name, value, options } = await buildSessionCookie(profile);

  cookieStore.set(name, value, options);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decryptSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/** The signed-in operator, for the shell. Null when there is no usable session. */
export async function getOperator(): Promise<Operator | null> {
  const session = await getSession();

  if (!session?.userId) return null;

  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
  };
}

/**
 * Whether a rotated session could actually be saved right now.
 *
 * Next only allows cookie writes during the action phase; a Server Component
 * render gets a sealed store whose `set` throws. Refresh tokens are single-use,
 * so starting a refresh in a render would spend the token and then fail to save
 * its replacement — killing the session for good. Probing first by rewriting the
 * cookie we already hold is a no-op when writes are allowed, and tells us to back
 * off before anything is spent when they are not.
 */
export async function canPersistSession(session: SessionPayload) {
  const cookieStore = await cookies();
  const current = cookieStore.get(SESSION_COOKIE_NAME);

  if (!current) return false;

  try {
    cookieStore.set(
      SESSION_COOKIE_NAME,
      current.value,
      sessionCookieOptions(getSessionExpiry(session.refreshToken)),
    );

    return true;
  } catch {
    return false;
  }
}
