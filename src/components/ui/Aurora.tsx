import { cn } from "@/lib/utils";

/**
 * The signature: the field behind the glass, and the queue reading it carries.
 *
 * This is not ambience. `--pulse` is computed from the real number of open
 * reports, and it is what moves the room's colour temperature: at zero the
 * field sits cool — green-cyan, wide, slow — and as work stacks up it warms
 * toward amber and the drift tightens. An operator who opens this console gets
 * the answer to its first question (how much is waiting) from the wall colour
 * before they have read a single word, which is the one thing worth keeping
 * from the ruled board this replaced.
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

  // A loaded room is a busier room. The drift period shortens with the pulse,
  // so the field is not only warmer but visibly less settled — the same
  // information twice, in colour and in movement, for anyone who reads one more
  // easily than the other.
  const drift = 64 - pulse * 22;

  return (
    <>
      <div
        className={cn("aurora", className)}
        style={
          {
            "--pulse": pulse.toFixed(3),
            "--drift": `${drift.toFixed(1)}s`,
          } as React.CSSProperties
        }
        aria-hidden
      />
      {/* Grain over the gradients. Without it they band visibly on an 8-bit
          panel, which is the single thing that makes a field like this look
          cheap rather than deep. */}
      <div className="aurora-grain" aria-hidden />
    </>
  );
}
