import "server-only";

import { authedBackendJson } from "@/lib/auth/backend";
import {
  reportListSchema,
  reportResponseSchema,
  type ReportKind,
  type ReportStatus,
} from "./schemas";

export type ReportQuery = {
  status?: ReportStatus;
  kind?: ReportKind;
  search?: string;
  page?: number;
  limit?: number;
};

/** `GET /reports` — the triage queue, newest first, with per-status counts. */
export function listReportsRequest(query: ReportQuery) {
  return authedBackendJson("/reports", {
    query: {
      status: query.status,
      kind: query.kind,
      search: query.search,
      page: query.page,
      limit: query.limit,
    },
    responseSchema: reportListSchema,
  });
}

/** `GET /reports/:reportId` — one case. */
export function getReportRequest(reportId: string) {
  return authedBackendJson(`/reports/${reportId}`, {
    responseSchema: reportResponseSchema,
  });
}

/** `PATCH /reports/:reportId` — the disposition, and the note the reporter reads. */
export function updateReportRequest(
  reportId: string,
  body: { status?: ReportStatus; resolutionNote?: string },
) {
  return authedBackendJson(`/reports/${reportId}`, {
    method: "PATCH",
    body,
    responseSchema: reportResponseSchema,
  });
}
