import { BackendApiError, BackendResponseValidationError } from "@/lib/api/backend";
import { SessionExpiredError } from "@/lib/auth/backend";

export type ActionErrorOptions = {
  /** Message when nothing more specific applies. */
  fallback: string;
  /** Prefix for the console.error diagnostics lines. */
  scope?: string;
  /** Message for network-level failures (fetch refused, timed out). */
  unreachable?: string;
  /** Status-specific messages; takes precedence over the 400 body fallback. */
  byStatus?: Record<number, string>;
  /**
   * Login runs before any session exists, so a session-expiry error cannot
   * meaningfully occur there and its wording would mislead.
   */
  ignoreSessionExpiry?: boolean;
};

const UNREACHABLE = "Cannot reach the Dwelve API.";

/**
 * One error-to-message mapping for every server action.
 *
 * Three actions grew three copies of this ladder that had already drifted in
 * wording ("access removed" vs "sign out and back in"). The shape is the same
 * everywhere: a session-expiry message passes through untouched, known
 * statuses say something specific about the operator's situation, a rejected
 * 400 body carries the backend's own validation text, network failures get a
 * distinct sentence, and anything unexpected logs and falls back.
 */
export function mapActionError(error: unknown, options: ActionErrorOptions): string {
  const { fallback, scope = "Action", unreachable = UNREACHABLE } = options;

  if (!options.ignoreSessionExpiry && error instanceof SessionExpiredError) {
    return error.message;
  }

  if (error instanceof BackendApiError) {
    const mapped = options.byStatus?.[error.status];
    if (mapped) return mapped;
    if (error.status === 400) return error.message || fallback;
    return fallback;
  }

  if (error instanceof TypeError || (error as Error)?.name === "TimeoutError") {
    return unreachable;
  }

  if (error instanceof BackendResponseValidationError) {
    console.error(`${scope} response validation failed:`, error.issues);
    return fallback;
  }

  console.error(`${scope} failed:`, error);
  return fallback;
}
