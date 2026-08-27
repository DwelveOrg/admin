import { cn } from "@/lib/utils";

/** The platform topology reduced to four connected record nodes. */
export function Sigil({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-pen text-pen-ink shadow-lift-pen",
        compact ? "size-8" : "size-9",
      )}
    >
      <svg viewBox="0 0 20 20" className="size-4.5" focusable="false">
        <path d="M4 5.5h5.5v4H16M9.5 9.5v5H16" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="4" cy="5.5" r="1.6" fill="currentColor" />
        <circle cx="9.5" cy="9.5" r="1.6" fill="currentColor" />
        <circle cx="16" cy="9.5" r="1.6" fill="currentColor" />
        <circle cx="16" cy="14.5" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}
