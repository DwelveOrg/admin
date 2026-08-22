import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn, initials } from "@/lib/utils";

/**
 * The page's own frame: a container width, and a heading that says what this
 * screen is before anything on it moves.
 *
 * 1520px rather than the old 1440: the directory tables carry more columns now,
 * and a wider measure is what stops the membership column from truncating on a
 * laptop. Prose inside is still capped separately — a wide page is not a licence
 * for a 200-character line.
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1520px] px-3 py-6 md:px-5 md:py-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  count,
  description,
  aside,
  back,
}: {
  title: string;
  count?: string;
  description?: string;
  aside?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back ? (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1.5 text-13 font-medium text-t2 transition-colors hover:text-t1"
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            {back.label}
          </Link>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="display text-figure text-t1">{title}</h1>
          {count ? <span className="text-13 text-t3">{count}</span> : null}
        </div>

        {description ? (
          <p className="mt-2 max-w-[64ch] text-13 leading-relaxed text-t2">{description}</p>
        ) : null}
      </div>

      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

/**
 * A person, at the size a list row can afford.
 *
 * Falls back to initials rather than to a generic silhouette: in a directory
 * where most accounts have no avatar, a column of identical grey heads is
 * noise, while a column of initials is scannable.
 */
export function Avatar({
  name,
  url,
  size = 36,
  className,
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-sm",
        "border border-edge bg-pen-wash text-note font-semibold text-pen",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {url ? (
        // Avatars come from the product's CDN at unknown dimensions, and
        // next/image would add an optimizer round trip per row for a 36px
        // square that is already the right size.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

/**
 * A school, at the size a list row can afford.
 *
 * Falls back to two letters rather than to a generic building glyph: in a
 * directory where most schools have no logo, a column of identical icons is
 * noise while a column of initials is scannable. Same reasoning as `Avatar`,
 * and deliberately the same shape so the two directories feel like one system.
 */
export function SchoolCrest({
  name,
  url,
  size = 36,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-edge bg-panel-sunk text-note font-semibold text-t2"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {url ? (
        // Logos come from the product's CDN at unknown dimensions, and
        // next/image would add an optimizer round trip per row for a 36px
        // square that is already the right size.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

/**
 * An empty state that teaches rather than announces a void.
 *
 * Filtered-to-nothing offers the way back; genuinely empty says where records
 * come from. The two are different situations and saying "no results" to both
 * wastes the only moment the operator is definitely reading.
 */
export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span
        aria-hidden
        className="mx-auto flex size-11 items-center justify-center rounded-md border border-edge bg-panel-sunk text-t3"
      >
        <Icon className="size-4.5" />
      </span>
      <p className="mt-4 text-15 font-semibold text-t1">{title}</p>
      {children ? (
        <div className="mx-auto mt-2 max-w-[42ch] text-13 leading-relaxed text-t2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

type Meta = {
  page: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export function Pager({
  pathname,
  params,
  meta,
  unit = "records",
}: {
  pathname: string;
  params: Record<string, string | number | undefined>;
  meta: Meta;
  unit?: string;
}) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-t border-edge px-4 py-3">
      <PageLink
        href={pageHref(pathname, params, Math.max(meta.page - 1, 1))}
        disabled={meta.page <= 1}
        label="Previous page"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Previous
      </PageLink>

      <span className="text-note text-t3">
        Page {meta.page} of {meta.totalPages} · {meta.total.toLocaleString()} {unit}
      </span>

      <PageLink
        href={pageHref(pathname, params, Math.min(meta.page + 1, meta.totalPages))}
        disabled={!meta.hasMore}
        label="Next page"
      >
        Next
        <ChevronRight className="size-3.5" aria-hidden />
      </PageLink>
    </div>
  );
}

function pageHref(
  pathname: string,
  values: Record<string, string | number | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...values, page })) {
    if (value !== undefined && String(value) !== "") params.set(key, String(value));
  }
  return `${pathname}?${params.toString()}`;
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    "inline-flex h-9 items-center gap-1.5 rounded-sm px-3 text-13 font-medium transition-colors duration-160",
    disabled
      ? "pointer-events-none text-t3 opacity-40"
      : "border border-edge text-t2 hover:border-edge-lit hover:bg-panel-sunk hover:text-t1",
  );

  // A dead end renders as a disabled control rather than a link that goes
  // nowhere — the latter is reachable by keyboard and answers with the page you
  // are already on.
  return disabled ? (
    <span aria-disabled="true" className={classes}>
      {children}
    </span>
  ) : (
    <Link href={href} aria-label={label} className={classes}>
      {children}
    </Link>
  );
}

/** Read a single value out of Next's `searchParams`, which may hand back arrays. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function pageParam(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
