import Link from "next/link";

import { cn } from "@/lib/utils";
import { DispositionMark } from "@/components/ui/Disposition";
import { REPORT_STATUSES, STATUS_LABEL, type ReportStatus } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * The four columns of the board, and how much is standing in each.
 *
 * This is the app's only navigation, and it is navigation *and* status at once:
 * an operator opening the console wants "how much is waiting" answered before
 * they read a single report, so the counts are set to be seen rather than
 * looked up. The counts come from the backend unscoped by the selected status,
 * so picking Open does not zero the other three and hide the work still to do.
 */
export function StatusRail({
  params,
  counts,
  total,
}: {
  params: DocketParams;
  counts: Partial<Record<ReportStatus, number>>;
  total: number;
}) {
  return (
    <nav aria-label="Filter by disposition">
      <Link
        href={docketHref(params, { status: undefined, reportId: null })}
        aria-current={!params.status ? "page" : undefined}
        className={cn(
          "mb-1.5 flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-13 transition-colors duration-160",
          !params.status
            ? "border-pen bg-pen-wash font-semibold text-t1"
            : "border-edge bg-panel-sunk text-t2 hover:border-edge-lit hover:text-t1",
        )}
      >
        <span className="flex-1 truncate">Everything</span>
        <span className="tabular-nums font-semibold text-t1">{total}</span>
      </Link>

      <div className="grid grid-cols-2 gap-1.5">
        {REPORT_STATUSES.map((status) => {
          const active = params.status === status;

          return (
            <Link
              key={status}
              href={docketHref(params, { status, reportId: null })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col gap-0.5 rounded-md border px-2.5 py-2 transition-colors duration-160",
                active
                  ? "border-pen bg-pen-wash"
                  : "border-edge bg-panel-sunk hover:border-edge-lit",
              )}
            >
              <span className="flex items-center gap-1.5">
                <DispositionMark status={status} />
                <span className="label truncate">{STATUS_LABEL[status]}</span>
              </span>
              {/* Zero is stated, not hidden: "Open 0" is the single most
                  reassuring thing this board can say, and an absent number
                  reads as unknown. */}
              <span className="figure text-17 leading-none">{counts[status] ?? 0}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
