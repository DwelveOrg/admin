import { z } from "zod";

const dateSchema = z.string();

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

export const schoolRoleSchema = z.enum(["ADMIN", "TEACHER", "STUDENT"]);
export type SchoolRole = z.infer<typeof schoolRoleSchema>;

/**
 * The directory's role vocabulary, spanning both of the platform's role
 * systems.
 *
 * `SUPER_ADMIN` is a *global* role and has no membership behind it;
 * `NO_SCHOOL` is the absence of one. They sit in the same list as the three
 * membership roles because an operator asks "what kind of person is this",
 * which is one question, not two.
 */
export const directoryRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "STUDENT",
  "NO_SCHOOL",
]);
export type DirectoryRole = z.infer<typeof directoryRoleSchema>;

export const DIRECTORY_ROLES: DirectoryRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "STUDENT",
  "NO_SCHOOL",
];

export const DIRECTORY_ROLE_LABEL: Record<DirectoryRole, string> = {
  SUPER_ADMIN: "Platform admins",
  ADMIN: "School admins",
  TEACHER: "Teachers",
  STUDENT: "Students",
  NO_SCHOOL: "No school yet",
};

export const SCHOOL_ROLE_LABEL: Record<SchoolRole, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

const membershipSchema = z.object({
  id: z.string(),
  role: schoolRoleSchema,
  isActive: z.boolean(),
  isOwner: z.boolean(),
  joinedAt: dateSchema,
  studentProfileId: z.string().nullable(),
  classCount: z.number(),
  school: z.object({
    id: z.string(),
    name: z.string(),
    isActive: z.boolean(),
  }),
});

export const platformUserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  globalRole: z.enum(["SUPER_ADMIN", "USER"]),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  /**
   * How the account signs in — never a credential.
   *
   * `hasPassword` is the backend answering "is there a hash to replace", which
   * is all it can answer: the hash is one-way and the plaintext was never
   * stored. See `CredentialPanel` for what the console does with that.
   */
  auth: z.object({
    hasPassword: z.boolean(),
    hasGoogle: z.boolean(),
  }),
  memberships: z.array(membershipSchema),
});

export type PlatformUser = z.infer<typeof platformUserSchema>;

export const platformUserListSchema = z.object({
  users: z.array(platformUserSchema),
  meta: paginationSchema,
});

export type PlatformUserList = z.infer<typeof platformUserListSchema>;

export const platformUserResponseSchema = z.object({ user: platformUserSchema });

/**
 * The response to issuing a credential.
 *
 * `password` is present exactly once, in this response, and is recoverable from
 * nowhere else. Nothing in this app persists it — see `CredentialPanel`, which
 * holds it in component state and drops it on unmount.
 */
export const passwordResetResponseSchema = z.object({
  user: z.object({ id: z.string(), fullName: z.string(), email: z.string() }),
  password: z.string(),
  sessionsRevoked: z.number(),
  hadGoogleOnly: z.boolean(),
  issuedAt: dateSchema,
});

export type PasswordResetResponse = z.infer<typeof passwordResetResponseSchema>;

export const platformSchoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  owner: z
    .object({ id: z.string(), fullName: z.string(), email: z.string() })
    .nullable(),
  counts: z.object({
    members: z.number(),
    classes: z.number(),
    tests: z.number(),
  }),
});

export type PlatformSchool = z.infer<typeof platformSchoolSchema>;

export const platformSchoolListSchema = z.object({
  schools: z.array(platformSchoolSchema),
  meta: paginationSchema,
});

export type PlatformSchoolList = z.infer<typeof platformSchoolListSchema>;

export const platformSchoolResponseSchema = z.object({ school: platformSchoolSchema });

export const platformSchoolDetailSchema = z.object({
  school: platformSchoolSchema,
  membershipDistribution: z.array(
    z.object({ role: schoolRoleSchema, count: z.number() }),
  ),
  counts: z.object({
    members: z.number(),
    classes: z.number(),
    tests: z.number(),
  }),
});

export type PlatformSchoolDetail = z.infer<typeof platformSchoolDetailSchema>;

export const schoolMemberSchema = z.object({
  id: z.string(),
  role: schoolRoleSchema,
  isActive: z.boolean(),
  isOwner: z.boolean(),
  canManageAdmins: z.boolean(),
  joinedAt: dateSchema,
  classCount: z.number(),
  user: z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    avatarUrl: z.string().nullable(),
    isActive: z.boolean(),
    globalRole: z.enum(["SUPER_ADMIN", "USER"]),
  }),
});

export type SchoolMember = z.infer<typeof schoolMemberSchema>;

export const schoolMemberListSchema = z.object({
  members: z.array(schoolMemberSchema),
  meta: paginationSchema,
});

export type SchoolMemberList = z.infer<typeof schoolMemberListSchema>;

export const platformOverviewSchema = z.object({
  range: z.object({ days: z.number(), from: dateSchema, to: dateSchema }),
  summary: z.object({
    users: z.object({
      total: z.number(),
      active: z.number(),
      blocked: z.number(),
      joined: z.number(),
    }),
    students: z.object({
      totalAccounts: z.number(),
      activeAccounts: z.number(),
    }),
    schools: z.object({
      total: z.number(),
      active: z.number(),
      deactivated: z.number(),
      joined: z.number(),
    }),
    activity: z.object({
      attemptsStarted: z.number(),
      attemptsSubmitted: z.number(),
      reportsFiled: z.number(),
    }),
    reports: z.object({ total: z.number(), open: z.number() }),
  }),
  growth: z.array(
    z.object({
      date: z.string(),
      usersJoined: z.number(),
      schoolsJoined: z.number(),
      totalUsers: z.number(),
      totalSchools: z.number(),
    }),
  ),
  activity: z.array(
    z.object({
      date: z.string(),
      attemptsStarted: z.number(),
      attemptsSubmitted: z.number(),
      reportsFiled: z.number(),
    }),
  ),
  membershipDistribution: z.array(
    z.object({ role: schoolRoleSchema, count: z.number() }),
  ),
  reportDistribution: z.array(
    z.object({
      status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
      count: z.number(),
    }),
  ),
});

export type PlatformOverview = z.infer<typeof platformOverviewSchema>;
