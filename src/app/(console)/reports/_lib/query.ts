import {
  reportKindSchema,
  reportStatusSchema,
  type ReportKind,
  type ReportStatus,
} from "@/lib/reports/schemas";

export type DocketParams = {
  status?: ReportStatus;
  kind?: ReportKind;
  search?: string;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * The filters, read from the URL rather than from component state.
 *
 * The URL is the operator's place in the queue: a link to "the open bugs
 * mentioning export" is something they paste to a colleague, and a filter that
 * lived in React state could not be shared or reloaded. Anything unparseable is
 * dropped rather than rejected — a hand-edited query string should narrow the
 * docket or not, never produce an error page.
 */
export function readDocketParams(raw: RawSearchParams): DocketParams {
  const status = reportStatusSchema.safeParse(first(raw.status));
  const kind = reportKindSchema.safeParse(first(raw.kind));
  const search = first(raw.search)?.trim();
  const page = Number(first(raw.page));

  return {
    status: status.success ? status.data : undefined,
    kind: kind.success ? kind.data : undefined,
    search: search || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/**
 * A docket URL with some filters changed and the rest kept.
 *
 * Changing a filter always returns to page 1: page 3 of "open" is not page 3 of
 * "resolved", and carrying the number across lands the operator on an empty
 * list that looks like an empty queue.
 */
export function docketHref(
  current: DocketParams,
  changes: Partial<DocketParams> & { reportId?: string | null },
) {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();

  if (next.status) params.set("status", next.status);
  if (next.kind) params.set("kind", next.kind);
  if (next.search) params.set("search", next.search);

  const page = "page" in changes ? next.page : 1;
  if (page > 1) params.set("page", String(page));

  const base = changes.reportId === undefined ? "" : changes.reportId ? `/${changes.reportId}` : "";
  const query = params.toString();

  return `/reports${base}${query ? `?${query}` : ""}`;
}
