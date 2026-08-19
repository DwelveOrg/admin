import type { Metadata } from "next";

import { listReportsRequest } from "@/lib/reports/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { Docket } from "./_components/Docket";
import { readDocketParams, type RawSearchParams } from "./_lib/query";

export const metadata: Metadata = { title: "Docket · Dwelve Operations" };

const PAGE_SIZE = 25;

/**
 * The docket with no case open.
 *
 * On a wide screen the right pane is an invitation rather than an empty box; on
 * a narrow one the docket is the whole page and this pane is not rendered at all.
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

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <Docket params={params} list={list} />

      <div className="hidden min-h-0 flex-1 items-center justify-center overflow-y-auto p-8 lg:flex">
        <div className="max-w-[280px] text-center">
          <p className="text-sm font-medium text-ink">
            {list.reports.length > 0 ? "Pick a case" : "Nothing waiting"}
          </p>
          <p className="mt-1.5 text-13 leading-relaxed text-ink-soft">
            {list.reports.length > 0
              ? "Its message, screenshot and browser context open here."
              : "Reports appear the moment someone files one from inside the product."}
          </p>
        </div>
      </div>
    </div>
  );
}
