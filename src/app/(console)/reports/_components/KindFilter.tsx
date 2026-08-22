import Link from "next/link";

import { cn } from "@/lib/utils";
import { KIND_LABEL, REPORT_KINDS } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * Bug / Feedback / Question.
 *
 * Secondary to disposition and shaped that way: a row of small chips rather than
 * a second set of columns, because "what kind of thing is this" is a narrowing
 * an operator reaches for occasionally, while "what still needs doing" is the
 * question they open the board with.
 */
export function KindFilter({ params }: { params: DocketParams }) {
  return (
    <div className="flex flex-wrap gap-1">
      {REPORT_KINDS.map((kind) => {
        const active = params.kind === kind;

        return (
          <Link
            key={kind}
            // Clicking the active chip clears it — a filter you cannot turn off
            // from where you turned it on is a trap.
            href={docketHref(params, { kind: active ? undefined : kind, reportId: null })}
            aria-pressed={active}
            className={cn(
              "rounded-md border px-2 py-1 text-note font-medium transition-colors duration-160",
              active
                ? "border-pen bg-pen-wash text-pen"
                : "border-edge bg-panel-solid text-t2 hover:bg-panel-sunk hover:text-t1",
            )}
          >
            {KIND_LABEL[kind]}
          </Link>
        );
      })}
    </div>
  );
}
