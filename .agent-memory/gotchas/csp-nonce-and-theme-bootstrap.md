# CSP Nonce and Theme Bootstrap

## Context

The console uses a strict nonce-based script policy and an inline pre-paint theme bootstrap. Losing
the nonce produces a full-viewport wrong-theme flash or blocks the intended dark character.

## Knowledge

`src/proxy.ts` creates a nonce per request, puts it in `script-src`, and forwards it as `x-nonce`.
`src/app/layout.tsx` reads that header and applies it to the inline theme script. Font variables stay
on `<html>` because `--stack-*` variables are declared at `:root`; moving the font variables to body
can make every custom stack invalid and silently fall back.

## Relevant files

- `src/proxy.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `DESIGN.md`

## Implications

Test the built response, not just JSX. Preserve nonce forwarding and script attributes. Keep the
font variables on `<html>` and verify both themes before completing layout/CSP work.
