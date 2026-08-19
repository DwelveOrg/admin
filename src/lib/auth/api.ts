import { z } from "zod";

import { backendJson } from "@/lib/api/backend";

/**
 * `globalRole` is **required** here, unlike the product frontend's permissive
 * `backendUserSchema`. This app admits nobody without reading it, so a response
 * that omits it is a response this app must refuse rather than default.
 */
export const globalRoleSchema = z.enum(["SUPER_ADMIN", "USER"]);

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const authResponseSchema = z
  .object({
    user: z
      .object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        globalRole: globalRoleSchema,
        isActive: z.boolean().optional(),
      })
      .passthrough(),
    tokens: authTokensSchema,
  })
  .passthrough();

export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;

export function loginRequest(input: { email: string; password: string }) {
  return backendJson("/auth/login", {
    method: "POST",
    body: { email: input.email, password: input.password },
    responseSchema: authResponseSchema,
  });
}

export function refreshTokensRequest(refreshToken: string) {
  return backendJson("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    responseSchema: authTokensSchema,
  });
}

export function logoutRequest(refreshToken: string) {
  return backendJson("/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}
