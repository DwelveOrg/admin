import { cn } from "@/lib/utils";
import { STATUS_LABEL, type ReportStatus } from "@/lib/reports/schemas";

/**
 * The colour each disposition is known by, used identically in the rail, the
 * case row and the case file. One map, so a status cannot mean amber in one
 * place and cyan in another.
 *
 * `carrier` is the one-pixel status trace on a case row. The mark and text name
 * the same state, so color is never the only channel.
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
 * The CSS colour each disposition resolves to, for contexts a utility class
 * cannot reach — SVG fills and Recharts palettes. Derived from the same
 * `--open/--review/--resolved/--dismissed` tokens the tone map styles with,
 * so a chart and its legend row cannot disagree.
 */
export const DISPOSITION_COLOR: Record<ReportStatus, string> = {
  OPEN: "var(--open)",
  IN_REVIEW: "var(--review)",
  RESOLVED: "var(--resolved)",
  DISMISSED: "var(--dismissed)",
};

/**
 * The acuity mark.
 *
 * Four silhouettes, not four colours: a solid block for work not started, a
 * half-filled block for work in hand, a check for a fix, a strike for a
 * dismissal. Colour says the same thing a second time, which is the point — the
 * console still reads correctly in greyscale, on a projector, and to an operator
 * who cannot separate amber from green. Nothing here carries its state in hue
 * alone, and that survived the redesign because it was never a stylistic choice.
 *
 * Drawn rather than borrowed: at 12px no icon set has a glyph meaning "half
 * done" that does not also mean something else.
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
        <rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="currentColor" />
      ) : null}

      {status === "IN_REVIEW" ? (
        <>
          <rect
            x="2"
            y="2"
            width="8"
            height="8"
            rx="1.75"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M6 2.8h2.1a1.1 1.1 0 0 1 1.1 1.1v4.2a1.1 1.1 0 0 1-1.1 1.1H6z" fill="currentColor" />
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

/** The named badge, for a header where there is room to say it. */
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
        "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-note font-medium",
        DISPOSITION_TONE[status].chip,
        className,
      )}
    >
      <DispositionMark status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}
