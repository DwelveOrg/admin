import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

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
}: {
  pathname: string;
  params: Record<string, string | number | undefined>;
  meta: Meta;
}) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-rule px-4 py-3">
      <PageLink
        href={pageHref(pathname, params, Math.max(meta.page - 1, 1))}
        disabled={meta.page <= 1}
        label="Previous page"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Previous
      </PageLink>
      <span className="text-2xs text-ink-faint">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
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
    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-13 font-medium",
    disabled ? "pointer-events-none text-ink-faint opacity-40" : "text-ink-soft hover:bg-wash",
  );

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
