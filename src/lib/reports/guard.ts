import "server-only";

import { redirect } from "next/navigation";

import { BackendApiError } from "@/lib/api/backend";
import { SessionExpiredError } from "@/lib/auth/backend";

/**
 * Runs a console read, turning "you are not an operator any more" into a
 * sign-out instead of an error page.
 *
 * A 403 here can only mean the account's `SUPER_ADMIN` was revoked since the
 * cookie was written — the backend re-reads the role from PostgreSQL on every
 * request, which is what makes revocation immediate. A 401 means the session
 * could not be refreshed. Both end the same way: clear the cookie, explain, and
 * offer the login screen.
 *
 * Everything else is rethrown. An unreachable API is an outage and should look
 * like one, not like a sign-out that quietly loses the operator's place.
 */
export async function withConsoleAccess<T>(read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      redirect("/session/end?reason=expired");
    }

    if (error instanceof BackendApiError && error.status === 403) {
      redirect("/session/end?reason=revoked");
    }

    throw error;
  }
}
