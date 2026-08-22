"use client";

import { AlertTriangle, Check, Copy, Eye, EyeOff, KeyRound, RotateCw } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { PanelWell } from "@/components/ui/Panel";
import { issueUserPasswordAction } from "@/lib/platform/actions";
import { cn } from "@/lib/utils";

/**
 * The credential surface.
 *
 * There is no "show the password" here and there cannot be one. `User.passwordHash`
 * is a bcrypt hash: the plaintext an operator wants to read back was never
 * stored by anyone, so no permission, no role and no endpoint could produce it.
 * Saying that plainly on the screen is part of the design — an operator who
 * goes looking for a hidden reveal button and does not find one will assume
 * they lack access, which is the wrong conclusion.
 *
 * What the console can do is issue a new one. That is the honest version of the
 * request, and it is what the backend's own `admin:password` script has always
 * done for operators.
 *
 * The credential is shown exactly once, in the response to the action that
 * created it. Nothing persists it: it lives in this component's state and goes
 * when the operator dismisses it or navigates away. A reload does not bring it
 * back, and that is stated on the card rather than discovered.
 */
export function CredentialPanel({
  userId,
  email,
  hasPassword,
  hasGoogle,
  isOperator,
}: {
  userId: string;
  email: string;
  hasPassword: boolean;
  hasGoogle: boolean;
  isOperator: boolean;
}) {
  const [state, formAction, pending] = useActionState(issueUserPasswordAction, {});
  const [confirming, setConfirming] = useState(false);

  // A new credential closes the confirmation it came from, so the card that
  // replaces it is the only thing on screen. Derived rather than reset in an
  // effect: the issued credential already *is* the newer state, and syncing one
  // piece of state to another is how the two get to disagree for a render.
  const showConfirm = confirming && !state.issued;

  return (
    <section className="glass overflow-hidden" aria-labelledby="credentials-heading">
      <div className="flex items-center gap-2.5 border-b border-edge px-5 py-4">
        <KeyRound className="size-4 shrink-0 text-t3" aria-hidden />
        <h2 id="credentials-heading" className="text-15 font-semibold text-t1">
          Sign-in
        </h2>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="label">Login</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <p className="machine min-w-0 flex-1 truncate text-13 text-t1">{email}</p>
            <CopyButton value={email} label="login" />
          </div>
        </div>

        <div>
          <p className="label">Password</p>
          <p className="mt-1.5 text-13 leading-relaxed text-t2">
            {hasPassword
              ? "Set, and stored as a one-way hash. It cannot be read back — not here and not from the database."
              : hasGoogle
                ? "Not set. This account signs in with Google only."
                : "Not set. This account has no way to sign in."}
          </p>
        </div>

        {state.issued ? (
          <IssuedCredential
            password={state.issued.password}
            email={state.issued.email}
            sessionsRevoked={state.issued.sessionsRevoked}
            hadGoogleOnly={state.issued.hadGoogleOnly}
          />
        ) : isOperator ? (
          // Escalation stays on the command line, where it leaves a shell
          // history and a second person's fingerprints. An operator able to
          // reset another operator from inside the console is one compromised
          // session away from owning the platform.
          <PanelWell className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-t3" aria-hidden />
            <p className="text-13 leading-relaxed text-t2">
              This account is a platform admin. Reset it with{" "}
              <code className="machine text-t1">npm run admin:password</code> on the
              backend, so the change is made somewhere it can be audited.
            </p>
          </PanelWell>
        ) : showConfirm ? (
          <form action={formAction}>
            <input type="hidden" name="userId" value={userId} />
            <PanelWell className="space-y-3">
              <p className="text-13 leading-relaxed text-t1">
                Issue a new password for <strong>{email}</strong>?
              </p>
              <ul className="space-y-1.5 text-13 leading-relaxed text-t2">
                <li>Any password they already have stops working immediately.</li>
                <li>Every device they are signed in on is signed out.</li>
                <li>
                  The new password is shown once, here. You will need to pass it on
                  yourself — Dwelve does not email it.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" variant="primary" size="sm" disabled={pending}>
                  {pending ? (
                    <>
                      <RotateCw className="size-3.5 animate-spin" aria-hidden />
                      Issuing
                    </>
                  ) : (
                    "Issue new password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
              </div>
            </PanelWell>
          </form>
        ) : (
          <Button type="button" variant="glass" size="sm" onClick={() => setConfirming(true)}>
            <KeyRound className="size-3.5" aria-hidden />
            Issue new password
          </Button>
        )}

        {state.error ? (
          <p role="alert" className="text-13 text-danger">
            {state.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The one thing on this screen that exists for a single moment.
 *
 * It is deliberately the loudest object in the console — a lit violet card
 * where everything around it is glass — because it is the only state in the
 * whole application that cannot be returned to. Everything else here can be
 * re-read by reloading; this cannot, and the design has to say so before the
 * operator navigates away and finds out.
 *
 * Masked by default, revealed on purpose. An operator does this on a laptop in
 * a shared space often enough that a password painted on screen the instant a
 * page renders is a real hazard, and the reveal costs one click.
 */
function IssuedCredential({
  password,
  email,
  sessionsRevoked,
  hadGoogleOnly,
}: {
  password: string;
  email: string;
  sessionsRevoked: number;
  hadGoogleOnly: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);

  useEffect(() => {
    if (!copiedBoth) return;
    const timer = setTimeout(() => setCopiedBoth(false), 2000);
    return () => clearTimeout(timer);
  }, [copiedBoth]);

  return (
    <div
      className={cn(
        "rounded-md border border-pen/40 bg-pen-wash p-4",
        "shadow-[0_0_0_1px_var(--pen-glow),0_16px_40px_-16px_var(--pen-glow)]",
      )}
      role="status"
    >
      <p className="flex items-center gap-2 text-13 font-semibold text-t1">
        <Check className="size-4 shrink-0 text-pen" aria-hidden />
        New password issued
      </p>

      <p className="mt-2 text-13 leading-relaxed text-t2">
        Shown once. Close this card or leave the page and it is gone — Dwelve keeps
        no copy it could show you again.
      </p>

      <div className="mt-3.5 space-y-2">
        <Line label="Login" value={email} />

        <div className="flex items-center gap-2 rounded-sm border border-edge bg-panel-solid px-3 py-2.5">
          <span className="label w-16 shrink-0">Password</span>
          <code
            className={cn(
              "machine min-w-0 flex-1 text-13 text-t1",
              !revealed && "select-none blur-[5px]",
            )}
            aria-hidden={!revealed}
          >
            {password}
          </code>
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Reveal password"}
            className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-t3 transition-colors hover:bg-panel-sunk hover:text-t1"
          >
            {revealed ? (
              <EyeOff className="size-3.5" aria-hidden />
            ) : (
              <Eye className="size-3.5" aria-hidden />
            )}
          </button>
          <CopyButton value={password} label="password" />
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              .writeText(`Login: ${email}\nPassword: ${password}`)
              .then(() => setCopiedBoth(true))
              .catch(() => setCopiedBoth(false));
          }}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-edge bg-panel-solid px-3 text-13 font-medium text-t1 transition-colors hover:bg-panel-sunk"
        >
          {copiedBoth ? (
            <Check className="size-3.5 text-resolved" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {copiedBoth ? "Copied both" : "Copy both"}
        </button>

        <p className="text-note text-t3">
          {sessionsRevoked === 0
            ? "No active sessions to sign out"
            : `${sessionsRevoked} ${sessionsRevoked === 1 ? "session" : "sessions"} signed out`}
        </p>
      </div>

      {hadGoogleOnly ? (
        <p className="mt-3 flex items-start gap-2 text-note leading-relaxed text-t2">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-open" aria-hidden />
          This account signed in with Google and had no password. It now has both — the
          Google sign-in still works.
        </p>
      ) : null}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-sm border border-edge bg-panel-solid px-3 py-2.5">
      <span className="label w-16 shrink-0">{label}</span>
      <code className="machine min-w-0 flex-1 truncate text-13 text-t1">{value}</code>
      <CopyButton value={value} label={label.toLowerCase()} />
    </div>
  );
}
