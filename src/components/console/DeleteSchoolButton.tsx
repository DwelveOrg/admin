"use client";

import { useActionState } from "react";

import { deleteSchoolAction, type PlatformActionState } from "@/lib/platform/actions";

export function DeleteSchoolButton({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const [state, action, pending] = useActionState<PlatformActionState, FormData>(
    deleteSchoolAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="schoolId" value={schoolId} />
      <button
        type="submit"
        disabled={pending}
        onClick={(event) => {
          if (
            !window.confirm(
              `Delete ${schoolName}? The school, memberships, classes, and pending access will be deactivated.`,
            )
          ) {
            event.preventDefault();
          }
        }}
        className="h-8 cursor-pointer rounded-md border border-rule px-3 text-13 font-medium text-danger hover:bg-danger-wash disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete school"}
      </button>
      {state.error ? (
        <span role="alert" className="max-w-52 text-right text-2xs leading-snug text-danger">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
