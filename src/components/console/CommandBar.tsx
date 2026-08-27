"use client";

import {
  CircleDot,
  LayoutDashboard,
  LogOut,
  School,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { CommandTrigger } from "./CommandPalette";
import { Sigil } from "./Sigil";

export const SECTIONS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/schools", label: "Schools", icon: School },
  { href: "/reports", label: "Reports", icon: Ticket },
] as const;

export function isSectionActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * A labeled route map on desktop and a compact destination dock on mobile.
 * These are links rather than tabs: each destination is a full, shareable
 * route, so browser history, keyboard navigation, and prefetching all work.
 */
export function CommandBar({
  operator,
  openReports,
}: {
  operator: string;
  openReports: number | null;
}) {
  const pathname = usePathname();
  const queueAvailable = openReports !== null;
  const hasOpenReports = queueAvailable && openReports > 0;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col border-r border-edge bg-panel lg:flex">
        <Link
          href="/"
          className="flex h-[4.75rem] items-center gap-3 border-b border-edge px-5 focus-visible:outline-offset-[-3px]"
        >
          <Sigil />
          <span className="min-w-0">
            <span className="block text-15 font-semibold tracking-[-0.02em] text-t1">
              Dwelve
            </span>
            <span className="block text-note text-t3">Operations console</span>
          </span>
        </Link>

        <div className="px-3 pt-4">
          <CommandTrigger wide enableShortcut />
        </div>

        <nav aria-label="Primary navigation" className="mt-5 px-3">
          <p className="label px-3 pb-2">Workspace</p>
          <div className="space-y-1">
            {SECTIONS.map((section) => (
              <SectionLink
                key={section.href}
                {...section}
                active={isSectionActive(section.href, pathname)}
                count={section.href === "/reports" ? openReports : undefined}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto p-3">
          <Link
            href="/reports?status=OPEN"
            className="topology-line block rounded-md border border-edge bg-panel-sunk p-3 transition-colors hover:border-edge-lit hover:bg-panel-raised"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-13 font-semibold text-t1">
                <CircleDot
                  className={cn(
                    "size-3.5",
                    !queueAvailable
                      ? "text-t3"
                      : hasOpenReports
                        ? "text-open"
                        : "text-resolved",
                  )}
                />
                Report queue
              </span>
              <strong
                className={cn(
                  "figure text-17",
                  !queueAvailable
                    ? "text-t3"
                    : hasOpenReports
                      ? "text-open"
                      : "text-resolved",
                )}
              >
                {queueAvailable ? openReports.toLocaleString() : "—"}
              </strong>
            </span>
            <span className="mt-1.5 block text-note text-t3">
              {!queueAvailable
                ? "Count unavailable"
                : openReports === 0
                  ? "Nothing needs triage"
                  : `${openReports === 1 ? "One case needs" : "Cases need"} attention`}
            </span>
          </Link>

          <div className="mt-3 flex items-center gap-1 border-t border-edge pt-3">
            <span className="min-w-0 flex-1 truncate px-2 text-note text-t3" title={operator}>
              {operator}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-edge bg-panel px-3 lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-sm pr-1">
          <Sigil compact />
          <span className="truncate text-13 font-semibold text-t1">Dwelve Operations</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <CommandTrigger enableShortcut={false} />
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-edge bg-panel px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = isSectionActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-sm px-1 text-note",
                active ? "font-semibold text-pen" : "font-medium text-t3",
              )}
            >
              {active ? <span className="absolute inset-x-5 top-0 h-0.5 bg-pen" /> : null}
              <span className="relative">
                <Icon className="size-4" aria-hidden />
                {href === "/reports" && hasOpenReports ? (
                  <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-open px-1 text-center text-note leading-5 text-white">
                    {openReports > 99 ? "99+" : openReports}
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function SectionLink({
  href,
  label,
  icon: Icon,
  active,
  count,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  count?: number | null;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-13 transition-colors",
        active
          ? "bg-pen-wash font-semibold text-t1"
          : "font-medium text-t2 hover:bg-panel-sunk hover:text-t1",
      )}
    >
      {active ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-pen" /> : null}
      <Icon className={cn("size-4 shrink-0", active ? "text-pen" : "text-t3 group-hover:text-t2")} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "min-w-6 rounded-full px-1.5 py-0.5 text-center text-note font-semibold",
            count === null
              ? "bg-panel-sunk text-t3"
              : count > 0
                ? "bg-open-wash text-open"
                : "bg-resolved-wash text-resolved",
          )}
        >
          {count === null ? "—" : count.toLocaleString()}
        </span>
      ) : null}
    </Link>
  );
}

function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm text-t2 transition-colors hover:bg-panel-sunk hover:text-t1"
      >
        <LogOut className="size-4" aria-hidden />
      </button>
    </form>
  );
}
