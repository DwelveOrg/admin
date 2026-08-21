"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loginAction, type LoginState } from "@/lib/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="solid" disabled={pending} className="w-full justify-center">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoFocus
          required
          placeholder="you@dwelve.com"
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger-wash px-3 py-2 text-13 leading-relaxed text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
