import { CopyButton } from "@/components/ui/CopyButton";
import type { Report } from "@/lib/reports/schemas";
import { resolveMediaUrl } from "@/lib/media";

/**
 * Everything the browser reported, and the screenshot.
 *
 * All of it is set in mono, and that is the point of the three-face system: the
 * moment your eye lands here it knows it is reading machine output, not
 * somebody's sentence. A user agent is compared character by character, and a
 * proportional face makes that work harder than it needs to be.
 *
 * These fields are recorded from the client and are description only — the
 * backend never reads them as authorization input.
 */
export function Evidence({ report }: { report: Report }) {
  const screenshot = resolveMediaUrl(report.screenshotUrl);

  return (
    <div className="space-y-6">
      {screenshot ? (
        <figure className="space-y-2">
          <figcaption className="field-label">Screenshot</figcaption>
          {/*
            A plain <a> to the full-size image, and a plain <img> inside it.
            next/image would need the intrinsic dimensions of an arbitrary user
            upload, and the value here is seeing the whole frame rather than a
            perfectly optimised thumbnail of it.
          */}
          <a
            href={screenshot}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border border-rule bg-wash transition-colors hover:border-violet"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshot}
              alt={`Screenshot attached to report ${report.id}`}
              className="max-h-[420px] w-full object-contain"
              loading="lazy"
            />
          </a>
          <p className="text-2xs text-ink-faint">Opens full size in a new tab.</p>
        </figure>
      ) : null}

      <dl className="divide-y divide-rule-soft rounded-lg border border-rule">
        <Row label="Claimant">
          {report.reporter ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-sans text-13 text-ink">{report.reporter.fullName}</span>
              <span className="machine">{report.reporter.email}</span>
              <CopyButton value={report.reporter.email} label="reporter email" />
              {report.schoolRole ? (
                <span className="rounded bg-wash px-1.5 py-0.5 font-sans text-2xs font-medium uppercase tracking-wide text-ink-soft">
                  {report.schoolRole}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="font-sans text-13 italic text-ink-faint">
              Account deleted — the report outlived it
            </span>
          )}
        </Row>

        <Row label="School">
          {report.school ? (
            <span className="font-sans text-13 text-ink">{report.school.name}</span>
          ) : (
            // Not a gap in the data: /reports requires no school context, on
            // purpose, so that "I cannot pick a school" is reportable.
            <span className="font-sans text-13 text-ink-faint">
              None selected when filed
            </span>
          )}
        </Row>

        {report.pageUrl ? (
          <Row label="Page">
            <span className="flex items-start gap-1.5">
              <span className="machine min-w-0 flex-1">{report.pageUrl}</span>
              <CopyButton value={report.pageUrl} label="page URL" />
            </span>
          </Row>
        ) : null}

        <Row label="Viewport">
          <span className="machine">{report.viewport ?? "—"}</span>
        </Row>

        <Row label="Locale">
          <span className="machine">{report.locale ?? "—"}</span>
        </Row>

        {report.appVersion ? (
          <Row label="Build">
            <span className="machine">{report.appVersion}</span>
          </Row>
        ) : null}

        {report.userAgent ? (
          <Row label="Browser">
            <span className="machine">{report.userAgent}</span>
          </Row>
        ) : null}
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-3">
      <dt className="field-label sm:pt-0.5">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
