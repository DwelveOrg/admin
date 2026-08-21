import type { Metadata } from "next";
import { MousePointerClick } from "lucide-react";

import { listReportsRequest } from "@/lib/reports/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { Docket } from "./_components/Docket";
import { readDocketParams, type RawSearchParams } from "./_lib/query";

export const metadata: Metadata = { title: "Docket · Dwelve Operations" };

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
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <Docket params={params} list={list} />

      <div className="hidden min-h-0 flex-1 items-center justify-center overflow-y-auto p-8 lg:flex">
        <div className="max-w-[32ch] text-center">
          <span
            aria-hidden
            className="mx-auto flex size-10 items-center justify-center rounded-md border border-rule bg-tile text-ink-faint shadow-lift-1"
          >
            <MousePointerClick className="size-4" />
          </span>
          <p className="mt-3 text-13 font-semibold text-ink">
            {waiting ? "Take a tile off the board" : "Nothing waiting"}
          </p>
          <p className="mt-1.5 text-13 leading-relaxed text-ink-soft">
            {waiting
              ? "Its message, screenshot and browser context open here."
              : "Reports appear the moment someone files one from inside the product."}
          </p>
        </div>
      </div>
    </div>
  );
}
