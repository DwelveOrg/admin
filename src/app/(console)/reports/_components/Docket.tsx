import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReportList } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";
import { CaseRow } from "./CaseRow";
import { KindFilter } from "./KindFilter";
import { SearchField } from "./SearchField";
import { StatusRail } from "./StatusRail";

/**
 * The docket sheet: filters at the top, cases below, a pager at the foot.
 *
 * It is rendered by both routes rather than lifted into a layout, because the
 * filters live in the query string and Next does not give a layout the search
 * params it would need to read them. The cost is one list fetch per navigation,
 * which is the right trade for filters that are linkable.
 *
 * On a narrow screen this *is* the page, and the case file is its own route —
 * two panes at 400px would give neither enough room to be read.
 */
export function Docket({
  params,
  list,
  activeReportId,
  className,
}: {
  params: DocketParams;
  list: ReportList;
  activeReportId?: string;
  className?: string;
}) {
  const { reports, meta } = list;
  const filtered = Boolean(params.search || params.kind || params.status);

  return (
    <aside
      aria-label="Report docket"
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-rule bg-file lg:w-[336px] lg:border-r",
        className,
      )}
    >
      <div className="space-y-3 border-b border-rule p-3">
        <SearchField params={params} />
        <StatusRail params={params} counts={meta.counts} total={totalOf(meta.counts)} />
        <KindFilter params={params} />
      </div>

      <div className="min-h-0 flex-1 divide-y divide-rule-soft overflow-y-auto">
        {reports.length === 0 ? (
          <EmptyDocket filtered={filtered} params={params} />
        ) : (
          reports.map((report) => (
            <CaseRow
              key={report.id}
              report={report}
              params={params}
              active={report.id === activeReportId}
            />
          ))
        )}
      </div>

      {meta.totalPages > 1 ? <Pager params={params} meta={meta} /> : null}
    </aside>
  );
}

/**
 * The unfiltered counts already sum to every report, so the "Everything" row
 * derives its number rather than costing a second query.
 */
function totalOf(counts: Partial<Record<string, number>>) {
  return Object.values(counts).reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function EmptyDocket({ filtered, params }: { filtered: boolean; params: DocketParams }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-13 text-ink-soft">
        {filtered ? "No reports match these filters." : "No reports yet."}
      </p>
      {filtered ? (
        <Link
          href={docketHref(params, {
            status: undefined,
            kind: undefined,
            search: undefined,
            reportId: null,
          })}
          className="mt-2 inline-block text-13 font-medium text-violet hover:underline"
        >
          Clear filters
        </Link>
      ) : (
        <p className="mt-1.5 text-2xs leading-relaxed text-ink-faint">
          Reports arrive here the moment someone files one from inside the
          product.
        </p>
      )}
    </div>
  );
}

function Pager({ params, meta }: { params: DocketParams; meta: ReportList["meta"] }) {
  const previous = Math.max(meta.page - 1, 1);
  const next = Math.min(meta.page + 1, meta.totalPages);

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-rule px-3 py-2">
      <PagerLink
        href={docketHref(params, { page: previous, reportId: null })}
        disabled={meta.page <= 1}
        label="Previous page"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
      </PagerLink>

      <span className="text-2xs tabular-nums text-ink-faint">
        {meta.page} of {meta.totalPages} · {meta.total} total
      </span>

      <PagerLink
        href={docketHref(params, { page: next, reportId: null })}
        disabled={!meta.hasMore}
        label="Next page"
      >
        <ChevronRight className="size-3.5" aria-hidden />
      </PagerLink>
    </div>
  );
}

function PagerLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    // A dead end renders as a disabled control rather than a link that goes
    // nowhere — the latter is reachable by keyboard and answers with the page
    // you are already on.
    return (
      <span
        aria-disabled="true"
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-faint opacity-40"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-wash hover:text-ink"
    >
      {children}
    </Link>
  );
}
