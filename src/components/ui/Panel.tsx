import { cn } from "@/lib/utils";

/**
 * The console's primary solid container. A panel may hold a recessed well but
 * never another full panel; hierarchy comes from structure and contrast, not
 * repeated cards.
 *
 * `head` is a strip with a hairline under it, used when a panel needs to say
 * what it is and what its units are before it shows a reading.
 */
export function Panel({
  title,
  description,
  aside,
  head,
  footer,
  children,
  className,
  bodyClassName,
  as: Tag = "section",
}: {
  title?: string;
  description?: string;
  aside?: React.ReactNode;
  head?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: "section" | "div" | "article";
}) {
  const hasHead = Boolean(title || head);

  return (
    <Tag className={cn("surface flex min-w-0 flex-col overflow-hidden", className)}>
      {hasHead ? (
        <div className="flex flex-col gap-3 border-b border-edge px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
          {title ? (
            <div className="min-w-0">
              <h2 className="text-15 font-semibold tracking-[-0.015em] text-t1">{title}</h2>
              {description ? (
                <p className="mt-1 max-w-[62ch] text-13 leading-relaxed text-t2">
                  {description}
                </p>
              ) : null}
            </div>
          ) : (
            head
          )}
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      ) : null}

      <div className={cn("min-w-0 flex-1", bodyClassName ?? "p-5")}>{children}</div>

      {footer ? (
        <div className="border-t border-edge px-5 py-3">{footer}</div>
      ) : null}
    </Tag>
  );
}

/**
 * A recess for machine data, testimony, confirmation, or a compact inset list.
 */
export function PanelWell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-edge bg-panel-sunk px-3.5 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
