"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { deleteSchoolAction, type PlatformActionState } from "@/lib/platform/actions";

/**
 * Deactivating a school, confirmed in place.
 *
 * This used to raise `window.confirm`. An OS dialog is the one surface on this
 * board nobody designed — it cannot carry the sentence that matters (what else
 * gets deactivated along with the school), it looks like a browser warning
 * rather than a decision the operator is making, and it blocks the page while
 * it is up. The inline second step says more, in the console's own voice, and
 * is dismissible with Escape or by clicking away from it.
 *
 * The control names what it does: the backend deactivates the school and its
 * memberships rather than deleting rows, which is also what the schools table
 * reports afterwards.
 */
export function DeleteSchoolButton({
  schoolId,
  schoolName,
}: {
  schoolId: string;
  schoolName: string;
}) {
  const [state, action, pending] = useActionState<PlatformActionState, FormData>(
    deleteSchoolAction,
    {},
  );
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button type="button" size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Deactivate
        </Button>
        {state.error ? <ActionError message={state.error} /> : null}
      </div>
    );
  }

  return (
    <form
      action={action}
      onKeyDown={(event) => {
        if (event.key === "Escape") setConfirming(false);
      }}
      className="ml-auto flex w-full max-w-[280px] flex-col items-end gap-2 rounded-md border border-danger/40 bg-danger-wash p-2.5 text-left shadow-lift-1"
    >
      <input type="hidden" name="schoolId" value={schoolId} />
      <p className="w-full text-note leading-relaxed text-ink-soft">
        Deactivate <strong className="font-semibold text-ink">{schoolName}</strong>? Its
        memberships, classes and pending access are deactivated with it.
      </p>
      <div className="flex items-center gap-1.5">
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" variant="danger" disabled={pending} autoFocus>
          {pending ? "Deactivating…" : "Deactivate"}
        </Button>
      </div>
    </form>
  );
}

function ActionError({ message }: { message: string }) {
  return (
    <span role="alert" className="max-w-52 text-right text-note leading-snug text-danger">
      {message}
    </span>
  );
}
