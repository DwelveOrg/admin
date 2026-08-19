const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long ago, at triage resolution.
 *
 * Deliberately coarse and deliberately not a library: an operator needs to know
 * whether a report is minutes or days old, and "3d" answers that faster than
 * "3 days ago" in a column of forty rows. The exact timestamp is one hover away.
 */
export function shortAgo(value: string | Date): string {
  const then = value instanceof Date ? value : new Date(value);
  const elapsed = Date.now() - then.getTime();

  if (!Number.isFinite(elapsed)) return "—";
  if (elapsed < MINUTE) return "now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / DAY)}d`;

  return then.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** The full timestamp, for a title attribute and the case file header. */
export function fullTimestamp(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
