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
      <label htmlFor={htmlFor} className="field-label block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-13 text-danger">{error}</p>
      ) : hint ? (
        <p className="text-2xs leading-relaxed text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

const CONTROL =
  "w-full rounded-md border border-rule bg-file px-3 text-sm text-ink placeholder:text-ink-faint " +
  "transition-colors focus:border-violet focus:outline-none focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(CONTROL, "h-9.5", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "py-2.5 leading-relaxed", className)} {...props} />;
}
