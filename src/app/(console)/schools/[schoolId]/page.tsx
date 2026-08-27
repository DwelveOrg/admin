import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";

import { FilterBar } from "@/components/console/FilterBar";
import {
  Avatar,
  EmptyState,
  PageShell,
  Pager,
  SchoolCrest,
  ViewSwitch,
  firstParam,
  formatDate,
  pageParam,
} from "@/components/console/page-furniture";
import { StatusPill } from "@/components/console/StatusPill";
import { CopyButton } from "@/components/ui/CopyButton";
import { Panel } from "@/components/ui/Panel";
import { BackendApiError } from "@/lib/api/backend";
import { getPlatformSchoolRequest, listSchoolMembersRequest } from "@/lib/platform/api";
import {
  SCHOOL_ROLE_LABEL,
  type SchoolMember,
  type SchoolRole,
} from "@/lib/platform/schemas";
import { withConsoleAccess } from "@/lib/reports/guard";
import { cn } from "@/lib/utils";
import { DeactivateSchoolPanel } from "../_components/DeactivateSchoolPanel";

export const metadata: Metadata = { title: "School · Dwelve Operations" };

const PAGE_SIZE = 25;
const MEMBER_ROLES: SchoolRole[] = ["ADMIN", "TEACHER", "STUDENT"];

/**
 * One school, and the people in it.
 *
 * The header answers what this school is and how big; the membership list
 * answers who is in it. Those are the two things an operator opens a school to
 * find out, and the deactivation control sits below both — you should have read
 * the membership count before you get to the button that ends all of them.
 *
 * Membership is fetched separately from the school, because a large school has
 * thousands of members and the header must not wait for a page of them.
 */
export default async function SchoolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { schoolId } = await params;
  const raw = await searchParams;

  const search = firstParam(raw.search)?.trim().slice(0, 200) || undefined;
  const rawRole = firstParam(raw.role);
  const role = MEMBER_ROLES.includes(rawRole as SchoolRole)
    ? (rawRole as SchoolRole)
    : undefined;
  const page = pageParam(firstParam(raw.page));

  const [detail, members] = await withConsoleAccess(() =>
    // Two requests, one round trip's worth of latency: neither depends on the
    // other's result.
    Promise.all([
      getPlatformSchoolRequest(schoolId),
      listSchoolMembersRequest(schoolId, { search, role, page, limit: PAGE_SIZE }),
    ]),
  ).catch((error: unknown) => {
    // 404 is a stale link; 400 is the same journey with a mistyped id
    // (`ParseUUIDPipe` rejects non-UUIDs). Both deserve the not-found page.
    if (
      error instanceof BackendApiError &&
      (error.status === 404 || error.status === 400)
    )
      notFound();
    throw error;
  });

  const { school, membershipDistribution, counts } = detail;
  const location = [school.city, school.country].filter(Boolean).join(", ");
  const filtered = Boolean(search || role);

  return (
    <PageShell>
      <Link
        href="/schools"
        className="mb-5 inline-flex items-center gap-1.5 text-13 font-medium text-t2 transition-colors hover:text-t1"
      >
        ← All schools
      </Link>

      <header className="surface flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6">
        <SchoolCrest name={school.name} url={school.logoUrl} size={64} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="display min-w-0 truncate text-figure text-t1">{school.name}</h1>
            <StatusPill
              tone={school.isActive ? "ok" : "muted"}
              label={school.isActive ? "Active" : "Deactivated"}
            />
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-13 text-t2">
            <span>{location || "Location not set"}</span>
            <span aria-hidden className="size-1 rounded-full bg-t3/60" />
            <span>Created {formatDate(school.createdAt)}</span>
            {school.owner ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-t3/60" />
                <span className="truncate">
                  Owned by{" "}
                  <Link
                    href={`/users/${school.owner.id}`}
                    className="font-medium text-t1 hover:text-pen hover:underline"
                  >
                    {school.owner.fullName}
                  </Link>
                </span>
              </>
            ) : null}
          </p>

          {school.description ? (
            <p className="mt-2 max-w-[68ch] text-13 leading-relaxed text-t2">
              {school.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-sm border border-edge bg-panel-sunk px-2.5 py-1.5 sm:self-center">
          <code className="machine text-note text-t2">{school.id.slice(0, 8)}…</code>
          <CopyButton value={school.id} label="school id" />
        </div>
      </header>

      {/* The footprint. Stated as a band rather than as four separate panels,
          because these are one fact about one school and dividing them into
          cards would invite comparing them to each other. */}
      <section
        aria-label="Footprint"
        className="surface mt-3 grid grid-cols-2 divide-x divide-y divide-edge sm:grid-cols-3 sm:divide-y-0 xl:grid-cols-6"
      >
        <Stat label="Members" value={counts.members} />
        {membershipDistribution.map((entry) => (
          <Stat
            key={entry.role}
            label={`${SCHOOL_ROLE_LABEL[entry.role]}s`}
            value={entry.count}
            href={`/schools/${school.id}?role=${entry.role}`}
          />
        ))}
        <Stat label="Classes" value={counts.classes} />
        <Stat label="Tests" value={counts.tests} />
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Panel
          title="Members"
          description={`${members.meta.total.toLocaleString()} ${members.meta.total === 1 ? "person" : "people"} in this school.`}
          aside={
            <ViewSwitch
              label="Filter members by role"
              items={[
                {
                  label: "All",
                  href: schoolMembersHref(school.id, search),
                  active: !role,
                },
                ...MEMBER_ROLES.map((value) => ({
                  label: `${SCHOOL_ROLE_LABEL[value]}s`,
                  href: schoolMembersHref(school.id, search, value),
                  active: role === value,
                })),
              ]}
            />
          }
          bodyClassName="p-0"
        >
          <div className="border-b border-edge p-4">
            <FilterBar
              pathname={`/schools/${school.id}`}
              search={search}
              searchPlaceholder="Search a name or an email address"
              preserve={{ role }}
            />
          </div>

          {members.members.length === 0 ? (
            <EmptyState icon={Users} title="No members match">
              {filtered
                ? "Search covers a member's name and email address. Try a shorter term, or clear the role filter."
                : "Nobody has joined this school yet. Members appear here as soon as the owner invites them."}
            </EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-edge">
                {members.members.map((member) => (
                  <li key={member.id}>
                    <MemberRow member={member} />
                  </li>
                ))}
              </ul>

              <Pager
                pathname={`/schools/${school.id}`}
                params={{ search, role }}
                meta={members.meta}
                unit="members"
              />
            </>
          )}
        </Panel>

        <DeactivateSchoolPanel
          schoolId={school.id}
          schoolName={school.name}
          isActive={school.isActive}
          memberCount={counts.members}
        />
      </div>
    </PageShell>
  );
}

function schoolMembersHref(schoolId: string, search?: string, role?: SchoolRole) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  const query = params.toString();
  return query ? `/schools/${schoolId}?${query}` : `/schools/${schoolId}`;
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <>
      <p className="label">{label}</p>
      <p className="figure mt-1.5 text-17">{value.toLocaleString()}</p>
    </>
  );

  return href ? (
    <Link href={href} className="row-hover block p-4 focus-visible:outline-offset-[-2px]">
      {body}
    </Link>
  ) : (
    <div className="p-4">{body}</div>
  );
}

function MemberRow({ member }: { member: SchoolMember }) {
  return (
    <Link
      href={`/users/${member.user.id}`}
      className="row-hover flex items-center gap-4 px-5 py-3.5 focus-visible:outline-offset-[-2px]"
    >
      <Avatar name={member.user.fullName} url={member.user.avatarUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-13 font-semibold text-t1">{member.user.fullName}</p>
        <p className="mt-0.5 truncate text-note text-t3">{member.user.email}</p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <span
          className={cn(
            "rounded-xs px-2 py-1 text-note font-medium",
            member.isOwner
              ? "bg-pen-wash text-pen"
              : member.role === "ADMIN"
                ? "bg-review-wash text-review"
                : "bg-panel-sunk text-t2",
          )}
        >
          {member.isOwner ? "Owner" : SCHOOL_ROLE_LABEL[member.role]}
        </span>
        {member.classCount > 0 ? (
          <span className="w-20 text-note text-t3">
            {member.classCount} {member.classCount === 1 ? "class" : "classes"}
          </span>
        ) : (
          <span className="w-20" />
        )}
      </div>

      {/* Two states can stop a member and they are not the same: the membership
          ended, or the account itself is blocked platform-wide. An operator
          chasing one person needs to know which. */}
      <div className="shrink-0">
        {!member.user.isActive ? (
          <StatusPill tone="danger" label="Blocked" />
        ) : member.isActive ? (
          <StatusPill tone="ok" label="Live" />
        ) : (
          <StatusPill tone="muted" label="Ended" />
        )}
      </div>

      <ChevronRight className="size-4 shrink-0 text-t3" aria-hidden />
    </Link>
  );
}
