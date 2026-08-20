import { Search } from "lucide-react";
import Link from "next/link";

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
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={searchPlaceholder}
          className="h-9.5 w-full rounded-md border border-rule bg-file pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-violet focus:outline-none"
        />
      </label>
      <select
        name="status"
        defaultValue={status ?? ""}
        aria-label="Filter by status"
        className="h-9.5 rounded-md border border-rule bg-file px-3 text-sm text-ink focus:border-violet focus:outline-none"
      >
        <option value="">Every status</option>
        {statuses.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-9.5 cursor-pointer rounded-md bg-violet px-4 text-sm font-medium text-violet-ink hover:bg-violet-hover"
      >
        Search
      </button>
      {filtered ? (
        <Link
          href={pathname}
          className="inline-flex h-9.5 items-center justify-center rounded-md px-3 text-sm text-ink-soft hover:bg-wash"
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}
