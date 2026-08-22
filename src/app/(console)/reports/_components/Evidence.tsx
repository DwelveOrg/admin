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
 *
 * The screenshot sits on a daylight plate in both characters, and that is a
 * constraint of this design rather than an oversight. Every screenshot filed
 * here is of a light product; matting one on a dark ground turns it into a
 * lightbox, and an operator reading twenty of them in an evening feels every
 * one. The plate is the room making space for the evidence rather than the
 * evidence being restyled to suit the room.
 */
export function Evidence({ report }: { report: Report }) {
  const screenshot = resolveMediaUrl(report.screenshotUrl);

  return (
    <div className="space-y-4">
      {screenshot ? (
        <figure>
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
            className="plate-daylight block overflow-hidden p-2 transition-shadow duration-160 hover:shadow-lift-pen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshot}
              alt={`Screenshot attached to report ${report.id}`}
              className="max-h-[420px] w-full rounded-xs object-contain"
              loading="lazy"
            />
          </a>
          <figcaption className="mt-1.5 text-note text-t3">
            Screenshot as filed. Opens full size in a new tab.
          </figcaption>
        </figure>
      ) : null}

      <dl className="divide-y divide-edge overflow-hidden rounded-md border border-edge bg-panel-sunk">
        <Row label="Claimant">
          {report.reporter ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-sans text-13 text-t1">{report.reporter.fullName}</span>
              <span className="machine">{report.reporter.email}</span>
              <CopyButton value={report.reporter.email} label="reporter email" />
              {report.schoolRole ? (
                <span className="label rounded-sm bg-panel-sunk px-1.5 py-0.5">
                  {report.schoolRole}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="font-sans text-13 italic text-t3">
              Account deleted — the report outlived it
            </span>
          )}
        </Row>

        <Row label="School">
          {report.school ? (
            <span className="font-sans text-13 text-t1">{report.school.name}</span>
          ) : (
            // Not a gap in the data: /reports requires no school context, on
            // purpose, so that "I cannot pick a school" is reportable.
            <span className="font-sans text-13 text-t3">None selected when filed</span>
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
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-3">
      <dt className="label sm:pt-0.5">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
