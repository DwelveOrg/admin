"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { BackendApiError, BackendResponseValidationError } from "@/lib/api/backend";
import { SessionExpiredError } from "@/lib/auth/backend";
import {
  removePlatformSchoolRequest,
  updatePlatformStudentAccessRequest,
} from "./api";

export type PlatformActionState = { error?: string; savedAt?: number };

const idSchema = z.string().uuid();

export async function setStudentAccessAction(
  _previous: PlatformActionState,
  formData: FormData,
): Promise<PlatformActionState> {
  const userId = idSchema.safeParse(formData.get("userId"));
  const blocked = formData.get("blocked") === "true";

  if (!userId.success) return { error: "That student account could not be identified." };

  try {
    await updatePlatformStudentAccessRequest(userId.data, blocked);
  } catch (error) {
    return { error: platformActionError(error, "Could not change this account’s access.") };
  }

  revalidatePath("/");
  revalidatePath("/students");
  return { savedAt: Date.now() };
}

export async function deleteSchoolAction(
  _previous: PlatformActionState,
  formData: FormData,
): Promise<PlatformActionState> {
  const schoolId = idSchema.safeParse(formData.get("schoolId"));

  if (!schoolId.success) return { error: "That school could not be identified." };

  try {
    await removePlatformSchoolRequest(schoolId.data);
  } catch (error) {
    return { error: platformActionError(error, "Could not delete this school.") };
  }

  revalidatePath("/");
  revalidatePath("/schools");
  return { savedAt: Date.now() };
}

function platformActionError(error: unknown, fallback: string) {
  if (error instanceof SessionExpiredError) return error.message;

  if (error instanceof BackendApiError) {
    if (error.status === 403) return "Your platform admin access has been removed.";
    if (error.status === 404) return "This record is no longer available.";
    if (error.status === 400) return error.message || fallback;
    return fallback;
  }

  if (error instanceof TypeError || (error as Error)?.name === "TimeoutError") {
    return "Cannot reach the Dwelve API.";
  }

  if (error instanceof BackendResponseValidationError) {
    console.error("Platform action response validation failed:", error.issues);
    return fallback;
  }

  console.error("Platform action failed:", error);
  return fallback;
}
