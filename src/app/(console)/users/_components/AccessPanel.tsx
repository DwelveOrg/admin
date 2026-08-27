"use client";

import { AlertTriangle, RotateCw, ShieldBan, ShieldCheck } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { PanelWell } from "@/components/ui/Panel";
import { setUserAccessAction } from "@/lib/platform/actions";

/**
 * Blocking an account, and giving it back.
 *
 * Confirmed inline, in the console's own words, rather than by `window.confirm`
 * — that dialog is the one surface here nobody designed, it cannot say what a
 * block actually does, and it looks identical to the browser's own warnings.
 *
 * A platform admin cannot be blocked from this screen at all. That guard is
 * repeated in the backend service; this is the version of it the operator can
 * read, so the button is absent with a reason rather than present and failing.
 */
export function AccessPanel({
  userId,
  fullName,
  isActive,
  isOperator,
  schoolCount,
}: {
  userId: string;
  fullName: string;
  isActive: boolean;
  isOperator: boolean;
  schoolCount: number;
}) {
  const [state, formAction, pending] = useActionState(setUserAccessAction, {});
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="surface overflow-hidden" aria-labelledby="access-heading">
      <div className="flex items-center gap-2.5 border-b border-edge px-5 py-4">
        {isActive ? (
          <ShieldCheck className="size-4 shrink-0 text-resolved" aria-hidden />
        ) : (
          <ShieldBan className="size-4 shrink-0 text-danger" aria-hidden />
        )}
        <h2 id="access-heading" className="text-15 font-semibold text-t1">
          Access
        </h2>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-13 leading-relaxed text-t2">
          {isActive
            ? `This account can sign in and use Dwelve in ${schoolCount === 1 ? "its school" : `all ${schoolCount} of its schools`}.`
            : "This account is blocked. It cannot sign in anywhere on the platform, and its memberships are untouched."}
        </p>

        {isOperator ? (
          <PanelWell className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-t3" aria-hidden />
            <p className="text-13 leading-relaxed text-t2">
              This account is a platform admin and cannot be blocked from here. Revoke
              the role first with{" "}
              <code className="machine text-t1">npm run admin:grant -- --revoke</code>.
            </p>
          </PanelWell>
        ) : confirming ? (
          <form action={formAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="blocked" value={isActive ? "true" : "false"} />
            <PanelWell className="space-y-3">
              <p className="text-13 leading-relaxed text-t1">
                {isActive ? (
                  <>
                    Block <strong>{fullName}</strong> across every school?
                  </>
                ) : (
                  <>
                    Restore access for <strong>{fullName}</strong>?
                  </>
                )}
              </p>
              <p className="text-13 leading-relaxed text-t2">
                {isActive
                  ? "They are signed out and cannot sign back in. Nothing they created is deleted, and you can restore them here at any time."
                  : "They can sign in again immediately, with the memberships they had before."}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="submit"
                  variant={isActive ? "danger" : "primary"}
                  size="sm"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <RotateCw className="size-3.5 animate-spin" aria-hidden />
                      Saving
                    </>
                  ) : isActive ? (
                    "Block everywhere"
                  ) : (
                    "Restore access"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
              </div>
            </PanelWell>
          </form>
        ) : (
          <Button
            type="button"
            variant={isActive ? "danger" : "primary"}
            size="sm"
            onClick={() => setConfirming(true)}
          >
            {isActive ? (
              <>
                <ShieldBan className="size-3.5" aria-hidden />
                Block everywhere
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5" aria-hidden />
                Restore access
              </>
            )}
          </Button>
        )}

        {state.error ? (
          <p role="alert" className="text-13 text-danger">
            {state.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
