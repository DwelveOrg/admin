import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-[38ch]">
        <p className="figure text-count text-t3">404</p>
        <h1 className="mt-2 text-lg font-bold tracking-[-0.015em] text-t1">No such case</h1>
        <p className="mt-1.5 text-13 leading-relaxed text-t2">
          That report does not exist, or the link lost a character on the way here.
          Case idents are six hex characters — <span className="ident">R-8F3A21</span> —
          and are a label rather than an address.
        </p>
        <Link href="/reports" className={buttonClasses({ className: "mt-5" })}>
          Back to the board
        </Link>
      </div>
    </main>
  );
}
