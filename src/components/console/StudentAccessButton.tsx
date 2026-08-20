"use client";

import { useActionState } from "react";

import {
  setStudentAccessAction,
  type PlatformActionState,
} from "@/lib/platform/actions";

export function StudentAccessButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const [state, action, pending] = useActionState<PlatformActionState, FormData>(
    setStudentAccessAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="blocked" value={String(!blocked)} />
      <button
        type="submit"
        disabled={pending}
        onClick={(event) => {
          if (
            !blocked &&
            !window.confirm(
              "Block this student account? They will be signed out of every Dwelve school.",
            )
          ) {
            event.preventDefault();
          }
        }}
        className={
          blocked
            ? "h-8 cursor-pointer rounded-md border border-rule px-3 text-13 font-medium text-ink hover:bg-wash disabled:opacity-50"
            : "h-8 cursor-pointer rounded-md border border-rule px-3 text-13 font-medium text-danger hover:bg-danger-wash disabled:opacity-50"
        }
      >
        {pending ? "Saving…" : blocked ? "Restore access" : "Block account"}
      </button>
      {state.error ? (
        <span role="alert" className="max-w-52 text-right text-2xs leading-snug text-danger">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
