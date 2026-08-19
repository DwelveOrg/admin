import "server-only";

import { z } from "zod";

import { BackendApiError, backendJson, type BackendRequestInit } from "@/lib/api/backend";
import { refreshTokensOnce, rotatedSessionProfile } from "./token-refresh";
import { canPersistSession, createSession, deleteSession, getSession } from "./session";
import type { SessionPayload } from "./types";

/** Thrown when an authenticated request has no usable session or access token. */
export class SessionExpiredError extends BackendApiError {
  constructor(message = "Your session expired. Sign in again.") {
    super(message, 401);
    this.name = "SessionExpiredError";
  }
}

/**
 * Drops a session once its credentials can no longer be refreshed. Best-effort
 * in a server render, where Next forbids cookie mutation; a server action clears
 * it properly and the operator lands back on the login screen.
 */
async function throwSessionExpired(): Promise<never> {
  await deleteSession().catch(() => undefined);
  throw new SessionExpiredError();
}

async function refreshAccessToken(current: SessionPayload) {
  if (!current.refreshToken) {
    throw new SessionExpiredError();
  }

  const tokens = await refreshTokensOnce(current.refreshToken);
  await createSession(rotatedSessionProfile(current, tokens));

  return tokens.accessToken;
}

function withAuthHeader<TSchema extends z.ZodTypeAny | undefined>(
  init: BackendRequestInit<TSchema>,
  accessToken: string,
): BackendRequestInit<TSchema> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  return { ...init, headers };
}

/**
 * A backend request carrying the operator's access token, refreshing once on a
 * 401 and retrying.
 *
 * A 403 is deliberately *not* retried or masked here: for this app it means the
 * account is no longer a platform admin, which is a real answer and not a
 * transient failure. Callers surface it.
 */
export async function authedBackendJson<TSchema extends z.ZodTypeAny>(
  path: string,
  init: BackendRequestInit<TSchema>,
): Promise<z.infer<TSchema>>;
export async function authedBackendJson<TResponse = unknown>(
  path: string,
  init?: BackendRequestInit,
): Promise<TResponse>;
export async function authedBackendJson(
  path: string,
  init: BackendRequestInit = {},
): Promise<unknown> {
  const session = await getSession();

  if (!session?.accessToken) {
    return throwSessionExpired();
  }

  try {
    return await backendJson(path, withAuthHeader(init, session.accessToken));
  } catch (error) {
    const isUnauthorized = error instanceof BackendApiError && error.status === 401;

    if (!isUnauthorized) throw error;
    if (!session.refreshToken) return throwSessionExpired();

    // Refresh tokens are single-use, so a refresh started where its replacement
    // cannot be saved — any Server Component render — would spend the token and
    // strand the session permanently. Leaving it unspent keeps the session
    // recoverable: the proxy rotates it on the next navigation.
    if (!(await canPersistSession(session))) {
      throw new SessionExpiredError();
    }

    let accessToken: string;

    try {
      accessToken = await refreshAccessToken(session);
    } catch (refreshError) {
      if (refreshError instanceof BackendApiError && refreshError.status === 401) {
        // Another request may have rotated the tokens between this one reading
        // the session and its refresh landing. That is a lost race, not an
        // expired session, so retry with whatever the winner wrote.
        const rotated = await getSession();

        if (rotated?.accessToken && rotated.accessToken !== session.accessToken) {
          return backendJson(path, withAuthHeader(init, rotated.accessToken));
        }

        return throwSessionExpired();
      }

      throw refreshError;
    }

    return backendJson(path, withAuthHeader(init, accessToken));
  }
}
