import type { Metadata } from "next";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Dwelve Operations" };

/**
 * Why the operator is looking at this screen rather than the docket.
 *
 * "Revoked" is worth naming precisely. Someone who was working a minute ago and
 * is suddenly signed out will otherwise assume an outage and go looking for one;
 * the actual cause is a decision another person made, and it is not recoverable
 * by retrying.
 */
const REASONS: Record<string, string> = {
  revoked: "This account no longer has platform admin access.",
  expired: "Your session expired. Sign in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const reasonParam = (await searchParams).reason;
  const reason = REASONS[Array.isArray(reasonParam) ? reasonParam[0] : (reasonParam ?? "")];

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8">
          <p className="field-label mb-2">Dwelve</p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Operations</h1>
          <p className="mt-2 text-13 leading-relaxed text-ink-soft">
            Problem report triage. Platform admins only — a school admin account
            will not open this.
          </p>
        </div>

        {reason ? (
          <p
            role="status"
            className="mb-4 rounded-md border border-rule bg-wash px-3 py-2.5 text-13 text-ink-soft"
          >
            {reason}
          </p>
        ) : null}

        <div className="rounded-xl border border-rule bg-file p-6 shadow-file">
          <LoginForm />
        </div>

        {/* No signup, no password reset, no Google. There is nothing this screen
            could offer someone without an account, and offering it anyway would
            be an invitation to try. */}
        <p className="mt-6 text-2xs leading-relaxed text-ink-faint">
          Access is granted from the backend command line, not from this screen.
          Ask whoever holds the database credential.
        </p>
      </div>
    </main>
  );
}
