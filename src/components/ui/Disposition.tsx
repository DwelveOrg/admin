import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ReportStatus } from "@/lib/reports/schemas";

/**
 * The colour each disposition is known by, used identically in the rail, the row
 * and the case file. One map so a status cannot mean amber in one place and
 * cyan in another.
 */
export const DISPOSITION_TONE: Record<ReportStatus, { dot: string; chip: string }> = {
  OPEN: { dot: "bg-open", chip: "bg-open-wash text-open" },
  IN_REVIEW: { dot: "bg-review", chip: "bg-review-wash text-review" },
  RESOLVED: { dot: "bg-resolved", chip: "bg-resolved-wash text-resolved" },
  DISMISSED: { dot: "bg-dismissed", chip: "bg-dismissed-wash text-dismissed" },
};

/** A filled dot. Enough to scan a column of forty rows by. */
export function DispositionDot({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 shrink-0 rounded-full", DISPOSITION_TONE[status].dot, className)}
    />
  );
}

/** The named badge, for the case file header where there is room to say it. */
export function DispositionChip({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold",
        DISPOSITION_TONE[status].chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DISPOSITION_TONE[status].dot)} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
