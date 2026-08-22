"use client";

import { Info } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { DISPOSITION_TONE, DispositionMark } from "@/components/ui/Disposition";
import { Textarea } from "@/components/ui/Field";
import { saveDecisionAction, type DecisionState } from "@/lib/reports/actions";
import {
  REPORT_STATUSES,
  RESOLUTION_NOTE_MAX,
  STATUS_LABEL,
  TERMINAL_STATUSES,
  type Report,
  type ReportStatus,
} from "@/lib/reports/schemas";
import { cn } from "@/lib/utils";

/**
 * Where a case is decided — the act of moving the tile to another column.
 *
 * The disposition and the note are one submission, not two, because they are one
 * decision: "resolved, and here is what we did" is the whole answer, and letting
 * them be saved separately means a status can land without its explanation.
 *
 * The notice under the note is the most important sentence on this screen. The
 * note is delivered to the person who filed the report the moment the status
 * becomes Resolved or Dismissed. An operator writing "dupe of the other one" in
 * a box they believed was internal would be a failure of this interface, not of
 * their judgement.
 *
 * Callers must key this on the report id. Moving between cases has to discard
 * the previous one's unsaved decision rather than carry it across — and a
 * remount says that far more plainly than an effect resetting four fields.
 */
export function DecisionForm({ report }: { report: Report }) {
  const [state, formAction] = useActionState<DecisionState, FormData>(saveDecisionAction, {});
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState(report.resolutionNote ?? "");

  const closing = TERMINAL_STATUSES.includes(status);
  const alreadyClosed = TERMINAL_STATUSES.includes(report.status);
  const dirty = status !== report.status || note !== (report.resolutionNote ?? "");
  const remaining = RESOLUTION_NOTE_MAX - note.length;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reportId" value={report.id} />
      <input type="hidden" name="status" value={status} />

      <fieldset>
        <legend className="label mb-2">Disposition</legend>
        <div className="flex flex-wrap gap-1.5">
          {REPORT_STATUSES.map((option) => {
            const selected = status === option;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => setStatus(option)}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-13 font-medium",
                  "transition-colors duration-160 active:translate-y-px",
                  selected
                    ? cn("border-transparent", DISPOSITION_TONE[option].chip)
                    : "border-edge bg-panel-solid text-t2 hover:bg-panel-sunk hover:text-t1",
                )}
              >
                <DispositionMark status={option} />
                {STATUS_LABEL[option]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="resolutionNote" className="label block">
            What we did
          </label>
          <span
            className={cn(
              "text-note tabular-nums",
              remaining < 40 ? "text-danger" : "text-t3",
            )}
          >
            {remaining} left
          </span>
        </div>
        <Textarea
          id="resolutionNote"
          name="resolutionNote"
          value={note}
          maxLength={RESOLUTION_NOTE_MAX}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Roster query missed pending rows. Fixed and shipped."
          className="min-h-[92px]"
        />

        {closing ? (
          <p className="flex items-start gap-1.5 text-note leading-relaxed text-t2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-pen" aria-hidden />
            <span>
              {alreadyClosed ? (
                <>
                  This case is already closed, so saving again will{" "}
                  <strong className="font-semibold">not</strong> notify the
                  reporter a second time.
                </>
              ) : (
                <>
                  Saving notifies{" "}
                  {report.reporter ? (
                    <strong className="font-semibold">{report.reporter.fullName}</strong>
                  ) : (
                    "the reporter"
                  )}
                  . They will read this note.
                </>
              )}
            </span>
          </p>
        ) : (
          <p className="text-note leading-relaxed text-t3">
            Nobody is notified until the case is resolved or dismissed.
          </p>
        )}
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger-wash px-3 py-2 text-13 text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <SaveButton dirty={dirty} />
        {state.savedAt && !dirty ? (
          <span role="status" className="flex items-center gap-1.5 text-13 text-resolved">
            <DispositionMark status="RESOLVED" />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}

function SaveButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending || !dirty}>
      {pending ? "Saving…" : "Save decision"}
    </Button>
  );
}
