import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { ConsoleNav } from "@/components/console/ConsoleNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getOperator } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

/**
 * The board and the frame it hangs in.
 *
 * The rail is the board's steel frame, and it earns the darkness by doing the
 * one job a ward board's frame does: naming the shift. Who is on, where they
 * are, and the way out. Everything below it is enamel, so the tiles own the
 * field and no chrome competes with them.
 *
 * The shell stays horizontal so the dense report docket and the wider platform
 * tables both keep the full viewport width.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();

  // The proxy already redirected anyone without a session. This is the second
  // lock: a render that somehow reached here without one must not paint a shell
  // around an empty page.
  if (!operator) redirect("/login");

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-board text-ink">
      <header className="flex h-14 shrink-0 items-center gap-2 bg-rail px-3 md:gap-6 md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-15 font-bold tracking-[-0.01em] text-rail-ink">Dwelve</span>
          <span
            className="board-label hidden text-rail-soft sm:inline"
            // The board's own title, not a kicker: it names the room, and the
            // page headings below say what is on the board today.
          >
            Operations
          </span>
        </div>

        <ConsoleNav />

        <div className="ml-auto flex items-center gap-1">
          <span
            className="hidden max-w-[220px] truncate text-13 text-rail-soft lg:block"
            title={`Signed in as ${operator.email}`}
          >
            {operator.email}
          </span>
          <span className="mx-1 hidden h-5 w-px bg-rail-rule lg:block" aria-hidden />
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 text-13 font-medium text-rail-soft transition-colors hover:bg-white/10 hover:text-rail-ink focus-visible:outline-offset-1"
            >
              <LogOut className="size-3.5 lg:hidden" aria-hidden />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
