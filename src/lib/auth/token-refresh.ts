import { decodeJwt } from "jose";

import { refreshTokensRequest, type AuthTokens } from "./api";
import type { SessionProfile } from "./session-cookie";
import type { SessionPayload } from "./types";

/**
 * Token rotation, shared by the two runtimes that perform it: the proxy, which
 * refreshes ahead of a render because that is where cookie writes are allowed,
 * and `authedBackendJson`, which refreshes reactively inside a server action.
 *
 * Nothing here touches `next/headers`, so it is safe in middleware.
 */

/**
 * Refresh this long before the token actually expires, so one that is alive when
 * the proxy checks it is still alive when the render using it reaches the API.
 */
export const ACCESS_TOKEN_SKEW_SECONDS = 30;

/**
 * A single expiry can 401 several in-flight requests at once. Refresh tokens are
 * single-use, so those requests must share one rotation rather than each trying
 * to spend the same token. Per runtime instance; the backend's atomic take is
 * the authoritative guard.
 */
const pendingRefreshes = new Map<string, Promise<AuthTokens>>();

export function refreshTokensOnce(refreshToken: string): Promise<AuthTokens> {
  const pending = pendingRefreshes.get(refreshToken);
  if (pending) return pending;

  const refresh = refreshTokensRequest(refreshToken);
  pendingRefreshes.set(refreshToken, refresh);

  const forget = () => {
    if (pendingRefreshes.get(refreshToken) === refresh) {
      pendingRefreshes.delete(refreshToken);
    }
  };

  void refresh.then(forget, forget);

  return refresh;
}

/**
 * The session to store after a rotation. `/auth/refresh` returns tokens only, so
 * the existing identity is carried across unchanged.
 *
 * `globalRole` rides along from the previous session rather than being re-read
 * here — but that is not what enforces it. The backend reloads the role from
 * PostgreSQL on every request, so a revoked operator's next API call fails
 * regardless of what this cookie claims.
 */
export function rotatedSessionProfile(
  session: SessionPayload,
  tokens: AuthTokens,
): SessionProfile {
  return {
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    globalRole: session.globalRole,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * A token that cannot be read is treated as expiring, so a malformed one is
 * replaced rather than sent to the backend to be rejected.
 */
export function isAccessTokenExpiring(accessToken: string | undefined) {
  if (!accessToken) return true;

  try {
    const expiresAt = decodeJwt(accessToken).exp;
    if (typeof expiresAt !== "number") return true;

    return expiresAt - ACCESS_TOKEN_SKEW_SECONDS <= Date.now() / 1000;
  } catch {
    return true;
  }
}
