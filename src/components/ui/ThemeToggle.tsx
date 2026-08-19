"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "dwelve-ops-theme";

/**
 * Light for daytime triage, dark for the evening.
 *
 * Deliberately stateless. The inline script in the root layout resolves the
 * theme before first paint, and the two icons swap on the `dark` class in CSS —
 * so React holding a copy of "is it dark" would only be a second answer able to
 * disagree with the DOM's, and reading it back after mount would flash the wrong
 * icon on every load.
 *
 * The icon shows the *destination*, not the current state: a moon while you are
 * in light means clicking gives you dark. "Sun = you are in light mode" and
 * "sun = click for light mode" are both common and neither is guessable, so the
 * one that describes what the button does wins.
 */
export function ThemeToggle() {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);

    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // A blocked localStorage costs persistence, not the toggle.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch theme"
      title="Switch theme"
      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-wash hover:text-ink"
    >
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
