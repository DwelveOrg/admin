"use client";

import { GraduationCap, Inbox, LayoutGrid, School } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const destinations = [
  { href: "/", label: "Board", icon: LayoutGrid },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/schools", label: "Schools", icon: School },
  { href: "/reports", label: "Reports", icon: Inbox },
] as const;

/**
 * The sections, as tabs clipped to the steel rail.
 *
 * The current one is an enamel block — the same material as the board below it,
 * so the tab reads as the surface you are standing on rather than as a
 * highlighted link. Colour is not doing this job; the material change is.
 */
export function ConsoleNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections" className="flex min-w-0 items-center gap-0.5">
      {destinations.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-13 transition-colors",
              "focus-visible:outline-offset-1",
              active
                ? "bg-board font-semibold text-ink"
                : "font-medium text-rail-soft hover:bg-white/10 hover:text-rail-ink",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="hidden md:inline">{label}</span>
            <span className="sr-only md:hidden">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
