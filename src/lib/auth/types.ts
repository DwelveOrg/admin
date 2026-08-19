/**
 * The operator session.
 *
 * Deliberately narrower than the product frontend's: no `schoolId`, `memberId`,
 * `schoolRole`, or `membershipCount`. Nothing in this app is school-scoped, and
 * a field that is never read is a field that can go stale and mislead.
 *
 * `globalRole` is the one addition. The frontend drops it from its session
 * entirely; here it is the whole basis for admission.
 */
export type GlobalRole = "SUPER_ADMIN" | "USER";

export type SessionPayload = {
  userId: string;
  email: string;
  fullName: string;
  globalRole: GlobalRole;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
};

export type Operator = {
  id: string;
  email: string;
  fullName: string;
};
