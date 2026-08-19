import Link from "next/link";

import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 text-center">
      <div className="max-w-[340px]">
        <p className="field-label mb-2">404</p>
        <h1 className="text-lg font-semibold text-ink">No such case</h1>
        <p className="mt-1.5 text-13 leading-relaxed text-ink-soft">
          That report does not exist, or the link lost a character on the way here.
        </p>
        <Link href="/reports" className={buttonClasses({ className: "mt-5" })}>
          Back to the docket
        </Link>
      </div>
    </main>
  );
}
