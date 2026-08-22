import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/console/page-furniture";
import { DispositionMark } from "@/components/ui/Disposition";
import { Signal } from "@/components/ui/Signal";
import { getPlatformOverviewRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { cn } from "@/lib/utils";
import { ActivityChart, DistributionChart, GrowthChart } from "./_components/OverviewCharts";

export const metadata: Metadata = { title: "Overview · Dwelve Operations" };

const VALID_RANGES = [7, 30, 90] as const;

export default async function ConsoleIndex({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawDays = (await searchParams).days;
  const requestedDays = Number(Array.isArray(rawDays) ? rawDays[0] : rawDays);
  const days = VALID_RANGES.includes(requestedDays as (typeof VALID_RANGES)[number])
    ? requestedDays
    : 30;
  const overview = await withConsoleAccess(() => getPlatformOverviewRequest(days));
  const { summary } = overview;

  // Server-rendered and force-dynamic, so this stamp is the moment the console
  // was read and can never disagree with a client clock.
  const readAt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const open = summary.reports.open;

  return (
    <PageShell>
      {/*
        The thesis, stated.

        This console's first question is how much is waiting, so the page opens
        by answering it in a sentence rather than by presenting four equal tiles
        and leaving the operator to find the one that matters. The aurora behind
        this line is saying the same thing in colour; neither is load-bearing
        alone, and the number is always here in text.
      */}
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="display max-w-[18ch] text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.98] text-t1">
            {open === 0 ? (
              "Nothing is waiting."
            ) : (
              <>
                <Link
                  href="/reports?status=OPEN"
                  className="text-open underline decoration-open/30 decoration-2 underline-offset-[0.12em] transition-colors hover:decoration-open"
                >
                  {open.toLocaleString()} {open === 1 ? "report" : "reports"}
                </Link>{" "}
                {open === 1 ? "is" : "are"} waiting.
              </>
            )}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-13 text-t2">
            <span>Read at {readAt}</span>
            <Dot />
            <span>{summary.reports.total.toLocaleString()} filed all-time</span>
            <Dot />
            <span>
              {summary.schools.active.toLocaleString()} schools live
            </span>
          </p>
        </div>

        <RangeControl days={days} />
      </header>

      {/* The standing totals. Four readings, each with its own recent shape —
          enough to answer "is anything different today" without opening a chart. */}
      <section
        aria-label="Standing totals"
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Signal
          label="Accounts"
          value={summary.users.total}
          delta={{ value: summary.users.joined, unit: `in ${days}d` }}
          note={`${summary.users.blocked.toLocaleString()} blocked`}
          series={overview.growth.map((day) => day.totalUsers)}
          href="/users"
        />
        <Signal
          label="Student accounts"
          value={summary.students.activeAccounts}
          note={`${summary.students.totalAccounts.toLocaleString()} all-time`}
          series={overview.activity.map((day) => day.attemptsSubmitted)}
          href="/users?role=STUDENT"
        />
        <Signal
          label="Active schools"
          value={summary.schools.active}
          delta={{ value: summary.schools.joined, unit: `in ${days}d` }}
          note={`${summary.schools.deactivated.toLocaleString()} deactivated`}
          series={overview.growth.map((day) => day.totalSchools)}
          href="/schools"
        />
        <Signal
          label="Open reports"
          value={open}
          tone={open > 0 ? "open" : "resolved"}
          mark={<DispositionMark status="OPEN" />}
          note={`${summary.activity.reportsFiled.toLocaleString()} filed in ${days}d`}
          series={overview.activity.map((day) => day.reportsFiled)}
          href="/reports?status=OPEN"
        />
      </section>

      <section aria-label="Trends" className="mt-3 grid gap-3 xl:grid-cols-2">
        <GrowthChart data={overview.growth} />
        <ActivityChart data={overview.activity} totals={summary.activity} days={days} />
      </section>

      <section aria-label="Distributions" className="mt-3 grid gap-3 lg:grid-cols-2">
        <DistributionChart
          title="Active membership"
          description="Who holds a live membership across every active school."
          totalLabel="Members"
          items={overview.membershipDistribution.map((item) => ({
            label: ROLE_LABEL[item.role],
            value: item.count,
            color: roleColor(item.role),
            href: `/users?role=${item.role}`,
          }))}
        />
        <DistributionChart
          title="Report outcomes"
          description="Every problem report ever sent to the platform team. Pick a row to open that part of the docket."
          totalLabel="Reports"
          items={overview.reportDistribution.map((item) => ({
            label: STATUS_LABEL[item.status],
            value: item.count,
            color: `var(--${STATUS_TOKEN[item.status]})`,
            href: `/reports?status=${item.status}`,
            mark: <DispositionMark status={item.status} />,
          }))}
        />
      </section>
    </PageShell>
  );
}

function Dot() {
  return (
    <span aria-hidden className="size-1 rounded-full bg-t3/60" />
  );
}

/**
 * The reporting window.
 *
 * A segmented control rather than a select, because there are three options and
 * an operator switches between them repeatedly while reading one screen — a
 * select would cost two clicks each time to save 60px.
 */
function RangeControl({ days }: { days: number }) {
  return (
    <div
      role="group"
      aria-label="Reporting range"
      className="glass flex shrink-0 self-start rounded-md p-1 xl:self-auto"
    >
      {VALID_RANGES.map((range) => (
        <Link
          key={range}
          href={`/?days=${range}`}
          aria-current={days === range ? "page" : undefined}
          className={cn(
            "rounded-sm px-3.5 py-1.5 text-13 transition-all duration-160",
            days === range
              ? "bg-pen font-semibold text-pen-ink shadow-lift-pen"
              : "font-medium text-t2 hover:bg-panel-sunk hover:text-t1",
          )}
        >
          {range} days
        </Link>
      ))}
    </div>
  );
}

const STATUS_LABEL = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
} as const;

const STATUS_TOKEN = {
  OPEN: "open",
  IN_REVIEW: "review",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

const ROLE_LABEL = {
  ADMIN: "Admins",
  TEACHER: "Teachers",
  STUDENT: "Students",
} as const;

/**
 * Roles are not dispositions, so they take this ring's own pen set — declared
 * in its legend and used nowhere else. Reusing the disposition colours here
 * would make "teacher" and "in review" the same colour on one screen.
 */
function roleColor(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return {
    ADMIN: "var(--pen)",
    TEACHER: "var(--review)",
    STUDENT: "var(--resolved)",
  }[role];
}
