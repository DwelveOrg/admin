import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { ConsoleNav } from "@/components/console/ConsoleNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getOperator } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

/**
 * The operator shell stays horizontal so the dense report docket and the wider
 * platform tables both keep the full viewport width.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();

  // The proxy already redirected anyone without a session. This is the second
  // lock: a render that somehow reached here without one must not paint a shell
  // around an empty page.
  if (!operator) redirect("/login");

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-paper text-ink">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-rule bg-file px-3 md:gap-5 md:px-6">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="text-sm font-semibold tracking-[-0.01em] text-ink">Dwelve</span>
          <span className="field-label hidden sm:inline">Operations</span>
        </div>

        <ConsoleNav />

        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="hidden max-w-[240px] truncate text-13 text-ink-soft sm:block"
            title={operator.email}
          >
            {operator.email}
          </span>
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-wash hover:text-ink lg:w-auto lg:px-2.5"
            >
              <LogOut className="size-3.5 lg:hidden" aria-hidden />
              <span className="hidden text-13 font-medium lg:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
