import { cn } from "@/lib/utils";

/**
 * A plate on the board — the observation chart clipped up beside the tiles.
 *
 * The header is a real strip with a rule under it, not a floating label: a
 * plate says what it is and what its units are, and then shows the reading.
 * There is no eyebrow above the title, because the title carries its own
 * weight and a second smaller label above it only says the same thing quieter.
 */
export function Plate({
  title,
  description,
  aside,
  footer,
  children,
  className,
  bodyClassName,
  as: Tag = "section",
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "section" | "div";
}) {
  return (
    <Tag className={cn("tile flex min-w-0 flex-col", className)}>
      <div className="flex flex-col gap-2.5 border-b border-rule px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-15 font-semibold tracking-[-0.01em] text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-[60ch] text-13 leading-normal text-ink-soft">
              {description}
            </p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>

      <div className={cn("min-w-0 flex-1", bodyClassName ?? "p-4")}>{children}</div>

      {footer ? <div className="border-t border-rule px-4 py-2.5">{footer}</div> : null}
    </Tag>
  );
}
