import Link from "next/link";

import { cn } from "@/lib/utils";
import { DISPOSITION_TONE } from "@/components/ui/Disposition";
import { REPORT_STATUSES, STATUS_LABEL, type ReportStatus } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * The four dispositions and how many cases sit in each.
 *
 * This is the app's only navigation, and it is navigation *and* status at once:
 * an operator opening the console wants "how much is waiting" answered before
 * they read a single report. The counts come from the backend unscoped by the
 * selected status, so picking "Open" does not zero the other three and hide the
 * work still to do.
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
    <nav aria-label="Filter by disposition" className="flex flex-col">
      <RailRow
        href={docketHref(params, { status: undefined, reportId: null })}
        active={!params.status}
        label="Everything"
        count={total}
      />
      {REPORT_STATUSES.map((status) => (
        <RailRow
          key={status}
          href={docketHref(params, { status, reportId: null })}
          active={params.status === status}
          label={STATUS_LABEL[status]}
          count={counts[status] ?? 0}
          dot={DISPOSITION_TONE[status].dot}
        />
      ))}
    </nav>
  );
}

function RailRow({
  href,
  active,
  label,
  count,
  dot,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  dot?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-13 transition-colors",
        active ? "bg-wash font-semibold text-ink" : "text-ink-soft hover:bg-wash hover:text-ink",
      )}
    >
      {dot ? (
        <span className={cn("size-1.5 shrink-0 rounded-full", dot)} aria-hidden />
      ) : (
        <span className="size-1.5 shrink-0" aria-hidden />
      )}
      <span className="truncate">{label}</span>
      {/* Zero is stated, not hidden: "Open 0" is the single most reassuring
          thing this screen can say, and an absent number reads as unknown. */}
      <span className={cn("ml-auto tabular-nums", active ? "text-ink" : "text-ink-faint")}>
        {count}
      </span>
    </Link>
  );
}
