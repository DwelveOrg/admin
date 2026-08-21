"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { docketHref, type DocketParams } from "../_lib/query";

/**
 * Free text over the report, the page it came from, and the reporter.
 *
 * Debounced into the URL rather than submitted: an operator looking for "the one
 * about the export button" types a few characters and watches the list narrow,
 * and making them press Enter to find out whether they guessed right turns one
 * gesture into three. The URL stays the source of truth so the result is
 * linkable and survives a reload.
 */
export function SearchField({ params }: { params: DocketParams }) {
  const router = useRouter();
  const value = params.search ?? "";
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // The URL can change underneath this field — the rail clears the search when a
  // disposition is picked, and Back restores a previous one. Without this the
  // box would keep showing a term that is no longer filtering anything.
  //
  // Adjusted during render rather than in an effect, which is what React
  // prescribes for state derived from a prop. A `key` would do it too, but the
  // URL value becomes the draft the instant the debounce fires, so remounting
  // would take the caret out of the box mid-word.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;

    const timer = setTimeout(() => {
      // `reportId: null` drops the open case: a search narrows the queue, and
      // keeping a case open that the new query may not even contain leaves the
      // two panes disagreeing about what is being looked at.
      startTransition(() =>
        router.push(docketHref(params, { search: draft || undefined, reportId: null })),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [draft, value, params, router]);

  return (
    <div className="relative">
      <Search
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 transition-colors",
          pending ? "text-violet" : "text-ink-faint",
        )}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search reports"
        aria-label="Search reports by message, page, or reporter"
        className={cn(
          "h-9 w-full rounded-md border border-rule bg-tile pl-8 pr-8 text-13 text-ink",
          "placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150",
          "hover:border-ink-faint focus:border-violet focus:outline-none focus:ring-2 focus:ring-ring/35",
          // Safari draws its own clear affordance, which would sit under ours.
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      {draft ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft("");
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-ink-faint transition-colors duration-150 hover:bg-wash hover:text-ink"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
