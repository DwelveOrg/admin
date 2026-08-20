"use client";

import { BarChart3, GraduationCap, Inbox, School } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const destinations = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/schools", label: "Schools", icon: School },
  { href: "/reports", label: "Reports", icon: Inbox },
] as const;

export function ConsoleNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Operations" className="flex min-w-0 items-center gap-0.5">
      {destinations.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-13 font-medium transition-colors",
              active
                ? "bg-violet-wash text-violet"
                : "text-ink-soft hover:bg-wash hover:text-ink",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="hidden md:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
