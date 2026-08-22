import { redirect } from "next/navigation";

import { CommandBar } from "@/components/console/CommandBar";
import { Aurora } from "@/components/ui/Aurora";
import { getOperator } from "@/lib/auth/session";
import { countOpenReports } from "@/lib/reports/api";

export const dynamic = "force-dynamic";

/**
 * The room, and the rail it is read from.
 *
 * Three layers, back to front: the aurora field, which carries the queue
 * reading; the command rail floating over it; and the content, which scrolls
 * under the rail rather than beside it. The field is fixed and the page scrolls
 * over it, so the room stays one continuous thing however far down you are.
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

  // What the room is lit by. A failure here costs the field its reading, not
  // the page — an operator with a broken API still gets a console, and the
  // counts on it will tell them what the wall could not.
  const openReports = await countOpenReports().catch(() => 0);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Aurora openReports={openReports} />
      <CommandBar operator={operator.email} />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
