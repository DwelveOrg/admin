import type { Metadata } from "next";
import Link from "next/link";

import { DispositionMark } from "@/components/ui/Disposition";
import { getPlatformOverviewRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { cn } from "@/lib/utils";
import { ActivityChart, DistributionChart, GrowthChart } from "./_components/OverviewCharts";

export const metadata: Metadata = { title: "Board · Dwelve Operations" };

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

  // A ward board always says when it was last written on. This page is
  // force-dynamic and server-rendered, so the stamp is the moment the board was
  // read and never disagrees with a client clock.
  const readAt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const cells = [
    {
      label: "Accounts",
      value: summary.users.total,
      delta: { direction: "up" as const, value: summary.users.joined, unit: `in ${days}d` },
      note: `${summary.users.blocked.toLocaleString()} blocked`,
    },
    {
      label: "Student accounts",
      value: summary.students.activeAccounts,
      note: `${summary.students.totalAccounts.toLocaleString()} all-time`,
    },
    {
      label: "Active schools",
      value: summary.schools.active,
      delta: { direction: "up" as const, value: summary.schools.joined, unit: `in ${days}d` },
      note: `${summary.schools.deactivated.toLocaleString()} deactivated`,
    },
    {
      label: "Open reports",
      value: summary.reports.open,
      href: "/reports?status=OPEN",
      mark: <DispositionMark status="OPEN" />,
      note: `${summary.reports.total.toLocaleString()} filed all-time`,
    },
  ];

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-6 md:py-7">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">The board</h1>
            <p className="mt-1 max-w-[62ch] text-13 leading-normal text-ink-soft">
              Growth, learning activity, membership, and the reports waiting for a
              response. Read at {readAt}.
            </p>
          </div>

          <div
            role="group"
            aria-label="Reporting range"
            className="flex shrink-0 rounded-md border border-rule bg-tile p-0.5 shadow-lift-1"
          >
            {VALID_RANGES.map((range) => (
              <Link
                key={range}
                href={`/?days=${range}`}
                aria-current={days === range ? "page" : undefined}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-13 transition-colors duration-150",
                  days === range
                    ? "bg-violet font-semibold text-violet-ink"
                    : "font-medium text-ink-soft hover:bg-wash hover:text-ink",
                )}
              >
                {range}d
              </Link>
            ))}
          </div>
        </header>

        {/* One ruled band, not four cards: the totals are columns of the same
            board, and the rules between them are what say so. */}
        <section aria-label="Standing totals" className="tile mt-5 grid grid-cols-2 xl:grid-cols-4">
          {cells.map((cell, index) => {
            const edges = cn(
              index % 2 === 0 && "border-r border-rule",
              index < 2 && "border-b border-rule",
              "xl:border-b-0",
              index < cells.length - 1 && "xl:border-r xl:border-rule",
              index === 1 && "xl:border-r",
            );

            const body = (
              <>
                <p className="board-label flex items-center gap-1.5">
                  {cell.mark}
                  {cell.label}
                </p>
                <strong className="board-count mt-2 block text-count">
                  {cell.value.toLocaleString()}
                </strong>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-note text-ink-faint">
                  {cell.delta ? <Delta {...cell.delta} /> : null}
                  <span>{cell.note}</span>
                </p>
              </>
            );

            return cell.href ? (
              <Link
                key={cell.label}
                href={cell.href}
                className={cn(
                  "group p-4 transition-colors duration-150 hover:bg-wash focus-visible:outline-offset-[-2px]",
                  edges,
                )}
              >
                {body}
              </Link>
            ) : (
              <div key={cell.label} className={cn("p-4", edges)}>
                {body}
              </div>
            );
          })}
        </section>

        <section aria-label="Trends" className="mt-4 grid gap-4 xl:grid-cols-2">
          <GrowthChart data={overview.growth} />
          <ActivityChart
            data={overview.activity}
            totals={summary.activity}
            days={days}
          />
        </section>

        <section aria-label="Distributions" className="mt-4 grid gap-4 lg:grid-cols-2">
          <DistributionChart
            title="Active membership"
            description="Who holds a live membership across every active school."
            totalLabel="Members"
            items={overview.membershipDistribution.map((item) => ({
              label: roleLabel(item.role),
              value: item.count,
              color: roleColor(item.role),
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
      </div>
    </main>
  );
}

/**
 * A change stated as an event rather than decoration: a drawn caret carries the
 * direction, so the mark still reads without colour and does not borrow a
 * disposition's meaning to say "went up".
 */
function Delta({
  direction,
  value,
  unit,
}: {
  direction: "up" | "down";
  value: number;
  unit: string;
}) {
  if (value === 0) return <span className="text-ink-faint">No change {unit}</span>;

  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-wash px-1.5 py-0.5 font-medium text-ink-soft">
      <svg viewBox="0 0 8 8" className="size-2 shrink-0" aria-hidden focusable="false">
        <path
          d={direction === "up" ? "M4 1 7.2 6.4H0.8z" : "M4 7 0.8 1.6h6.4z"}
          fill="currentColor"
        />
      </svg>
      {value.toLocaleString()} {unit}
    </span>
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

function roleLabel(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return { ADMIN: "Admins", TEACHER: "Teachers", STUDENT: "Students" }[role];
}

/**
 * Roles are not dispositions, so they take the plate's own pen set — graphite,
 * teal, green — declared in this ring's legend and nowhere else.
 */
function roleColor(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return { ADMIN: "var(--ink)", TEACHER: "var(--review)", STUDENT: "var(--resolved)" }[role];
}
