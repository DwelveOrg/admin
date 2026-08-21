import type { Metadata } from "next";
import { UserSearch } from "lucide-react";

import { Pager } from "@/components/console/Pager";
import { ResourceFilters } from "@/components/console/ResourceFilters";
import { StatusPill } from "@/components/console/StatusPill";
import { StudentAccessButton } from "@/components/console/StudentAccessButton";
import { listPlatformStudentsRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Students · Dwelve Operations" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const search = first(raw.search)?.trim().slice(0, 200) || undefined;
  const rawStatus = first(raw.status);
  const status = rawStatus === "ACTIVE" || rawStatus === "BLOCKED" ? rawStatus : undefined;
  const page = positiveInt(first(raw.page));
  const list = await withConsoleAccess(() =>
    listPlatformStudentsRequest({ search, status, page, limit: 25 }),
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 md:py-7">
        <header>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Students</h1>
            <span className="text-13 tabular-nums text-ink-faint">
              {list.meta.total.toLocaleString()} matching
            </span>
          </div>
          <p className="mt-1 max-w-[62ch] text-13 leading-normal text-ink-soft">
            Search student accounts across every school, and block or restore access
            globally.
          </p>
        </header>

        <div className="tile mt-5 overflow-hidden">
          <div className="border-b border-rule bg-board p-3">
            <ResourceFilters
              pathname="/students"
              search={search}
              status={status}
              searchPlaceholder="Search name, email, or school"
              statuses={[
                { value: "ACTIVE", label: "Active accounts" },
                { value: "BLOCKED", label: "Blocked accounts" },
              ]}
            />
          </div>

          {list.students.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-rule bg-board">
                    <TableHead>Student</TableHead>
                    <TableHead>School membership</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft">
                  {list.students.map((student) => {
                    const current = student.memberships.find(
                      (membership) => membership.isActive && membership.school.isActive,
                    );

                    return (
                      <tr
                        key={student.id}
                        className="align-middle transition-colors duration-150 hover:bg-board"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-violet-wash text-note font-bold text-violet">
                              {initials(student.fullName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-13 font-semibold text-ink">
                                {student.fullName}
                              </p>
                              <p className="mt-0.5 truncate text-note text-ink-faint">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {current ? (
                            <div>
                              <p className="text-13 text-ink">{current.school.name}</p>
                              <p className="mt-0.5 text-note text-ink-faint">
                                {current.classCount}{" "}
                                {current.classCount === 1 ? "class" : "classes"}
                                {student.memberships.length > 1
                                  ? ` · ${student.memberships.length - 1} previous`
                                  : ""}
                              </p>
                            </div>
                          ) : (
                            <span className="text-13 text-ink-faint">No active school</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-13 tabular-nums text-ink-soft">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill
                            tone={student.isActive ? "ok" : "danger"}
                            label={student.isActive ? "Active" : "Blocked"}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StudentAccessButton
                            userId={student.id}
                            blocked={!student.isActive}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pager pathname="/students" params={{ search, status }} meta={list.meta} />
        </div>
      </div>
    </main>
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
        <UserSearch className="size-4" />
      </span>
      <p className="mt-3 text-13 font-semibold text-ink">No student accounts found</p>
      <p className="mx-auto mt-1.5 max-w-[38ch] text-13 leading-relaxed text-ink-soft">
        Search matches a name, an email address, or the school a student belongs to.
        Try a shorter term, or clear the status filter.
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
