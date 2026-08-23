"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { mapActionError } from "@/lib/api/action-error";
import {
  removePlatformSchoolRequest,
  resetPlatformUserPasswordRequest,
  updatePlatformUserAccessRequest,
} from "./api";

export type PlatformActionState = { error?: string; savedAt?: number };

const idSchema = z.string().uuid();

export async function setUserAccessAction(
  _previous: PlatformActionState,
  formData: FormData,
): Promise<PlatformActionState> {
  const userId = idSchema.safeParse(formData.get("userId"));
  const blocked = formData.get("blocked") === "true";

  if (!userId.success) return { error: "That account could not be identified." };

  try {
    await updatePlatformUserAccessRequest(userId.data, blocked);
  } catch (error) {
    return { error: platformActionError(error, "Could not change this account’s access.") };
  }

  revalidatePath("/");
  revalidatePath("/users");
  revalidatePath(`/users/${userId.data}`);
  return { savedAt: Date.now() };
}

/**
 * The credential handover.
 *
 * This is the one action in the console whose *result* is the point rather than
 * its side effect, so it returns the password rather than revalidating a page
 * that could show it. Nothing here writes it anywhere: it goes to the component
 * that asked, which holds it in state and drops it when the operator is done.
 *
 * The paths are still revalidated — `auth.hasPassword` may have just flipped
 * for a Google-only account, and the directory should not go on saying it has
 * no password.
 */
export type PasswordActionState = {
  error?: string;
  issued?: {
    password: string;
    email: string;
    fullName: string;
    sessionsRevoked: number;
    hadGoogleOnly: boolean;
  };
};

export async function issueUserPasswordAction(
  _previous: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const userId = idSchema.safeParse(formData.get("userId"));

  if (!userId.success) return { error: "That account could not be identified." };

  try {
    const result = await resetPlatformUserPasswordRequest(userId.data);

    revalidatePath("/users");
    revalidatePath(`/users/${userId.data}`);

    return {
      issued: {
        password: result.password,
        email: result.user.email,
        fullName: result.user.fullName,
        sessionsRevoked: result.sessionsRevoked,
        hadGoogleOnly: result.hadGoogleOnly,
      },
    };
  } catch (error) {
    return { error: platformActionError(error, "Could not issue a new password.") };
  }
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
    return { error: platformActionError(error, "Could not deactivate this school.") };
  }

  revalidatePath("/");
  revalidatePath("/schools");
  revalidatePath(`/schools/${schoolId.data}`);
  return { savedAt: Date.now() };
}

const PLATFORM_ACTION_ERRORS = {
  scope: "Platform action",
  byStatus: {
    403: "Your platform admin access has been removed.",
    404: "This record is no longer available.",
  },
} as const;

function platformActionError(error: unknown, fallback: string) {
  return mapActionError(error, { ...PLATFORM_ACTION_ERRORS, fallback });
}
