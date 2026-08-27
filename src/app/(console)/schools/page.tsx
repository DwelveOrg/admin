import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";

import { FilterBar } from "@/components/console/FilterBar";
import {
  EmptyState,
  PageHeader,
  PageShell,
  Pager,
  SchoolCrest,
  ViewSwitch,
  firstParam,
  formatDate,
  pageParam,
} from "@/components/console/page-furniture";
import { StatusPill } from "@/components/console/StatusPill";
import { listPlatformSchoolsRequest } from "@/lib/platform/api";
import type { PlatformSchool } from "@/lib/platform/schemas";
import { withConsoleAccess } from "@/lib/reports/guard";

export const metadata: Metadata = { title: "Schools · Dwelve Operations" };

const PAGE_SIZE = 25;

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const search = firstParam(raw.search)?.trim().slice(0, 200) || undefined;
  const rawStatus = firstParam(raw.status);
  const status =
    rawStatus === "ACTIVE" || rawStatus === "DEACTIVATED" ? rawStatus : undefined;
  const page = pageParam(firstParam(raw.page));

  const list = await withConsoleAccess(() =>
    listPlatformSchoolsRequest({ search, status, page, limit: PAGE_SIZE }),
  );

  const filtered = Boolean(search || status);

  return (
    <PageShell>
      <PageHeader
        title="Schools"
        count={`${list.meta.total.toLocaleString()} matching`}
        description="Every school on the platform. Open one to read its membership, or deactivate it with the full cleanup."
        aside={
          <ViewSwitch
            label="Filter schools by status"
            items={[
              { label: "All", href: schoolDirectoryHref({ search }), active: !status },
              {
                label: "Active",
                href: schoolDirectoryHref({ search, status: "ACTIVE" }),
                active: status === "ACTIVE",
              },
              {
                label: "Deactivated",
                href: schoolDirectoryHref({ search, status: "DEACTIVATED" }),
                active: status === "DEACTIVATED",
              },
            ]}
          />
        }
      />

      <div className="surface mt-6 overflow-hidden">
        <div className="border-b border-edge p-4">
          <FilterBar
            pathname="/schools"
            search={search}
            searchPlaceholder="Search a school, a city, or an owner"
            selects={[
              {
                name: "status",
                value: status,
                label: "Filter by status",
                anyLabel: "Any status",
                options: [
                  { value: "ACTIVE", label: "Active schools" },
                  { value: "DEACTIVATED", label: "Deactivated schools" },
                ],
              },
            ]}
          />
        </div>

        {list.schools.length === 0 ? (
          <EmptyState icon={SearchX} title="No schools match">
            {filtered ? (
              <>
                Search covers a school name, its city or country, and the owner&rsquo;s
                name and email.{" "}
                <Link href="/schools" className="font-medium text-pen hover:underline">
                  Clear the filters
                </Link>{" "}
                to see them all.
              </>
            ) : (
              "Schools appear here as soon as someone creates one in the product."
            )}
          </EmptyState>
        ) : (
          <>
            <ul className="divide-y divide-edge">
              {list.schools.map((school) => (
                <li key={school.id}>
                  <SchoolRow school={school} />
                </li>
              ))}
            </ul>

            <Pager
              pathname="/schools"
              params={{ search, status }}
              meta={list.meta}
              unit="schools"
            />
          </>
        )}
      </div>
    </PageShell>
  );
}

function schoolDirectoryHref({
  search,
  status,
}: {
  search?: string;
  status?: "ACTIVE" | "DEACTIVATED";
}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/schools?${query}` : "/schools";
}

function SchoolRow({ school }: { school: PlatformSchool }) {
  const location = [school.city, school.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/schools/${school.id}`}
      className="row-hover flex items-center gap-4 px-4 py-3.5 focus-visible:outline-offset-[-2px]"
    >
      <SchoolCrest name={school.name} url={school.logoUrl} />

      <div className="min-w-0 flex-[2]">
        <p className="truncate text-13 font-semibold text-t1">{school.name}</p>
        <p className="mt-0.5 truncate text-note text-t3">
          {location || "Location not set"}
        </p>
      </div>

      <div className="hidden min-w-0 flex-[2] md:block">
        {school.owner ? (
          <>
            <p className="truncate text-13 text-t2">{school.owner.fullName}</p>
            <p className="mt-0.5 truncate text-note text-t3">{school.owner.email}</p>
          </>
        ) : (
          <p className="text-13 text-t3">Owner unavailable</p>
        )}
      </div>

      <Footprint counts={school.counts} />

      <p className="hidden w-28 shrink-0 text-13 text-t2 xl:block">
        {formatDate(school.createdAt)}
      </p>

      <div className="shrink-0">
        <StatusPill
          tone={school.isActive ? "ok" : "muted"}
          label={school.isActive ? "Active" : "Deactivated"}
        />
      </div>

      <ChevronRight className="size-4 shrink-0 text-t3" aria-hidden />
    </Link>
  );
}

/**
 * Three figures that get compared down the column, so they line up in one and
 * stay in the same order everywhere they appear.
 */
function Footprint({
  counts,
}: {
  counts: { members: number; classes: number; tests: number };
}) {
  return (
    <dl className="hidden shrink-0 items-baseline gap-4 text-13 lg:flex">
      {[
        { label: "members", value: counts.members },
        { label: "classes", value: counts.classes },
        { label: "tests", value: counts.tests },
      ].map((entry) => (
        <div key={entry.label} className="flex w-20 items-baseline gap-1.5">
          <dt className="sr-only">{entry.label}</dt>
          <dd className="font-semibold text-t1">{entry.value.toLocaleString()}</dd>
          <span aria-hidden className="text-note text-t3">
            {entry.label}
          </span>
        </div>
      ))}
    </dl>
  );
}
