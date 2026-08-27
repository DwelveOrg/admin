import { cn } from "@/lib/utils";

/**
 * A restrained live trace behind the console.
 *
 * `--pulse` is computed from the real number of open reports. It changes a
 * narrow edge signal on an otherwise plain field; the queue still has an
 * ambient channel, but it no longer decorates or animates the whole page.
 *
 * It is deliberately not the *only* place that answer appears — every count is
 * also stated in text, and a field colour is a glance, not a readout. Nothing
 * here is load-bearing for someone who cannot see it.
 */

/**
 * The count at which the field is fully warm.
 *
 * Chosen from what this queue actually looks like rather than from a round
 * number: a platform team that has let two dozen reports stand has a backlog,
 * and past that point a hotter wall says nothing new. Below it the gradient is
 * genuinely readable — five open reports and twenty do not look alike.
 */
const SATURATION_POINT = 24;

export function Aurora({
  openReports = 0,
  className,
}: {
  openReports?: number;
  className?: string;
}) {
  const pulse = Math.max(0, Math.min(1, openReports / SATURATION_POINT));

  return (
    <div
      className={cn("aurora", className)}
      style={
        {
          "--pulse": pulse.toFixed(3),
        } as React.CSSProperties
      }
      aria-hidden
    />
  );
}
