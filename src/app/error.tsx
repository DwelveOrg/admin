"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

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
      <div className="max-w-[44ch]">
        <span
          aria-hidden
          className="mx-auto flex size-10 items-center justify-center rounded-md border border-rule bg-tile text-danger shadow-lift-1"
        >
          <TriangleAlert className="size-4" />
        </span>

        <h1 className="mt-3 text-lg font-bold tracking-[-0.015em] text-ink">
          The board could not load that
        </h1>
        <p className="mt-1.5 text-13 leading-relaxed text-ink-soft">
          Usually the Dwelve API is unreachable, or this account no longer holds
          platform admin. Retrying answers the first; signing out and back in
          answers the second.
        </p>

        {error.digest ? (
          <p className="machine mt-3 text-note">digest {error.digest}</p>
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
