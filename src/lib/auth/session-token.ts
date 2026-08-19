import { EncryptJWT, jwtDecrypt } from "jose";

import { SESSION_DURATION_MS } from "./constants";
import type { SessionPayload } from "./types";

const SESSION_DURATION_SECONDS = Math.floor(SESSION_DURATION_MS / 1000);

/**
 * The session cookie is encrypted, not merely signed: it carries the backend
 * access and refresh tokens, so its contents must not be readable by anything
 * that gets hold of the cookie.
 *
 * There is no development fallback secret. The product frontend has one because
 * a broken local session there costs a developer a login; here the same
 * convenience would mean an operator console running on a publicly known key
 * the first time someone forgot to set the variable.
 */
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. The operator console will not run without one.",
    );
  }

  return secret;
}

async function getSessionKey() {
  const keyMaterial = new TextEncoder().encode(getSessionSecret());
  return new Uint8Array(await crypto.subtle.digest("SHA-256", keyMaterial));
}

export async function encryptSession(payload: SessionPayload) {
  return new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(getExpirationTime(payload.expiresAt))
    .encrypt(await getSessionKey());
}

export async function decryptSession(session: string | undefined = "") {
  if (!session) return null;

  try {
    const { payload } = await jwtDecrypt(session, await getSessionKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

function getExpirationTime(expiresAt: string) {
  const timestamp = Date.parse(expiresAt);

  return Number.isFinite(timestamp)
    ? Math.floor(timestamp / 1000)
    : `${SESSION_DURATION_SECONDS}s`;
}
