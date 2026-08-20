import "server-only";

import { authedBackendJson } from "@/lib/auth/backend";
import {
  platformOverviewSchema,
  platformSchoolListSchema,
  platformSchoolResponseSchema,
  platformStudentListSchema,
  platformStudentResponseSchema,
} from "./schemas";

export type PlatformStudentQuery = {
  search?: string;
  status?: "ACTIVE" | "BLOCKED";
  page?: number;
  limit?: number;
};

export type PlatformSchoolQuery = {
  search?: string;
  status?: "ACTIVE" | "DEACTIVATED";
  page?: number;
  limit?: number;
};

export function getPlatformOverviewRequest(days = 30) {
  return authedBackendJson("/platform/overview", {
    query: { days },
    responseSchema: platformOverviewSchema,
  });
}

export function listPlatformStudentsRequest(query: PlatformStudentQuery) {
  return authedBackendJson("/platform/students", {
    query,
    responseSchema: platformStudentListSchema,
  });
}

export function updatePlatformStudentAccessRequest(userId: string, blocked: boolean) {
  return authedBackendJson(`/platform/students/${userId}/access`, {
    method: "PATCH",
    body: { blocked },
    responseSchema: platformStudentResponseSchema,
  });
}

export function listPlatformSchoolsRequest(query: PlatformSchoolQuery) {
  return authedBackendJson("/platform/schools", {
    query,
    responseSchema: platformSchoolListSchema,
  });
}

export function removePlatformSchoolRequest(schoolId: string) {
  return authedBackendJson(`/platform/schools/${schoolId}`, {
    method: "DELETE",
    responseSchema: platformSchoolResponseSchema,
  });
}
