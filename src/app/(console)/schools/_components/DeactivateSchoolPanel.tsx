"use client";

import { AlertTriangle, RotateCw, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { PanelWell } from "@/components/ui/Panel";
import { deleteSchoolAction } from "@/lib/platform/actions";

/**
 * Ending a school.
 *
 * The most destructive thing this console can do, and the only action here
 * guarded by typing the name. That is not ceremony: every other action on the
 * platform affects one account and is reversible from the same screen, while
 * this one closes every membership in a tenant at once and there is no button
 * here that undoes it. Typing the name is what makes it impossible to do by
 * reflex from a list of similar-looking rows.
 *
 * `window.confirm` would be the cheap version and is wrong twice over: it
 * cannot state what the cleanup does, and it looks identical to the browser's
 * own warnings, which people dismiss without reading.
 */
export function DeactivateSchoolPanel({
  schoolId,
  schoolName,
  isActive,
  memberCount,
}: {
  schoolId: string;
  schoolName: string;
  isActive: boolean;
  memberCount: number;
}) {
  const [state, formAction, pending] = useActionState(deleteSchoolAction, {});
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const matches = typed.trim() === schoolName.trim();

  if (!isActive) {
    return (
      <section className="glass p-5" aria-labelledby="deactivate-heading">
        <h2 id="deactivate-heading" className="text-15 font-semibold text-t1">
          Already deactivated
        </h2>
        <p className="mt-2 text-13 leading-relaxed text-t2">
          This school is closed. Its memberships have been ended and nobody can reach it
          in the product. Its records are kept, so the history above is still readable.
        </p>
      </section>
    );
  }

  return (
    <section className="glass overflow-hidden" aria-labelledby="deactivate-heading">
      <div className="flex items-center gap-2.5 border-b border-edge px-5 py-4">
        <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden />
        <h2 id="deactivate-heading" className="text-15 font-semibold text-t1">
          Deactivate school
        </h2>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-13 leading-relaxed text-t2">
          Closes the school and ends{" "}
          <strong className="font-semibold text-t1">
            all {memberCount.toLocaleString()}{" "}
            {memberCount === 1 ? "membership" : "memberships"}
          </strong>
          . Everyone in it loses access to its classes and tests. Accounts themselves are
          not deleted, and nobody is blocked from the platform.
        </p>

        {confirming ? (
          <form action={formAction}>
            <input type="hidden" name="schoolId" value={schoolId} />
            <PanelWell className="space-y-3">
              <label htmlFor="confirm-name" className="block text-13 leading-relaxed text-t1">
                Type <strong className="font-semibold">{schoolName}</strong> to confirm.
              </label>
              <Input
                id="confirm-name"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                placeholder={schoolName}
                autoComplete="off"
                aria-describedby="confirm-hint"
              />
              <p id="confirm-hint" className="text-note text-t3">
                There is no undo for this on the console.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={!matches || pending}
                >
                  {pending ? (
                    <>
                      <RotateCw className="size-3.5 animate-spin" aria-hidden />
                      Deactivating
                    </>
                  ) : (
                    "Deactivate school"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirming(false);
                    setTyped("");
                  }}
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
            variant="danger"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Deactivate school
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
