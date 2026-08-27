import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/console/page-furniture";
import { BackendApiError } from "@/lib/api/backend";
import { caseIdent } from "@/lib/case-ident";
import { getReportRequest, listReportsRequest } from "@/lib/reports/api";
import { withConsoleAccess } from "@/lib/reports/guard";
import { CaseFile } from "../_components/CaseFile";
import { Docket } from "../_components/Docket";
import { readDocketParams, type RawSearchParams } from "../_lib/query";

const PAGE_SIZE = 25;

type PageProps = {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { reportId } = await params;
  return { title: `${caseIdent(reportId)} · Dwelve Operations` };
}

/**
 * A case, with the docket still beside it.
 *
 * Two fetches rather than one because they answer different questions and the
 * case must survive not being on the current page of the docket — a link pasted
 * into a chat has no idea which filters the recipient has applied, and it should
 * still open.
 */
export default async function CasePage({ params, searchParams }: PageProps) {
  const { reportId } = await params;
  const docketParams = readDocketParams(await searchParams);

  const [list, report] = await withConsoleAccess(() =>
    Promise.all([
      listReportsRequest({ ...docketParams, limit: PAGE_SIZE }),
      loadReport(reportId),
    ]),
  );

  if (!report) notFound();

  return (
    <PageShell>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {/* Hidden on mobile: at that width the case file is the page, and the
            docket is one tap away through the case file's own back link. */}
        <Docket
          params={docketParams}
          list={list}
          activeReportId={reportId}
          className="hidden lg:flex"
        />

        <div className="surface min-w-0 flex-1">
          <CaseFile report={report} params={docketParams} />
        </div>
      </div>
    </PageShell>
  );
}

/**
 * A malformed id is a 404, not a 500. `ParseUUIDPipe` answers 400 for anything
 * that is not a UUID, and a mistyped link should meet the not-found page rather
 * than an error boundary.
 */
async function loadReport(reportId: string) {
  try {
    const { report } = await getReportRequest(reportId);
    return report;
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }

    throw error;
  }
}
