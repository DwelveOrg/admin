import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getOperator } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

/**
 * The operator shell: a single bar, and everything else is the work.
 *
 * There is no sidebar because there is nowhere else to go. A navigation rail
 * with one destination is furniture pretending to be structure — the docket's
 * own status rail is the only navigation this app has, and it belongs to the
 * queue rather than to the chrome.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();

  // The proxy already redirected anyone without a session. This is the second
  // lock: a render that somehow reached here without one must not paint a shell
  // around an empty page.
  if (!operator) redirect("/login");

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-paper text-ink">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-rule bg-file px-4 md:px-6">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <span className="text-sm font-semibold tracking-[-0.01em] text-ink">Dwelve</span>
          <span className="field-label">Operations</span>
        </div>

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
              className="cursor-pointer rounded-md px-2.5 py-1.5 text-13 font-medium text-ink-soft transition-colors hover:bg-wash hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
