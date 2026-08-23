"use client";

import { LayoutGrid, LogOut, School, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { CommandTrigger } from "./CommandPalette";

export const SECTIONS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/users", label: "Users", icon: Users },
  { href: "/schools", label: "Schools", icon: School },
  { href: "/reports", label: "Reports", icon: Ticket },
] as const;

export function isSectionActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The rail the console hangs from.
 *
 * It floats over the field rather than sitting on it — a sheet of glass with
 * the aurora visible through it, pinned to the top of the viewport. That is the
 * whole reason it is not a solid bar: a solid bar would cut the room in two and
 * the field would stop being one continuous thing behind the interface.
 *
 * The current section is marked by a lit pill rather than by colour alone: the
 * ground changes material *and* the label goes to full ink, so the state
 * survives being unable to see the violet.
 */
export function CommandBar({ operator }: { operator: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-5 md:pt-4">
      <div className="glass-raised mx-auto flex h-14 w-full max-w-[1520px] items-center gap-2 rounded-lg px-2.5 md:gap-4 md:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-sm pr-1 focus-visible:outline-offset-4"
        >
          <Sigil />
          <span className="hidden text-13 font-semibold tracking-[-0.01em] text-t1 sm:inline">
            Operations
          </span>
        </Link>

        <nav aria-label="Sections" className="flex min-w-0 items-center gap-0.5">
          {SECTIONS.map(({ href, label, icon: Icon }) => {
            const active = isSectionActive(href, pathname);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-sm px-2.5 text-13 transition-all duration-160",
                  "focus-visible:outline-offset-1",
                  active
                    ? "bg-panel-raised font-semibold text-t1 shadow-lit-top"
                    : "font-medium text-t2 hover:bg-panel-sunk hover:text-t1",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="hidden md:inline">{label}</span>
                <span className="sr-only md:hidden">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <CommandTrigger />
          <span className="mx-0.5 hidden h-5 w-px bg-edge lg:block" aria-hidden />
          <span
            className="hidden max-w-[200px] truncate text-note text-t3 xl:block"
            title={`Signed in as ${operator}`}
          >
            {operator}
          </span>
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm text-t2 transition-colors duration-160 hover:bg-panel-sunk hover:text-t1 focus-visible:outline-offset-1"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

/**
 * The mark.
 *
 * Four bars at the four acuity heights — not started, in hand, fixed, closed —
 * which is the same reading the aurora carries and the same one the docket
 * columns carry. The console has one idea and this is it, at 20px.
 */
function Sigil() {
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-pen shadow-lift-pen"
    >
      <svg viewBox="0 0 20 20" className="size-4 text-pen-ink" focusable="false">
        <g fill="currentColor">
          <rect x="2" y="12" width="3" height="6" rx="1.2" />
          <rect x="7" y="8" width="3" height="10" rx="1.2" />
          <rect x="12" y="5" width="3" height="13" rx="1.2" />
          <rect x="17" y="2" width="1.6" height="16" rx="0.8" opacity="0.55" />
        </g>
      </svg>
    </span>
  );
}
