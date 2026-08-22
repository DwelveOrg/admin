import type { Metadata } from "next";
import { Info } from "lucide-react";

import { Aurora } from "@/components/ui/Aurora";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Dwelve Operations" };

/**
 * Why the operator is looking at this screen rather than the console.
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

/**
 * The door.
 *
 * The same room is already visible behind it — the aurora field runs here too,
 * so signing in is walking into somewhere you can already see rather than a
 * transition between two unrelated screens. It sits at its calm setting, because
 * nobody outside the session is owed a reading of the queue.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const reasonParam = (await searchParams).reason;
  const reason = REASONS[Array.isArray(reasonParam) ? reasonParam[0] : (reasonParam ?? "")];

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      <Aurora />

      <div className="w-full max-w-[420px]">
        <div className="glass-raised p-7">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-pen shadow-lift-pen"
            >
              <svg viewBox="0 0 20 20" className="size-4.5 text-pen-ink" focusable="false">
                <g fill="currentColor">
                  <rect x="2" y="12" width="3" height="6" rx="1.2" />
                  <rect x="7" y="8" width="3" height="10" rx="1.2" />
                  <rect x="12" y="5" width="3" height="13" rx="1.2" />
                  <rect x="17" y="2" width="1.6" height="16" rx="0.8" opacity="0.55" />
                </g>
              </svg>
            </span>
            <div>
              <p className="text-15 font-semibold tracking-[-0.01em] text-t1">Dwelve</p>
              <p className="label">Operations</p>
            </div>
          </div>

          <h1 className="display mt-7 text-figure text-t1">Sign in</h1>
          <p className="mt-2 text-13 leading-relaxed text-t2">
            Platform health, account controls, school operations, and report triage.
            Platform admins only.
          </p>

          {reason ? (
            <p
              role="status"
              className="mt-5 flex items-start gap-2 rounded-md border border-edge bg-panel-sunk px-3 py-2.5 text-13 leading-relaxed text-t2"
            >
              <Info className="mt-0.5 size-3.5 shrink-0 text-pen" aria-hidden />
              {reason}
            </p>
          ) : null}

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        {/* No signup, no password reset, no Google. There is nothing this screen
            could offer someone without an account, and offering it anyway would
            be an invitation to try. */}
        <p className="mt-5 px-1 text-note leading-relaxed text-t3">
          Access is granted from the backend command line, not from this screen. Ask
          whoever holds the database credential.
        </p>
      </div>
    </main>
  );
}
