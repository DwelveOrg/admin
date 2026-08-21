import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { DeleteSchoolButton } from "@/components/console/DeleteSchoolButton";
import { Pager } from "@/components/console/Pager";
import { ResourceFilters } from "@/components/console/ResourceFilters";
import { StatusPill } from "@/components/console/StatusPill";
import { listPlatformSchoolsRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";

export const metadata: Metadata = { title: "Schools · Dwelve Operations" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const search = first(raw.search)?.trim().slice(0, 200) || undefined;
  const rawStatus = first(raw.status);
  const status = rawStatus === "ACTIVE" || rawStatus === "DEACTIVATED" ? rawStatus : undefined;
  const page = positiveInt(first(raw.page));
  const list = await withConsoleAccess(() =>
    listPlatformSchoolsRequest({ search, status, page, limit: 25 }),
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 md:py-7">
        <header>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Schools</h1>
            <span className="text-13 tabular-nums text-ink-faint">
              {list.meta.total.toLocaleString()} matching
            </span>
          </div>
          <p className="mt-1 max-w-[62ch] text-13 leading-normal text-ink-soft">
            Find any school, read its footprint, and deactivate it with the full
            membership cleanup.
          </p>
        </header>

        <div className="tile mt-5 overflow-hidden">
          <div className="border-b border-rule bg-board p-3">
            <ResourceFilters
              pathname="/schools"
              search={search}
              status={status}
              searchPlaceholder="Search school, location, or owner"
              statuses={[
                { value: "ACTIVE", label: "Active schools" },
                { value: "DEACTIVATED", label: "Deactivated schools" },
              ]}
            />
          </div>

          {list.schools.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-rule bg-board">
                    <TableHead>School</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Footprint</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft">
                  {list.schools.map((school) => (
                    <tr
                      key={school.id}
                      className="align-middle transition-colors duration-150 hover:bg-board"
                    >
                      <td className="px-4 py-3">
                        <p className="max-w-64 truncate text-13 font-semibold text-ink">
                          {school.name}
                        </p>
                        <p className="mt-0.5 text-note text-ink-faint">
                          {[school.city, school.country].filter(Boolean).join(", ") ||
                            "Location not set"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {school.owner ? (
                          <div>
                            <p className="text-13 text-ink">{school.owner.fullName}</p>
                            <p className="mt-0.5 text-note text-ink-faint">
                              {school.owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-13 text-ink-faint">Owner unavailable</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Footprint counts={school.counts} />
                      </td>
                      <td className="px-4 py-3 text-13 tabular-nums text-ink-soft">
                        {formatDate(school.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          tone={school.isActive ? "ok" : "muted"}
                          label={school.isActive ? "Active" : "Deactivated"}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {school.isActive ? (
                          <DeleteSchoolButton
                            schoolId={school.id}
                            schoolName={school.name}
                          />
                        ) : (
                          <span className="text-note text-ink-faint">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pager pathname="/schools" params={{ search, status }} meta={list.meta} />
        </div>
      </div>
    </main>
  );
}

/** Three figures that get compared down the column, so they line up in one. */
function Footprint({ counts }: { counts: { members: number; classes: number; tests: number } }) {
  return (
    <dl className="flex items-baseline gap-3 text-13">
      {[
        { label: "members", value: counts.members },
        { label: "classes", value: counts.classes },
        { label: "tests", value: counts.tests },
      ].map((entry) => (
        <div key={entry.label} className="flex items-baseline gap-1">
          <dt className="sr-only">{entry.label}</dt>
          <dd className="font-semibold tabular-nums text-ink">
            {entry.value.toLocaleString()}
          </dd>
          <span aria-hidden className="text-note text-ink-faint">
            {entry.label}
          </span>
        </div>
      ))}
    </dl>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="board-label px-4 py-2">{children}</th>;
}

function Empty() {
  return (
    <div className="px-6 py-16 text-center">
      <span
        aria-hidden
        className="mx-auto flex size-10 items-center justify-center rounded-md border border-rule bg-board text-ink-faint"
      >
        <SearchX className="size-4" />
      </span>
      <p className="mt-3 text-13 font-semibold text-ink">No schools found</p>
      <p className="mx-auto mt-1.5 max-w-[38ch] text-13 leading-relaxed text-ink-soft">
        Search matches a school name, its city or country, or the owner&rsquo;s name and
        email. Try a shorter term, or clear the status filter.
      </p>
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
