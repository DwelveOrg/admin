import type { Metadata } from "next";
import Link from "next/link";

import { getPlatformOverviewRequest } from "@/lib/platform/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { ActivityChart, DistributionChart, GrowthChart } from "./_components/OverviewCharts";

export const metadata: Metadata = { title: "Overview · Dwelve Operations" };

const VALID_RANGES = new Set([7, 30, 90]);

export default async function ConsoleIndex({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawDays = (await searchParams).days;
  const requestedDays = Number(Array.isArray(rawDays) ? rawDays[0] : rawDays);
  const days = VALID_RANGES.has(requestedDays) ? requestedDays : 30;
  const overview = await withConsoleAccess(() => getPlatformOverviewRequest(days));
  const { summary } = overview;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="field-label">Platform pulse</p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-ink">Overview</h1>
            <p className="mt-1.5 max-w-2xl text-13 leading-relaxed text-ink-soft">
              Growth, learning activity, school health, and the user reports waiting for a response.
            </p>
          </div>
          <div className="flex rounded-md border border-rule bg-file p-0.5">
            {[7, 30, 90].map((range) => (
              <Link
                key={range}
                href={`/?days=${range}`}
                aria-current={days === range ? "page" : undefined}
                className={
                  days === range
                    ? "rounded px-2.5 py-1.5 text-13 font-medium text-violet shadow-file bg-violet-wash"
                    : "rounded px-2.5 py-1.5 text-13 text-ink-soft hover:bg-wash"
                }
              >
                {range}d
              </Link>
            ))}
          </div>
        </header>

        <section aria-label="Platform totals" className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Accounts"
            value={summary.users.total}
            detail={`${summary.users.joined} joined · ${summary.users.blocked} blocked`}
          />
          <MetricCard
            label="Student accounts"
            value={summary.students.activeAccounts}
            detail={`${summary.students.totalAccounts} all-time`}
          />
          <MetricCard
            label="Active schools"
            value={summary.schools.active}
            detail={`${summary.schools.joined} new · ${summary.schools.deactivated} deactivated`}
          />
          <Link
            href="/reports?status=OPEN"
            className="group rounded-xl border border-rule bg-file p-4 shadow-file transition-shadow hover:shadow-lift"
          >
            <p className="field-label">Open reports</p>
            <strong className="mt-2 block text-2xl font-semibold tracking-[-0.025em] text-open">
              {summary.reports.open.toLocaleString()}
            </strong>
            <p className="mt-1 text-2xs text-ink-faint group-hover:text-ink-soft">
              {summary.reports.total.toLocaleString()} filed all-time · Open docket
            </p>
          </Link>
        </section>

        <section aria-label="Platform trends" className="mt-4 grid gap-4 xl:grid-cols-2">
          <GrowthChart data={overview.growth} />
          <ActivityChart data={overview.activity} />
        </section>

        <section aria-label="Platform distributions" className="mt-4 grid gap-4 lg:grid-cols-2">
          <DistributionChart
            eyebrow="People"
            title="Active membership mix"
            description="Current roles across every active school."
            items={overview.membershipDistribution.map((item) => ({
              label: roleLabel(item.role),
              value: item.count,
              color: roleColor(item.role),
            }))}
          />
          <DistributionChart
            eyebrow="Support"
            title="Report outcomes"
            description="Every product report sent to the platform team."
            items={overview.reportDistribution.map((item) => ({
              label: reportLabel(item.status),
              value: item.count,
              color: reportColor(item.status),
            }))}
          />
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <ActivityStat
            label="Tests started"
            value={summary.activity.attemptsStarted}
            range={days}
          />
          <ActivityStat
            label="Tests submitted"
            value={summary.activity.attemptsSubmitted}
            range={days}
          />
          <ActivityStat
            label="Reports filed"
            value={summary.activity.reportsFiled}
            range={days}
          />
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-rule bg-file p-4 shadow-file">
      <p className="field-label">{label}</p>
      <strong className="mt-2 block text-2xl font-semibold tracking-[-0.025em] text-ink">
        {value.toLocaleString()}
      </strong>
      <p className="mt-1 text-2xs text-ink-faint">{detail}</p>
    </div>
  );
}

function ActivityStat({ label, value, range }: { label: string; value: number; range: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-rule bg-file px-4 py-3">
      <span className="text-13 text-ink-soft">{label}</span>
      <span className="text-right">
        <strong className="font-semibold text-ink">{value.toLocaleString()}</strong>
        <span className="ml-1 text-2xs text-ink-faint">/{range}d</span>
      </span>
    </div>
  );
}

function roleLabel(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return { ADMIN: "Admins", TEACHER: "Teachers", STUDENT: "Students" }[role];
}

function roleColor(role: "ADMIN" | "TEACHER" | "STUDENT") {
  return { ADMIN: "var(--violet)", TEACHER: "var(--review)", STUDENT: "var(--resolved)" }[role];
}

function reportLabel(status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED") {
  return { OPEN: "Open", IN_REVIEW: "In review", RESOLVED: "Resolved", DISMISSED: "Dismissed" }[
    status
  ];
}

function reportColor(status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED") {
  return {
    OPEN: "var(--open)",
    IN_REVIEW: "var(--review)",
    RESOLVED: "var(--resolved)",
    DISMISSED: "var(--dismissed)",
  }[status];
}
