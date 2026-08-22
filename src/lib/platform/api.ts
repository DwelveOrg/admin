import "server-only";

import { authedBackendJson } from "@/lib/auth/backend";
import {
  passwordResetResponseSchema,
  platformOverviewSchema,
  platformSchoolDetailSchema,
  platformSchoolListSchema,
  platformSchoolResponseSchema,
  platformUserListSchema,
  platformUserResponseSchema,
  schoolMemberListSchema,
  type DirectoryRole,
  type SchoolRole,
} from "./schemas";

export type PlatformUserQuery = {
  search?: string;
  status?: "ACTIVE" | "BLOCKED";
  role?: DirectoryRole;
  page?: number;
  limit?: number;
};

export type PlatformSchoolQuery = {
  search?: string;
  status?: "ACTIVE" | "DEACTIVATED";
  page?: number;
  limit?: number;
};

export type SchoolMemberQuery = {
  search?: string;
  role?: SchoolRole;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
};

export function getPlatformOverviewRequest(days = 30) {
  return authedBackendJson("/platform/overview", {
    query: { days },
    responseSchema: platformOverviewSchema,
  });
}

/** `GET /platform/users` — every account, filterable across both role systems. */
export function listPlatformUsersRequest(query: PlatformUserQuery) {
  return authedBackendJson("/platform/users", {
    query,
    responseSchema: platformUserListSchema,
  });
}

export function getPlatformUserRequest(userId: string) {
  return authedBackendJson(`/platform/users/${userId}`, {
    responseSchema: platformUserResponseSchema,
  });
}

export function updatePlatformUserAccessRequest(userId: string, blocked: boolean) {
  return authedBackendJson(`/platform/users/${userId}/access`, {
    method: "PATCH",
    body: { blocked },
    responseSchema: platformUserResponseSchema,
  });
}

/**
 * `POST /platform/users/:id/password` — issue a credential and return it once.
 *
 * POST rather than GET because it *creates* something. A GET would put a live
 * password in the browser's history, the server's access log, and any
 * intermediary that caches by method.
 */
export function resetPlatformUserPasswordRequest(userId: string) {
  return authedBackendJson(`/platform/users/${userId}/password`, {
    method: "POST",
    responseSchema: passwordResetResponseSchema,
  });
}

export function listPlatformSchoolsRequest(query: PlatformSchoolQuery) {
  return authedBackendJson("/platform/schools", {
    query,
    responseSchema: platformSchoolListSchema,
  });
}

export function getPlatformSchoolRequest(schoolId: string) {
  return authedBackendJson(`/platform/schools/${schoolId}`, {
    responseSchema: platformSchoolDetailSchema,
  });
}

export function listSchoolMembersRequest(schoolId: string, query: SchoolMemberQuery) {
  return authedBackendJson(`/platform/schools/${schoolId}/members`, {
    query,
    responseSchema: schoolMemberListSchema,
  });
}

export function removePlatformSchoolRequest(schoolId: string) {
  return authedBackendJson(`/platform/schools/${schoolId}`, {
    method: "DELETE",
    responseSchema: platformSchoolResponseSchema,
  });
}
