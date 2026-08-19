import { z } from "zod";

export const reportKindSchema = z.enum(["BUG", "FEEDBACK", "QUESTION"]);
export const reportStatusSchema = z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]);

export type ReportKind = z.infer<typeof reportKindSchema>;
export type ReportStatus = z.infer<typeof reportStatusSchema>;

/** Mirrors the backend's `UpdateIssueReportDto` cap. */
export const RESOLUTION_NOTE_MAX = 2000;

/**
 * The order a case moves through, and the order the rail renders. Not
 * alphabetical and not the enum's declaration order — it is the shape of the
 * work: what has not been looked at, what is being looked at, then the two ways
 * a case ends.
 */
export const REPORT_STATUSES: ReportStatus[] = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "DISMISSED",
];

export const REPORT_KINDS: ReportKind[] = ["BUG", "FEEDBACK", "QUESTION"];

export const STATUS_LABEL: Record<ReportStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const KIND_LABEL: Record<ReportKind, string> = {
  BUG: "Bug",
  FEEDBACK: "Feedback",
  QUESTION: "Question",
};

/** The two dispositions that close a case — and notify the person who filed it. */
export const TERMINAL_STATUSES: ReportStatus[] = ["RESOLVED", "DISMISSED"];

export const reportSchema = z
  .object({
    id: z.string(),
    kind: reportKindSchema,
    status: reportStatusSchema,
    message: z.string(),
    pageUrl: z.string().nullable().optional(),
    schoolRole: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    viewport: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    appVersion: z.string().nullable().optional(),
    screenshotUrl: z.string().nullable().optional(),
    resolutionNote: z.string().nullable().optional(),
    resolvedAt: z.union([z.string(), z.date()]).nullable().optional(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]).optional(),
    reporter: z
      .object({ id: z.string(), fullName: z.string(), email: z.string() })
      .nullable()
      .optional(),
    school: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  })
  .passthrough();

export type Report = z.infer<typeof reportSchema>;

export const reportListSchema = z.object({
  reports: z.array(reportSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
    counts: z.record(reportStatusSchema, z.number()),
  }),
});

export type ReportList = z.infer<typeof reportListSchema>;

export const reportResponseSchema = z.object({ report: reportSchema });
