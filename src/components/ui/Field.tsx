import * as React from "react";

import { cn } from "@/lib/utils";

/** A labelled control. The hint sits under the input, where it is read after it. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="board-label block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-13 text-danger">{error}</p>
      ) : hint ? (
        <p className="text-note leading-relaxed text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * One control vocabulary across the whole board.
 *
 * The focus treatment is a violet rule plus a ring rather than a colour swap —
 * a field that only changes its border colour is invisible to anyone who cannot
 * see the difference, and the ring is what the rest of the board uses.
 */
const CONTROL = cn(
  "w-full rounded-md border border-rule bg-tile px-2.5 text-13 text-ink",
  "placeholder:text-ink-faint",
  "transition-[border-color,box-shadow] duration-150",
  "hover:border-ink-faint",
  "focus:border-violet focus:outline-none focus:ring-2 focus:ring-ring/35",
  "disabled:cursor-not-allowed disabled:bg-wash disabled:opacity-70",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/30",
);

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-9", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(CONTROL, "h-9 cursor-pointer pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "py-2 leading-relaxed", className)} {...props} />;
}
