import type { Metadata } from "next";
import { ArrowUpRight, CheckCircle2, CircleDot } from "lucide-react";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/console/page-furniture";
import { DISPOSITION_COLOR, DispositionMark } from "@/components/ui/Disposition";
import { getPlatformOverviewRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { STATUS_LABEL } from "@/lib/reports/schemas";
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
  const open = summary.reports.open;

  const readAt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <PageShell>
      <PageHeader
        title="Overview"
        description="A live operating view of platform growth, school activity, and support work."
        aside={<RangeControl days={days} />}
      />

      <section className="surface mt-6 flex flex-col gap-4 overflow-hidden p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border",
              open > 0
                ? "border-open/25 bg-open-wash text-open"
                : "border-resolved/25 bg-resolved-wash text-resolved",
            )}
          >
            {open > 0 ? <CircleDot className="size-4" /> : <CheckCircle2 className="size-4" />}
          </span>
          <div>
            <h2 className="text-17 font-semibold tracking-[-0.02em] text-t1">
              {open === 0
                ? "The report queue is clear"
                : `${open.toLocaleString()} ${open === 1 ? "report needs" : "reports need"} triage`}
            </h2>
            <p className="mt-1 text-13 leading-relaxed text-t2">
              Read at {readAt}. {summary.reports.total.toLocaleString()} reports have been filed
              all-time, and {summary.schools.active.toLocaleString()} schools are live.
            </p>
          </div>
        </div>
        <Link
          href={open > 0 ? "/reports?status=OPEN" : "/reports"}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-edge bg-panel px-3.5 text-13 font-semibold text-t1 transition-colors hover:border-edge-lit hover:bg-panel-sunk"
        >
          {open > 0 ? "Triage reports" : "Open docket"}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </section>

      <section className="surface mt-3 overflow-hidden" aria-labelledby="operating-map-heading">
        <div className="border-b border-edge px-5 py-4">
          <h2 id="operating-map-heading" className="text-15 font-semibold text-t1">
            Platform map
          </h2>
          <p className="mt-1 text-13 text-t2">
            Four operational surfaces, ordered from membership to support.
          </p>
        </div>
        <div className="grid divide-y divide-edge sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <MapNode
            href="/users"
            label="Accounts"
            value={summary.users.total}
            primary={`${summary.users.joined.toLocaleString()} joined in ${days} days`}
            secondary={`${summary.users.blocked.toLocaleString()} blocked`}
          />
          <MapNode
            href="/schools?status=ACTIVE"
            label="Schools"
            value={summary.schools.active}
            primary={`${summary.schools.joined.toLocaleString()} opened in ${days} days`}
            secondary={`${summary.schools.deactivated.toLocaleString()} deactivated`}
          />
          <MapNode
            href="/users?role=STUDENT"
            label="Test activity"
            value={summary.activity.attemptsSubmitted}
            valueLabel={`submitted in ${days}d`}
            primary={`${summary.activity.attemptsStarted.toLocaleString()} attempts started`}
            secondary={`${summary.students.activeAccounts.toLocaleString()} active students`}
          />
          <MapNode
            href="/reports?status=OPEN"
            label="Report queue"
            value={open}
            primary={`${summary.activity.reportsFiled.toLocaleString()} filed in ${days} days`}
            secondary={`${summary.reports.total.toLocaleString()} all-time`}
            tone={open > 0 ? "open" : "resolved"}
          />
        </div>
      </section>

      <section aria-label="Trends" className="mt-3 grid gap-3 xl:grid-cols-2">
        <GrowthChart data={overview.growth} />
        <ActivityChart data={overview.activity} totals={summary.activity} days={days} />
      </section>

      <section aria-label="Distributions" className="mt-3 grid gap-3 xl:grid-cols-2">
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
          description="Every report filed to the platform team. Open a row to view that queue."
          totalLabel="Reports"
          items={overview.reportDistribution.map((item) => ({
            label: STATUS_LABEL[item.status],
            value: item.count,
            color: DISPOSITION_COLOR[item.status],
            href: `/reports?status=${item.status}`,
            mark: <DispositionMark status={item.status} />,
          }))}
        />
      </section>
    </PageShell>
  );
}

function MapNode({
  href,
  label,
  value,
  valueLabel,
  primary,
  secondary,
  tone = "neutral",
}: {
  href: string;
  label: string;
  value: number;
  valueLabel?: string;
  primary: string;
  secondary: string;
  tone?: "neutral" | "open" | "resolved";
}) {
  return (
    <Link
      href={href}
      className="group relative min-w-0 p-5 transition-colors hover:bg-panel-sunk focus-visible:outline-offset-[-3px]"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="label">{label}</span>
        <ArrowUpRight className="size-3.5 text-t3 transition-colors group-hover:text-pen" aria-hidden />
      </span>
      <span className="mt-4 flex items-end gap-2">
        <strong
          className={cn(
            "figure text-count",
            tone === "open" && "text-open",
            tone === "resolved" && "text-resolved",
          )}
        >
          {value.toLocaleString()}
        </strong>
        {valueLabel ? <span className="pb-0.5 text-note text-t3">{valueLabel}</span> : null}
      </span>
      <span className="mt-4 block border-t border-dashed border-edge pt-3 text-13 text-t2">
        {primary}
      </span>
      <span className="mt-1 block text-note text-t3">{secondary}</span>
    </Link>
  );
}

function RangeControl({ days }: { days: number }) {
  return (
    <nav aria-label="Reporting range" className="inline-flex rounded-md border border-edge bg-panel p-1">
      {VALID_RANGES.map((range) => (
        <Link
          key={range}
          href={`/?days=${range}`}
          aria-current={days === range ? "page" : undefined}
          scroll={false}
          className={cn(
            "rounded-sm px-3 py-1.5 text-13 transition-colors",
            days === range
              ? "bg-pen font-semibold text-pen-ink shadow-lift-pen"
              : "font-medium text-t2 hover:bg-panel-sunk hover:text-t1",
          )}
        >
          {range} days
        </Link>
      ))}
    </nav>
  );
}

const ROLE_LABEL = {
  ADMIN: "Admins",
  TEACHER: "Teachers",
  STUDENT: "Students",
} as const;

function roleColor(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return {
    ADMIN: "var(--pen)",
    TEACHER: "var(--review)",
    STUDENT: "var(--resolved)",
  }[role];
}
