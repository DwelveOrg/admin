import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReportList } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";
import { CaseRow } from "./CaseRow";
import { KindFilter } from "./KindFilter";
import { SearchField } from "./SearchField";
import { StatusRail } from "./StatusRail";

/**
 * The board itself: the columns and their counts at the top, the tiles below,
 * a pager at the foot.
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
        "surface flex w-full shrink-0 flex-col overflow-hidden",
        // The page scrolls; this column stays put beside the case file and its
        // own list gets the remaining viewport height.
        "lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:w-[23rem]",
        className,
      )}
    >
      <div className="space-y-2.5 border-b border-edge p-3">
        <SearchField params={params} />
        <StatusRail params={params} counts={meta.counts} total={totalOf(meta.counts)} />
        <KindFilter params={params} />
      </div>

      <div className="min-h-0 flex-1 divide-y divide-edge overflow-y-auto">
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

/**
 * An empty column teaches the board rather than announcing a void: filtered to
 * nothing offers the way back, and genuinely empty says where tiles come from.
 */
function EmptyDocket({ filtered, params }: { filtered: boolean; params: DocketParams }) {
  return (
    <div className="px-5 py-12 text-center">
      <span
        aria-hidden
        className="mx-auto flex size-9 items-center justify-center rounded-md border border-edge bg-panel-sunk text-t3"
      >
        <Inbox className="size-4" />
      </span>
      <p className="mt-3 text-13 font-semibold text-t1">
        {filtered ? "Nothing matches these filters" : "The board is clear"}
      </p>
      {filtered ? (
        <Link
          href={docketHref(params, {
            status: undefined,
            kind: undefined,
            search: undefined,
            reportId: null,
          })}
          className="mt-1.5 inline-block text-13 font-medium text-pen hover:underline"
        >
          Clear filters
        </Link>
      ) : (
        <p className="mx-auto mt-1.5 max-w-[30ch] text-note leading-relaxed text-t3">
          A tile appears the moment someone files a report from inside the product.
        </p>
      )}
    </div>
  );
}

function Pager({ params, meta }: { params: DocketParams; meta: ReportList["meta"] }) {
  const previous = Math.max(meta.page - 1, 1);
  const next = Math.min(meta.page + 1, meta.totalPages);

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-edge px-3 py-2">
      <PagerLink
        href={docketHref(params, { page: previous, reportId: null })}
        disabled={meta.page <= 1}
        label="Previous page"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
      </PagerLink>

      <span className="text-note tabular-nums text-t3">
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
        aria-label={label}
        className="inline-flex size-7 items-center justify-center rounded-sm text-t3 opacity-40"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-sm border border-edge bg-panel-solid text-t2 transition-colors duration-160 hover:bg-panel-sunk hover:text-t1"
    >
      {children}
    </Link>
  );
}
