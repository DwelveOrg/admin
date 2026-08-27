import { redirect } from "next/navigation";

import { CommandBar } from "@/components/console/CommandBar";
import { Aurora } from "@/components/ui/Aurora";
import { getOperator } from "@/lib/auth/session";
import { countOpenReports } from "@/lib/reports/api";

export const dynamic = "force-dynamic";

/**
 * The platform desk: a persistent route map, a quiet live queue trace, and the
 * route content. The page owns the scroll so browser history and restoration
 * stay predictable across long directories and case files.
 *
 * The shell scrolls as a whole rather than pinning the viewport height and
 * scrolling panes inside it. That is a change from the layout this replaced,
 * and it is the right one for these pages: the directory and the docket are
 * both long lists, and a page that scrolls normally is a page whose scrollbar
 * means what the operating system says it means.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const operator = await getOperator();

  // The proxy already redirected anyone without a session. This is the second
  // lock: a render that somehow reached here without one must not paint a shell
  // around an empty page.
  if (!operator) redirect("/login");

  // A shell-count failure costs the subtle field reading and sidebar badge, not
  // the page. Route content still reports its own API failure normally.
  const openReports = await countOpenReports().catch(() => null);

  return (
    <div className="relative min-h-dvh">
      <Aurora openReports={openReports ?? 0} />
      <CommandBar operator={operator.email} openReports={openReports} />
      <main className="pb-20 lg:pl-[15.5rem] lg:pb-0">{children}</main>
    </div>
  );
}
