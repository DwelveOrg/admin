import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CopyButton } from "@/components/ui/CopyButton";
import { DispositionChip } from "@/components/ui/Disposition";
import { caseIdent } from "@/lib/case-ident";
import { fullTimestamp } from "@/lib/datetime";
import { KIND_LABEL, type Report } from "@/lib/reports/schemas";
import { docketHref, type DocketParams } from "../_lib/query";
import { DecisionForm } from "./DecisionForm";
import { Evidence } from "./Evidence";

/**
 * One case, read top to bottom in the order it is thought about: what it is,
 * what the person said, what the machine saw, and what we are going to do.
 *
 * The testimony comes before the evidence deliberately. The screenshot is the
 * more striking object and would win the top of the page by default, but the
 * sentence someone wrote is what decides whether the screenshot is even
 * relevant.
 */
export function CaseFile({ report, params }: { report: Report; params: DocketParams }) {
  return (
    <article className="mx-auto w-full max-w-[720px] px-4 py-6 md:px-8 md:py-8">
      <Link
        href={docketHref(params, { reportId: null, page: params.page })}
        className="mb-5 inline-flex items-center gap-1.5 text-13 text-ink-soft transition-colors hover:text-ink lg:hidden"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Docket
      </Link>

      <header className="mb-6 border-b border-rule pb-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="ident text-lg text-ink">{caseIdent(report.id)}</h1>
          <DispositionChip status={report.status} />
          <span className="text-13 text-ink-faint">{KIND_LABEL[report.kind]}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-ink-faint">
          <span>Filed {fullTimestamp(report.createdAt)}</span>
          {report.resolvedAt ? <span>· Closed {fullTimestamp(report.resolvedAt)}</span> : null}
          <span className="flex items-center gap-1">
            {/* The short ident is for talking; the UUID is for querying. Both
                are on screen so neither has to be reconstructed from the other. */}
            · <span className="machine">{report.id}</span>
            <CopyButton value={report.id} label="report ID" />
          </span>
        </div>
      </header>

      <section className="mb-8" aria-label="What the reporter said">
        <p className="testimony">{report.message}</p>
      </section>

      <section className="mb-8" aria-label="Context recorded with the report">
        <Evidence report={report} />
      </section>

      <section
        aria-label="Decision"
        className="rounded-xl border border-rule bg-file p-4 shadow-file md:p-5"
      >
        {/* Keyed: a new case starts from its own stored decision, never the
            half-typed one left behind on the previous case. */}
        <DecisionForm key={report.id} report={report} />
      </section>
    </article>
  );
}
