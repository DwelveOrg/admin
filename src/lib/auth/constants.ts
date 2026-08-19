/**
 * A distinct cookie name from the product's `session`.
 *
 * If both apps ever sit on the same parent domain, a shared name would let one
 * app's cookie be presented to the other. They are different trust domains and
 * their credentials should not be interchangeable even by accident.
 */
export const SESSION_COOKIE_NAME = "dwelve_ops";

/** Fallback lifetime when a refresh token carries no readable `exp`. */
export const SESSION_DURATION_MS = 60 * 60 * 1000;

/** The only role that may hold a session in this application. */
export const REQUIRED_GLOBAL_ROLE = "SUPER_ADMIN" as const;
