import { z } from "zod";

const dateSchema = z.string();

const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

export const platformStudentSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  globalRole: z.enum(["SUPER_ADMIN", "USER"]),
  isActive: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  memberships: z.array(
    z.object({
      id: z.string(),
      isActive: z.boolean(),
      joinedAt: dateSchema,
      studentProfileId: z.string().nullable(),
      classCount: z.number(),
      school: z.object({
        id: z.string(),
        name: z.string(),
        isActive: z.boolean(),
      }),
    }),
  ),
});

export type PlatformStudent = z.infer<typeof platformStudentSchema>;

export const platformStudentListSchema = z.object({
  students: z.array(platformStudentSchema),
  meta: paginationSchema,
});

export type PlatformStudentList = z.infer<typeof platformStudentListSchema>;

export const platformStudentResponseSchema = z.object({ student: platformStudentSchema });

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
    z.object({ role: z.enum(["ADMIN", "TEACHER", "STUDENT"]), count: z.number() }),
  ),
  reportDistribution: z.array(
    z.object({
      status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
      count: z.number(),
    }),
  ),
});

export type PlatformOverview = z.infer<typeof platformOverviewSchema>;
