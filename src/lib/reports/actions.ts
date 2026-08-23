"use server";

import { revalidatePath } from "next/cache";

import { mapActionError } from "@/lib/api/action-error";
import { updateReportRequest } from "./api";
import { RESOLUTION_NOTE_MAX, reportStatusSchema } from "./schemas";

export type DecisionState = { error?: string; savedAt?: number };

const GENERIC = "Could not save that decision. Try again.";
const UNREACHABLE = "Cannot reach the Dwelve API.";
const NO_LONGER_OPERATOR =
  "Your platform admin access has been removed. Sign out and back in.";

/**
 * Records a triage decision.
 *
 * The note is not an internal comment: it is delivered to the person who filed
 * the report when the status becomes RESOLVED or DISMISSED. The form says so at
 * the point of writing, and this action does nothing to soften it — it forwards
 * exactly what was typed.
 */
export async function saveDecisionAction(
  _previous: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reportId = String(formData.get("reportId") ?? "");
  const status = reportStatusSchema.safeParse(formData.get("status"));
  const note = String(formData.get("resolutionNote") ?? "").trim();

  if (!reportId) {
    return { error: GENERIC };
  }

  if (!status.success) {
    return { error: "Pick a disposition." };
  }

  if (note.length > RESOLUTION_NOTE_MAX) {
    return { error: `Keep the note under ${RESOLUTION_NOTE_MAX} characters.` };
  }

  try {
    await updateReportRequest(reportId, {
      status: status.data,
      // Always sent, so clearing the field clears the stored note. The backend
      // reads `""` as "set to null" and `undefined` as "leave alone", and the
      // form cannot express the latter.
      resolutionNote: note,
    });
  } catch (error) {
    return { error: decisionError(error) };
  }

  // The rail's counts and the row's status both moved.
  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);

  return { savedAt: Date.now() };
}

function decisionError(error: unknown) {
  return mapActionError(error, {
    scope: "Report update",
    fallback: GENERIC,
    unreachable: UNREACHABLE,
    byStatus: {
      // 403 here means the account lost SUPER_ADMIN while the page was open.
      // Say that plainly rather than presenting it as a transient failure to
      // retry.
      403: NO_LONGER_OPERATOR,
      404: "This report no longer exists.",
    },
  });
}
