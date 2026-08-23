import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, School } from "lucide-react";

import {
  Avatar,
  EmptyState,
  PageShell,
  formatDate,
} from "@/components/console/page-furniture";
import { StatusPill } from "@/components/console/StatusPill";
import { CopyButton } from "@/components/ui/CopyButton";
import { Panel } from "@/components/ui/Panel";
import { BackendApiError } from "@/lib/api/backend";
import { getPlatformUserRequest } from "@/lib/platform/api";
import { SCHOOL_ROLE_LABEL } from "@/lib/platform/schemas";
import { withConsoleAccess } from "@/lib/reports/guard";
import { cn } from "@/lib/utils";
import { AccessPanel } from "../_components/AccessPanel";
import { CredentialPanel } from "../_components/CredentialPanel";

export const metadata: Metadata = { title: "Account · Dwelve Operations" };

/**
 * One account, and everything an operator can do to it.
 *
 * Two columns, and which side something is on is the whole information
 * architecture: the left column is what this account *is* — identity, sign-in,
 * access — and the right column is where it *belongs*. An operator arriving
 * from a support message is on the left; one arriving from a school
 * investigation is on the right.
 *
 * The two actions live on the left because they act on the account itself
 * rather than on any one membership, which is the distinction that makes this
 * console different from the school admin screens inside the product.
 */
export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const response = await withConsoleAccess(() => getPlatformUserRequest(userId)).catch(
    (error: unknown) => {
      // A 404 here is an operator following a stale link, which is a normal
      // thing to do and deserves the not-found page rather than an error
      // boundary that reads like an outage. A 400 is the same journey with a
      // mistyped id — `ParseUUIDPipe` rejects anything that is not a UUID —
      // so it meets the same page (see loadReport in reports/[reportId]).
      if (
        error instanceof BackendApiError &&
        (error.status === 404 || error.status === 400)
      )
        notFound();
      throw error;
    },
  );

  const user = response.user;
  const isOperator = user.globalRole === "SUPER_ADMIN";
  const activeMemberships = user.memberships.filter((membership) => membership.isActive);

  return (
    <PageShell>
      <Link
        href="/users"
        className="mb-5 inline-flex items-center gap-1.5 text-13 font-medium text-t2 transition-colors hover:text-t1"
      >
        ← All users
      </Link>

      <header className="glass flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6">
        <Avatar name={user.fullName} url={user.avatarUrl} size={64} className="rounded-md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="display min-w-0 truncate text-figure text-t1">
              {user.fullName}
            </h1>
            {isOperator ? (
              <span className="shrink-0 rounded-sm bg-pen-wash px-2 py-1 text-note font-medium text-pen">
                Platform admin
              </span>
            ) : null}
            <StatusPill
              tone={user.isActive ? "ok" : "danger"}
              label={user.isActive ? "Active" : "Blocked"}
            />
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-13 text-t2">
            <span className="truncate">{user.email}</span>
            <span aria-hidden className="size-1 rounded-full bg-t3/60" />
            <span>Joined {formatDate(user.createdAt)}</span>
            <span aria-hidden className="size-1 rounded-full bg-t3/60" />
            <span>
              {activeMemberships.length === 0
                ? "No school"
                : `${activeMemberships.length} ${activeMemberships.length === 1 ? "school" : "schools"}`}
            </span>
          </p>
        </div>

        {/* The account id is what goes into a database query or a colleague's
            message, so it stays on screen and one click from the clipboard. */}
        <div className="flex shrink-0 items-center gap-1.5 self-start rounded-sm border border-edge bg-panel-sunk px-2.5 py-1.5 sm:self-center">
          <code className="machine text-note text-t2">{user.id.slice(0, 8)}…</code>
          <CopyButton value={user.id} label="account id" />
        </div>
      </header>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-3">
          <CredentialPanel
            userId={user.id}
            email={user.email}
            hasPassword={user.auth.hasPassword}
            hasGoogle={user.auth.hasGoogle}
            isOperator={isOperator}
          />

          <AccessPanel
            userId={user.id}
            fullName={user.fullName}
            isActive={user.isActive}
            isOperator={isOperator}
            schoolCount={activeMemberships.length}
          />
        </div>

        <Panel
          title="Memberships"
          description="Every school this account has joined, live or ended."
          bodyClassName={user.memberships.length === 0 ? undefined : "p-0"}
        >
          {user.memberships.length === 0 ? (
            <EmptyState icon={Building2} title="Not in a school yet">
              This account exists but has not joined or been invited to a school. It can
              sign in and will land on the product&rsquo;s onboarding.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-edge">
              {user.memberships.map((membership) => (
                <li key={membership.id}>
                  <Link
                    href={`/schools/${membership.school.id}`}
                    className="row-hover flex items-center gap-4 px-5 py-3.5 focus-visible:outline-offset-[-2px]"
                  >
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-edge bg-panel-sunk text-t3"
                    >
                      <School className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-13 font-semibold text-t1">
                        {membership.school.name}
                      </p>
                      <p className="mt-0.5 text-note text-t3">
                        {SCHOOL_ROLE_LABEL[membership.role]}
                        {membership.isOwner ? " · owner" : ""}
                        {membership.classCount > 0
                          ? ` · ${membership.classCount} ${membership.classCount === 1 ? "class" : "classes"}`
                          : ""}
                        {" · joined "}
                        {formatDate(membership.joinedAt)}
                      </p>
                    </div>

                    {/* Two different things can end a membership and they mean
                        different things: the person left, or the school was
                        shut down. Saying only "inactive" would hide which. */}
                    <span
                      className={cn(
                        "shrink-0 rounded-xs px-2 py-1 text-note font-medium",
                        membership.isActive && membership.school.isActive
                          ? "bg-resolved-wash text-resolved"
                          : "bg-dismissed-wash text-dismissed",
                      )}
                    >
                      {!membership.school.isActive
                        ? "School closed"
                        : membership.isActive
                          ? "Live"
                          : "Ended"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
