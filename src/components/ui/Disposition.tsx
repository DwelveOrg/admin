import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ReportStatus } from "@/lib/reports/schemas";

/**
 * The colour each disposition is known by, used identically in the rail, the
 * tile and the case file. One map so a status cannot mean amber in one place
 * and teal in another.
 */
export const DISPOSITION_TONE: Record<
  ReportStatus,
  { ink: string; wash: string; carrier: string; chip: string }
> = {
  OPEN: {
    ink: "text-open",
    wash: "bg-open-wash",
    carrier: "bg-open",
    chip: "bg-open-wash text-open",
  },
  IN_REVIEW: {
    ink: "text-review",
    wash: "bg-review-wash",
    carrier: "bg-review",
    chip: "bg-review-wash text-review",
  },
  RESOLVED: {
    ink: "text-resolved",
    wash: "bg-resolved-wash",
    carrier: "bg-resolved",
    chip: "bg-resolved-wash text-resolved",
  },
  DISMISSED: {
    ink: "text-dismissed",
    wash: "bg-dismissed-wash",
    carrier: "bg-dismissed",
    chip: "bg-dismissed-wash text-dismissed",
  },
};

/**
 * The acuity mark.
 *
 * Four silhouettes, not four colours: a solid block for work not started, a
 * half-filled block for work in hand, a check for a fix, a strike for a
 * dismissal. Colour says the same thing a second time, which is the point —
 * the board still reads correctly in greyscale, on a projector, and to an
 * operator who cannot separate amber from green. Nothing on this screen carries
 * its state in hue alone.
 *
 * Drawn rather than borrowed: at 12px a library icon set has no glyph that
 * means "half done" without also meaning something else.
 */
export function DispositionMark({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("size-3 shrink-0", DISPOSITION_TONE[status].ink, className)}
      aria-hidden
      focusable="false"
    >
      {status === "OPEN" ? (
        <rect x="1.5" y="1.5" width="9" height="9" rx="1" fill="currentColor" />
      ) : null}

      {status === "IN_REVIEW" ? (
        <>
          <rect
            x="2"
            y="2"
            width="8"
            height="8"
            rx="0.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M6 2.8h3.2v6.4H6z" fill="currentColor" />
        </>
      ) : null}

      {status === "RESOLVED" ? (
        <path
          d="M1.9 6.4 4.6 9.1 10.1 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {status === "DISMISSED" ? (
        <path
          d="M2.6 2.6 9.4 9.4M9.4 2.6 2.6 9.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
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
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-note font-semibold",
        DISPOSITION_TONE[status].chip,
        className,
      )}
    >
      <DispositionMark status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}
