import Link from "next/link";

import { DispositionMark, DISPOSITION_TONE } from "@/components/ui/Disposition";
import { caseIdent } from "@/lib/case-ident";
import { shortAgo, fullTimestamp } from "@/lib/datetime";
import { KIND_LABEL, type Report } from "@/lib/reports/schemas";
import { cn } from "@/lib/utils";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * One case, as a tile on the board.
 *
 * A one-pixel status trace and the mark beside the ident carry the same state,
 * so the row stays quick to scan without turning status color into decoration.
 *
 * Three lines, in the order an operator triages by: what it is and how old,
 * what the person said, and who said it. The ident leads because it is the
 * handle — the thing referred to in a commit message or a message to a
 * colleague — and it lines up down the column because it is fixed-width.
 */
export function CaseRow({
  report,
  params,
  active,
}: {
  report: Report;
  params: DocketParams;
  active: boolean;
}) {
  const reporter = report.reporter;

  return (
    <Link
      href={docketHref(params, { reportId: report.id, page: params.page })}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative block py-2.5 pl-4 pr-3 transition-colors duration-160",
        "focus-visible:outline-offset-[-2px]",
        active ? "bg-pen-wash" : "hover:bg-panel-sunk",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-px",
          DISPOSITION_TONE[report.status].carrier,
        )}
      />

      <div className="flex items-center gap-2">
        <DispositionMark status={report.status} />
        <span className={cn("ident text-13 text-t1", active && "font-bold")}>
          {caseIdent(report.id)}
        </span>
        <span className="text-note text-t3">{KIND_LABEL[report.kind]}</span>
        <time
          dateTime={new Date(report.createdAt).toISOString()}
          title={fullTimestamp(report.createdAt)}
          className="ml-auto shrink-0 text-note tabular-nums text-t3"
        >
          {shortAgo(report.createdAt)}
        </time>
      </div>

      {/* The reporter's words, clamped. Set in the board's own sans rather than
          the serif: at two lines in a scanning column this is a label, and the
          serif is reserved for the case file where the words are actually read. */}
      <p className="mt-1 line-clamp-2 text-13 leading-snug text-t2">{report.message}</p>

      {reporter ? (
        <p className="mt-1.5 flex items-center gap-1.5 truncate text-note text-t3">
          <span className="truncate">{reporter.fullName}</span>
          {report.schoolRole ? (
            <span className="label shrink-0 rounded-sm bg-panel-sunk px-1 text-t3">
              {report.schoolRole}
            </span>
          ) : null}
        </p>
      ) : (
        // The tile survives its reporter: IssueReport.userId is nullable so a
        // deleted account does not take its bug reports with it.
        <p className="mt-1.5 text-note italic text-t3">Account deleted</p>
      )}
    </Link>
  );
}
