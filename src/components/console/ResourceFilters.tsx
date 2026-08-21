import { Search } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

/**
 * Search and status for the two platform tables.
 *
 * A real form that submits to the route, so the result is a linkable URL an
 * operator can paste to a colleague. Same control vocabulary as everywhere else
 * on the board — the search box here and the one on the docket are the same
 * object at the same height.
 */
export function ResourceFilters({
  pathname,
  search,
  status,
  searchPlaceholder,
  statuses,
}: {
  pathname: string;
  search?: string;
  status?: string;
  searchPlaceholder: string;
  statuses: Array<{ value: string; label: string }>;
}) {
  const filtered = Boolean(search || status);

  return (
    <form action={pathname} className="flex flex-col gap-2 sm:flex-row">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <Input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={searchPlaceholder}
          className="pl-8"
        />
      </label>

      <Select
        name="status"
        defaultValue={status ?? ""}
        aria-label="Filter by status"
        // The shared control is w-full; inside this flex row that makes the
        // select eat the whole width and squeeze the search box to nothing.
        className="sm:w-auto sm:min-w-44"
      >
        <option value="">Every status</option>
        {statuses.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <button type="submit" className={buttonClasses({ variant: "solid" })}>
        Search
      </button>

      {filtered ? (
        <Link href={pathname} className={buttonClasses({ variant: "ghost" })}>
          Clear
        </Link>
      ) : null}
    </form>
  );
}
