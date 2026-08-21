import type { Metadata } from "next";
import { Info } from "lucide-react";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Dwelve Operations" };

/**
 * Why the operator is looking at this screen rather than the board.
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
        {/* The same steel rail the console hangs from, so the door and the room
            behind it are recognisably one place. */}
        <div className="tile overflow-hidden p-0 shadow-lift-2">
          <div className="flex items-center gap-2.5 bg-rail px-5 py-3">
            <span className="text-15 font-bold tracking-[-0.01em] text-rail-ink">Dwelve</span>
            <span className="board-label text-rail-soft">Operations</span>
          </div>

          <div className="p-5">
            <h1 className="text-lg font-bold tracking-[-0.015em] text-ink">Sign in</h1>
            <p className="mt-1 text-13 leading-relaxed text-ink-soft">
              Platform health, account controls, school operations, and report triage.
              Platform admins only.
            </p>

            {reason ? (
              <p
                role="status"
                className="mt-4 flex items-start gap-1.5 rounded-md border border-rule bg-board px-2.5 py-2 text-13 leading-relaxed text-ink-soft"
              >
                <Info className="mt-0.5 size-3.5 shrink-0 text-violet" aria-hidden />
                {reason}
              </p>
            ) : null}

            <div className="mt-5">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* No signup, no password reset, no Google. There is nothing this screen
            could offer someone without an account, and offering it anyway would
            be an invitation to try. */}
        <p className="mt-5 text-note leading-relaxed text-ink-faint">
          Access is granted from the backend command line, not from this screen.
          Ask whoever holds the database credential.
        </p>
      </div>
    </main>
  );
}
