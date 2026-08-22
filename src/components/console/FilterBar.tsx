import { Search } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

export type FilterSelect = {
  name: string;
  value?: string;
  label: string;
  anyLabel: string;
  options: Array<{ value: string; label: string }>;
};

/**
 * Search and filters for a directory.
 *
 * A real form that submits to the route, so every result is a linkable URL an
 * operator can paste to a colleague — which is most of why this console exists
 * as pages rather than as a client-side app. Same control vocabulary
 * everywhere: the search box here and the one on the docket are the same object
 * at the same height.
 *
 * The page number is deliberately not carried through. Changing a filter and
 * landing on page 4 of a shorter result set is how a search appears to return
 * nothing.
 */
export function FilterBar({
  pathname,
  search,
  searchPlaceholder,
  selects = [],
}: {
  pathname: string;
  search?: string;
  searchPlaceholder: string;
  selects?: FilterSelect[];
}) {
  const filtered = Boolean(search || selects.some((select) => select.value));

  return (
    <form action={pathname} className="flex flex-col gap-2.5 lg:flex-row">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-t3"
          aria-hidden
        />
        <Input
          type="search"
          name="search"
          defaultValue={search}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </label>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {selects.map((select) => (
          <Select
            key={select.name}
            name={select.name}
            defaultValue={select.value ?? ""}
            aria-label={select.label}
            // The shared control is w-full; inside this row that would let the
            // selects eat the width and squeeze the search box to nothing.
            className="sm:w-auto sm:min-w-[10.5rem]"
          >
            <option value="">{select.anyLabel}</option>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ))}

        <div className="flex gap-2.5">
          <button type="submit" className={buttonClasses({ variant: "primary" })}>
            Search
          </button>

          {filtered ? (
            <Link href={pathname} className={buttonClasses({ variant: "ghost" })}>
              Clear
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}
