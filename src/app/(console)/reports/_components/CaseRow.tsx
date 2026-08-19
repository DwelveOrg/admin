import Link from "next/link";

import { DispositionDot } from "@/components/ui/Disposition";
import { caseIdent } from "@/lib/case-ident";
import { shortAgo, fullTimestamp } from "@/lib/datetime";
import { KIND_LABEL, type Report } from "@/lib/reports/schemas";
import { cn } from "@/lib/utils";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * One case on the docket sheet.
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
        "block border-l-2 px-3 py-2.5 transition-colors",
        active
          ? "border-l-violet bg-violet-wash/60"
          : "border-l-transparent hover:bg-wash",
      )}
    >
      <div className="flex items-center gap-2">
        <DispositionDot status={report.status} />
        <span className="ident text-13 text-ink">{caseIdent(report.id)}</span>
        <span className="text-2xs text-ink-faint">{KIND_LABEL[report.kind]}</span>
        <time
          dateTime={new Date(report.createdAt).toISOString()}
          title={fullTimestamp(report.createdAt)}
          className="ml-auto shrink-0 text-2xs tabular-nums text-ink-faint"
        >
          {shortAgo(report.createdAt)}
        </time>
      </div>

      {/* The reporter's words, clamped. Set in the console's sans rather than
          the serif: at two lines in a scanning column this is a label, and the
          serif is reserved for the case file where the words are actually read. */}
      <p className="mt-1 line-clamp-2 text-13 leading-snug text-ink-soft">{report.message}</p>

      {reporter ? (
        <p className="mt-1 flex items-center gap-1.5 truncate text-2xs text-ink-faint">
          <span className="truncate">{reporter.fullName}</span>
          {report.schoolRole ? (
            <span className="shrink-0 rounded bg-wash px-1 py-px font-medium uppercase tracking-wide">
              {report.schoolRole}
            </span>
          ) : null}
        </p>
      ) : (
        // The row survives its reporter: IssueReport.userId is nullable so a
        // deleted account does not take its bug reports with it.
        <p className="mt-1 text-2xs italic text-ink-faint">Account deleted</p>
      )}
    </Link>
  );
}
