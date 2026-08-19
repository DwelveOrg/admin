"use client";

import { useEffect } from "react";

import { Button, buttonClasses } from "@/components/ui/Button";

/**
 * The console's failure screen.
 *
 * It names the two things that actually go wrong here — the API being
 * unreachable, and the account having lost its platform admin role — because a
 * bare "something went wrong" in an operator tool sends someone to read logs for
 * a problem they could have fixed by signing in again.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Operator console error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-[400px]">
        <p className="field-label mb-2">Error</p>
        <h1 className="text-lg font-semibold text-ink">The console could not load that</h1>
        <p className="mt-1.5 text-13 leading-relaxed text-ink-soft">
          Usually the Dwelve API is unreachable, or this account no longer holds
          platform admin. Retrying answers the first; signing out and back in
          answers the second.
        </p>

        {error.digest ? (
          <p className="machine mt-3 text-2xs">digest {error.digest}</p>
        ) : null}

        <div className="mt-5 flex items-center justify-center gap-2">
          <Button type="button" variant="solid" onClick={reset}>
            Try again
          </Button>
          <a href="/login" className={buttonClasses()}>
            Sign in again
          </a>
        </div>
      </div>
    </main>
  );
}
