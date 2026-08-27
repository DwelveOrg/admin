import type { Metadata } from "next";
import { MousePointerClick } from "lucide-react";

import {
  PageHeader,
  PageShell,
} from "@/components/console/page-furniture";
import { listReportsRequest } from "@/lib/reports/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { Docket } from "./_components/Docket";
import { readDocketParams, type RawSearchParams } from "./_lib/query";

export const metadata: Metadata = { title: "Reports · Dwelve Operations" };

const PAGE_SIZE = 25;

/**
 * The board with no case taken off it.
 *
 * On a wide screen the right pane is an invitation rather than an empty box; on
 * a narrow one the board is the whole page and this pane is not rendered at all.
 */
export default async function DocketPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = readDocketParams(await searchParams);
  const list = await withConsoleAccess(() =>
    listReportsRequest({ ...params, limit: PAGE_SIZE }),
  );

  const waiting = list.reports.length > 0;

  return (
    <PageShell>
      <PageHeader
        title="Reports"
        count={`${list.meta.total.toLocaleString()} matching`}
        description="The report docket from inside Dwelve. Closing a case writes a notification to the person who filed it, carrying your note."
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-start">
        <Docket params={params} list={list} />

        <div className="surface hidden flex-1 items-center justify-center self-stretch p-10 lg:flex lg:min-h-[28rem]">
          <div className="max-w-[34ch] text-center">
            <span
              aria-hidden
              className="mx-auto flex size-11 items-center justify-center rounded-md border border-edge bg-panel-sunk text-t3"
            >
              <MousePointerClick className="size-4.5" />
            </span>
            <p className="mt-4 text-15 font-semibold text-t1">
              {waiting ? "Open a case" : "Nothing waiting"}
            </p>
            <p className="mt-2 text-13 leading-relaxed text-t2">
              {waiting
                ? "Its message, screenshot and browser context open here."
                : "Reports appear the moment someone files one from inside the product."}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
