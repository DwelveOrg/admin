import type { Metadata } from "next";

import { DeleteSchoolButton } from "@/components/console/DeleteSchoolButton";
import { Pager } from "@/components/console/Pager";
import { ResourceFilters } from "@/components/console/ResourceFilters";
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
  const status =
    rawStatus === "ACTIVE" || rawStatus === "DEACTIVATED" ? rawStatus : undefined;
  const page = positiveInt(first(raw.page));
  const list = await withConsoleAccess(() =>
    listPlatformSchoolsRequest({ search, status, page, limit: 25 }),
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <header>
          <p className="field-label">Tenant control</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-ink">Schools</h1>
          <p className="mt-1.5 max-w-2xl text-13 leading-relaxed text-ink-soft">
            Find any school, inspect its footprint, and deactivate it with the full membership cleanup flow.
          </p>
        </header>

        <div className="mt-6 rounded-xl border border-rule bg-file shadow-file">
          <div className="border-b border-rule p-4">
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
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">No schools found</p>
              <p className="mt-1 text-13 text-ink-soft">Try a different name, location, owner, or status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-rule bg-paper/60">
                    <TableHead>School</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Footprint</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft">
                  {list.schools.map((school) => (
                    <tr key={school.id} className="align-middle hover:bg-paper/40">
                      <td className="px-4 py-3.5">
                        <p className="max-w-64 truncate text-sm font-medium text-ink">{school.name}</p>
                        <p className="mt-0.5 text-2xs text-ink-faint">
                          {[school.city, school.country].filter(Boolean).join(", ") || "Location not set"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {school.owner ? (
                          <div>
                            <p className="text-13 text-ink">{school.owner.fullName}</p>
                            <p className="mt-0.5 text-2xs text-ink-faint">{school.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-13 text-ink-faint">Owner unavailable</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-13 text-ink-soft">
                        {school.counts.members} members · {school.counts.classes} classes · {school.counts.tests}{" "}
                        tests
                      </td>
                      <td className="px-4 py-3.5 text-13 text-ink-soft">{formatDate(school.createdAt)}</td>
                      <td className="px-4 py-3.5"><SchoolStatus active={school.isActive} /></td>
                      <td className="px-4 py-3.5 text-right">
                        {school.isActive ? (
                          <DeleteSchoolButton schoolId={school.id} schoolName={school.name} />
                        ) : (
                          <span className="text-2xs text-ink-faint">No actions</span>
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

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="field-label px-4 py-2.5 font-medium">{children}</th>;
}

function SchoolStatus({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-resolved-wash px-2 py-1 text-2xs font-medium text-resolved"
          : "inline-flex items-center gap-1.5 rounded-full bg-wash px-2 py-1 text-2xs font-medium text-dismissed"
      }
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {active ? "Active" : "Deactivated"}
    </span>
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
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(
    new Date(value),
  );
}
