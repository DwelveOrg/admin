import type { Metadata } from "next";
import { CircleDot, Info, Network, ShieldCheck } from "lucide-react";

import { Sigil } from "@/components/console/Sigil";
import { Aurora } from "@/components/ui/Aurora";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Dwelve Operations" };

const REASONS: Record<string, string> = {
  revoked: "This account no longer has platform admin access.",
  expired: "Your session expired. Sign in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const reasonParam = (await searchParams).reason;
  const reason = REASONS[Array.isArray(reasonParam) ? reasonParam[0] : (reasonParam ?? "")];

  return (
    <main className="relative flex min-h-dvh items-center px-4 py-10 sm:px-6">
      <Aurora />

      <div className="mx-auto grid w-full max-w-[980px] overflow-hidden rounded-lg border border-edge bg-panel shadow-lift-2 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="relative hidden min-h-[560px] overflow-hidden border-r border-edge bg-panel-sunk p-10 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <Sigil />
            <div>
              <p className="text-15 font-semibold text-t1">Dwelve</p>
              <p className="text-note text-t3">Operations console</p>
            </div>
          </div>

          <div className="my-auto max-w-[34rem]">
            <h1 className="display max-w-[13ch] text-[2.75rem] leading-[1.02] text-t1">
              The whole platform, one route away.
            </h1>
            <p className="mt-5 max-w-[56ch] text-15 leading-relaxed text-t2">
              Monitor activity, find any account or school, issue one-time credentials,
              and close the report queue without crossing into the product session.
            </p>

            <ul className="mt-8 grid gap-3 text-13 text-t2">
              <li className="flex items-center gap-3">
                <Network className="size-4 text-pen" aria-hidden />
                Cross-platform user and school lookup
              </li>
              <li className="flex items-center gap-3">
                <CircleDot className="size-4 text-open" aria-hidden />
                Report evidence and reporter-visible resolution notes
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-resolved" aria-hidden />
                Separate, platform-admin-only trust domain
              </li>
            </ul>
          </div>

          <p className="text-note leading-relaxed text-t3">
            This console does not share a session with the student and teacher product.
          </p>
        </section>

        <section className="flex min-h-[520px] flex-col justify-center p-6 sm:p-9 lg:min-h-[560px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Sigil />
            <div>
              <p className="text-15 font-semibold text-t1">Dwelve</p>
              <p className="text-note text-t3">Operations console</p>
            </div>
          </div>

          <h1 className="display text-figure text-t1">Sign in</h1>
          <p className="mt-2 text-13 leading-relaxed text-t2">
            Use a platform administrator account. School admin access is not enough.
          </p>

          {reason ? (
            <p
              role="status"
              className="mt-5 flex items-start gap-2 rounded-md border border-edge bg-panel-sunk px-3 py-2.5 text-13 leading-relaxed text-t2"
            >
              <Info className="mt-0.5 size-3.5 shrink-0 text-pen" aria-hidden />
              {reason}
            </p>
          ) : null}

          <div className="mt-6">
            <LoginForm />
          </div>

          <p className="mt-6 border-t border-edge pt-5 text-note leading-relaxed text-t3">
            Access is granted and revoked from the backend command line. There is no
            signup or password recovery on this screen.
          </p>
        </section>
      </div>
    </main>
  );
}
