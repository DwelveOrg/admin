import type { Metadata } from "next";

import { Pager } from "@/components/console/Pager";
import { ResourceFilters } from "@/components/console/ResourceFilters";
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
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <header>
          <p className="field-label">Identity control</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-ink">Students</h1>
          <p className="mt-1.5 max-w-2xl text-13 leading-relaxed text-ink-soft">
            Search student accounts across every school and block compromised or abusive access globally.
          </p>
        </header>

        <div className="mt-6 rounded-xl border border-rule bg-file shadow-file">
          <div className="border-b border-rule p-4">
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
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">No student accounts found</p>
              <p className="mt-1 text-13 text-ink-soft">Try a different name, email, school, or status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-rule bg-paper/60">
                    <TableHead>Student</TableHead>
                    <TableHead>School membership</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule-soft">
                  {list.students.map((student) => {
                    const current = student.memberships.find(
                      (membership) => membership.isActive && membership.school.isActive,
                    );
                    return (
                      <tr key={student.id} className="align-middle hover:bg-paper/40">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-wash text-2xs font-semibold text-violet">
                              {initials(student.fullName)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink">{student.fullName}</p>
                              <p className="mt-0.5 truncate text-2xs text-ink-faint">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {current ? (
                            <div>
                              <p className="text-13 text-ink">{current.school.name}</p>
                              <p className="mt-0.5 text-2xs text-ink-faint">
                                {current.classCount} {current.classCount === 1 ? "class" : "classes"}
                                {student.memberships.length > 1
                                  ? ` · ${student.memberships.length - 1} previous`
                                  : ""}
                              </p>
                            </div>
                          ) : (
                            <span className="text-13 text-ink-faint">No active school</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-13 text-ink-soft">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Status active={student.isActive} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <StudentAccessButton userId={student.id} blocked={!student.isActive} />
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
  return <th className="field-label px-4 py-2.5 font-medium">{children}</th>;
}

function Status({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-resolved-wash px-2 py-1 text-2xs font-medium text-resolved"
          : "inline-flex items-center gap-1.5 rounded-full bg-danger-wash px-2 py-1 text-2xs font-medium text-danger"
      }
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {active ? "Active" : "Blocked"}
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
