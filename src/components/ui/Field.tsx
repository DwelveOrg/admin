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
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="label block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-13 text-danger">{error}</p>
      ) : hint ? (
        <p className="text-note leading-relaxed text-t3">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * One control vocabulary across the whole console.
 *
 * A field is a recess, not a raised surface — it is the one place on the screen
 * you put something *into*, and the darker ground says so before any border
 * does. Focus adds a violet edge and an outside ring, so it is visible without
 * relying on a color swap alone.
 */
const CONTROL = cn(
  "w-full rounded-md border border-edge bg-panel-sunk px-3 text-13 text-t1",
  "placeholder:text-t3",
  "transition-[border-color,box-shadow,background-color] duration-160",
  "hover:border-edge-lit",
  "focus:border-pen focus:bg-panel-sunk focus:outline-none",
  "focus:shadow-focus-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[0_0_0_3px_var(--danger-wash)]",
);

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-9.5", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select className={cn(CONTROL, "h-9.5 cursor-pointer pr-9", className)} {...props} />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "py-2.5 leading-relaxed", className)} {...props} />;
}
