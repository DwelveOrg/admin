"use server";

import { redirect } from "next/navigation";

import { BackendApiError, BackendResponseValidationError } from "@/lib/api/backend";
import { loginRequest, logoutRequest } from "./api";
import { REQUIRED_GLOBAL_ROLE } from "./constants";
import { createSession, deleteSession, getSession } from "./session";

export type LoginState = { error?: string };

const INVALID_CREDENTIALS = "That email and password combination is not recognised.";
const NOT_AN_OPERATOR = "That account does not have access to the operator console.";
const RATE_LIMITED = "Too many attempts. Wait a moment and try again.";
const UNREACHABLE = "Cannot reach the Dwelve API.";
const GENERIC = "Sign-in failed. Try again.";

/**
 * The only door into this application.
 *
 * The role is checked **before any cookie is written**, so an ordinary user's
 * correct password produces no session at all here — not a session that is then
 * refused at every page. And the refusal reuses the same generic wording as a
 * wrong password would not: an operator mistyping their password and a student
 * discovering this domain exists need different answers, but neither needs to
 * learn which accounts hold the role. `NOT_AN_OPERATOR` is shown only to someone
 * who has already proven they own the account.
 */
export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const response = await loginRequest({ email, password });

    if (response.user.globalRole !== REQUIRED_GLOBAL_ROLE) {
      return { error: NOT_AN_OPERATOR };
    }

    await createSession({
      userId: response.user.id,
      email: response.user.email,
      fullName: response.user.fullName,
      globalRole: response.user.globalRole,
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    });
  } catch (error) {
    return { error: loginError(error) };
  }

  // Outside the try: `redirect` signals by throwing, and catching it here would
  // report a successful sign-in as a failure.
  redirect("/reports");
}

export async function logoutAction() {
  const session = await getSession();

  if (session?.refreshToken) {
    // Best-effort: the backend revoking the refresh token is desirable, but a
    // failure there must not leave the operator holding a live cookie.
    await logoutRequest(session.refreshToken).catch(() => undefined);
  }

  await deleteSession();
  redirect("/login");
}

function loginError(error: unknown) {
  if (error instanceof BackendApiError) {
    if (error.status === 429) return RATE_LIMITED;
    if (error.status === 401 || error.status === 400) return INVALID_CREDENTIALS;
    return GENERIC;
  }

  if (error instanceof TypeError || (error as Error)?.name === "TimeoutError") {
    return UNREACHABLE;
  }

  if (error instanceof BackendResponseValidationError) {
    console.error("Login response validation failed:", error.issues);
    return GENERIC;
  }

  console.error("Login failed:", error);
  return GENERIC;
}
