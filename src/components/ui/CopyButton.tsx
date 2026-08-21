"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Copies a value that is meant to leave this screen — the full report UUID, a
 * reporter's email, the page URL a bug was filed from. These are pasted into
 * commits, queries and messages, so retyping them by eye is both slow and a
 * source of wrong answers.
 */
export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => setCopied(true))
          .catch(() => setCopied(false));
      }}
      className={cn(
        "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm",
        "text-ink-faint transition-colors duration-150 hover:bg-wash hover:text-ink",
        "active:translate-y-px",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-resolved" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
    </button>
  );
}
