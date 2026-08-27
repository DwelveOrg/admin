import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, UserSearch } from "lucide-react";

import { FilterBar } from "@/components/console/FilterBar";
import {
  Avatar,
  EmptyState,
  PageHeader,
  PageShell,
  Pager,
  ViewSwitch,
  firstParam,
  formatDate,
  pageParam,
} from "@/components/console/page-furniture";
import { StatusPill } from "@/components/console/StatusPill";
import { listPlatformUsersRequest } from "@/lib/platform/api";
import {
  DIRECTORY_ROLES,
  DIRECTORY_ROLE_LABEL,
  SCHOOL_ROLE_LABEL,
  type DirectoryRole,
  type PlatformUser,
} from "@/lib/platform/schemas";
import { withConsoleAccess } from "@/lib/reports/guard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Users · Dwelve Operations" };

const PAGE_SIZE = 25;

/**
 * Every account on the platform.
 *
 * This replaces the students-only screen it grew out of. A platform operator
 * asked to look into an account does not know in advance whether the person is
 * a student, a teacher or the admin who owns the school — and being handed a
 * list that silently excludes two of those is worse than being handed nothing,
 * because it answers "no such person" when the truth is "not in this filter".
 *
 * The role filter spans both of the platform's role systems in one control, for
 * the same reason: an operator asks what kind of person this is, which is one
 * question, not two.
 */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const search = firstParam(raw.search)?.trim().slice(0, 200) || undefined;

  const rawStatus = firstParam(raw.status);
  const status = rawStatus === "ACTIVE" || rawStatus === "BLOCKED" ? rawStatus : undefined;

  const rawRole = firstParam(raw.role);
  const role = DIRECTORY_ROLES.includes(rawRole as DirectoryRole)
    ? (rawRole as DirectoryRole)
    : undefined;

  const page = pageParam(firstParam(raw.page));

  const list = await withConsoleAccess(() =>
    listPlatformUsersRequest({ search, status, role, page, limit: PAGE_SIZE }),
  );

  const filtered = Boolean(search || status || role);

  return (
    <PageShell>
      <PageHeader
        title="Users"
        count={`${list.meta.total.toLocaleString()} matching`}
        description="Every account on the platform — students, teachers, school admins and operators. Open one to read its memberships, hand over a login, or block it everywhere at once."
        aside={
          <ViewSwitch
            label="Filter users by access"
            items={[
              { label: "All", href: userDirectoryHref({ search, role }), active: !status },
              {
                label: "Active",
                href: userDirectoryHref({ search, role, status: "ACTIVE" }),
                active: status === "ACTIVE",
              },
              {
                label: "Blocked",
                href: userDirectoryHref({ search, role, status: "BLOCKED" }),
                active: status === "BLOCKED",
              },
            ]}
          />
        }
      />

      <div className="surface mt-6 overflow-hidden">
        <div className="border-b border-edge p-4">
          <FilterBar
            pathname="/users"
            search={search}
            searchPlaceholder="Search a name, an email address, or a school"
            selects={[
              {
                name: "role",
                value: role,
                label: "Filter by role",
                anyLabel: "Every role",
                options: DIRECTORY_ROLES.map((value) => ({
                  value,
                  label: DIRECTORY_ROLE_LABEL[value],
                })),
              },
              {
                name: "status",
                value: status,
                label: "Filter by access",
                anyLabel: "Any access",
                options: [
                  { value: "ACTIVE", label: "Active accounts" },
                  { value: "BLOCKED", label: "Blocked accounts" },
                ],
              },
            ]}
          />
        </div>

        {list.users.length === 0 ? (
          <EmptyState icon={UserSearch} title="No accounts match">
            {filtered ? (
              <>
                Search covers a name, an email address, and the schools someone belongs
                to.{" "}
                <Link href="/users" className="font-medium text-pen hover:underline">
                  Clear the filters
                </Link>{" "}
                to see everyone.
              </>
            ) : (
              "Accounts appear here as soon as someone signs up in the product."
            )}
          </EmptyState>
        ) : (
          <>
            {/* One row per account, and the whole row is the link. A row with a
                clickable name and dead space around it makes the operator aim;
                at 25 rows a screen that is 25 small targets instead of 25 big
                ones. */}
            <ul className="divide-y divide-edge">
              {list.users.map((user) => (
                <li key={user.id}>
                  <UserRow user={user} />
                </li>
              ))}
            </ul>

            <Pager
              pathname="/users"
              params={{ search, status, role }}
              meta={list.meta}
              unit="accounts"
            />
          </>
        )}
      </div>
    </PageShell>
  );
}

function userDirectoryHref({
  search,
  role,
  status,
}: {
  search?: string;
  role?: DirectoryRole;
  status?: "ACTIVE" | "BLOCKED";
}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/users?${query}` : "/users";
}

function UserRow({ user }: { user: PlatformUser }) {
  const active = user.memberships.filter((membership) => membership.isActive);
  const primary = active[0];
  const isOperator = user.globalRole === "SUPER_ADMIN";

  return (
    <Link
      href={`/users/${user.id}`}
      className="row-hover flex items-center gap-4 px-4 py-3.5 focus-visible:outline-offset-[-2px]"
    >
      <Avatar name={user.fullName} url={user.avatarUrl} />

      <div className="min-w-0 flex-[2]">
        <p className="flex items-center gap-2 truncate text-13 font-semibold text-t1">
          {user.fullName}
          {isOperator ? (
            <span className="shrink-0 rounded-xs bg-pen-wash px-1.5 py-0.5 text-note font-medium text-pen">
              Operator
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-note text-t3">{user.email}</p>
      </div>

      <div className="hidden min-w-0 flex-[2] md:block">
        {primary ? (
          <>
            <p className="truncate text-13 text-t2">{primary.school.name}</p>
            <p className="mt-0.5 truncate text-note text-t3">
              {SCHOOL_ROLE_LABEL[primary.role]}
              {primary.isOwner ? " · owner" : ""}
              {active.length > 1 ? ` · +${active.length - 1} more` : ""}
            </p>
          </>
        ) : (
          <p className="text-13 text-t3">No school yet</p>
        )}
      </div>

      <div className="hidden w-24 shrink-0 lg:block">
        <SignInMethods auth={user.auth} />
      </div>

      <p className="hidden w-28 shrink-0 text-13 text-t2 xl:block">
        {formatDate(user.createdAt)}
      </p>

      <div className="shrink-0">
        <StatusPill
          tone={user.isActive ? "ok" : "danger"}
          label={user.isActive ? "Active" : "Blocked"}
        />
      </div>

      <ChevronRight className="size-4 shrink-0 text-t3" aria-hidden />
    </Link>
  );
}

/**
 * How this account gets in.
 *
 * Worth a column because it changes what an operator can do next: an account
 * with no password has only ever used Google, so "issue a new password" creates
 * a second way in rather than replacing one, and the operator should know that
 * before they click rather than after.
 */
function SignInMethods({
  auth,
  className,
}: {
  auth: { hasPassword: boolean; hasGoogle: boolean };
  className?: string;
}) {
  const methods = [
    auth.hasPassword ? "Password" : null,
    auth.hasGoogle ? "Google" : null,
  ].filter(Boolean) as string[];

  if (methods.length === 0) {
    return <span className={cn("text-note text-t3", className)}>No sign-in set</span>;
  }

  return (
    <span className={cn("text-note text-t2", className)}>{methods.join(" · ")}</span>
  );
}
