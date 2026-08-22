import { cn } from "@/lib/utils";

type Tone = "ok" | "muted" | "danger";

const TONES: Record<Tone, string> = {
  ok: "bg-resolved-wash text-resolved",
  muted: "bg-dismissed-wash text-dismissed",
  danger: "bg-danger-wash text-danger",
};

/**
 * Account and tenant state, in the same shape-plus-colour grammar the
 * dispositions use: a check for live, a strike for stopped. The two tables
 * never show both stopped tones at once, so the strike is unambiguous within
 * either one, and neither table asks anyone to tell green from red to read it.
 */
export function StatusPill({
  tone,
  label,
  className,
}: {
  tone: Tone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-note font-medium",
        TONES[tone],
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3 shrink-0" aria-hidden focusable="false">
        {tone === "ok" ? (
          <path
            d="M1.9 6.4 4.6 9.1 10.1 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2.6 2.6 9.4 9.4M9.4 2.6 2.6 9.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
      {label}
    </span>
  );
}
