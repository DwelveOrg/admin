"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import { setStudentAccessAction, type PlatformActionState } from "@/lib/platform/actions";

/**
 * Blocking or restoring a student account, confirmed in place.
 *
 * Blocking asks; restoring does not. Restoring gives access back and is undone
 * by blocking again, so a confirmation there would be friction with nothing on
 * the other side of it. Blocking signs someone out of every Dwelve school at
 * once, which is worth one deliberate second step — stated in the console's own
 * words rather than in an OS dialog that cannot say it.
 */
export function StudentAccessButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const [state, action, pending] = useActionState<PlatformActionState, FormData>(
    setStudentAccessAction,
    {},
  );
  const [confirming, setConfirming] = useState(false);

  // Restoring access: one step.
  if (blocked) {
    return (
      <form action={action} className="flex flex-col items-end gap-1">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="blocked" value="false" />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Restoring…" : "Restore access"}
        </Button>
        {state.error ? <ActionError message={state.error} /> : null}
      </form>
    );
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button type="button" size="sm" variant="danger" onClick={() => setConfirming(true)}>
          Block account
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
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="blocked" value="true" />
      <p className="w-full text-note leading-relaxed text-ink-soft">
        Block this account? They are signed out of every Dwelve school
        immediately and cannot sign back in until access is restored.
      </p>
      <div className="flex items-center gap-1.5">
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" variant="danger" disabled={pending} autoFocus>
          {pending ? "Blocking…" : "Block account"}
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
