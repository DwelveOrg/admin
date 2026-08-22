"use client";

import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "dwelve-ops-theme";

/**
 * Flips the room's lighting and remembers it.
 *
 * Exported rather than kept private because the command palette offers the same
 * thing, and two implementations of "switch theme" is two places for the
 * storage key to drift.
 */
export function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);

  try {
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    // A blocked localStorage costs persistence, not the toggle.
  }
}

/**
 * Night for the room's own character, day for working beside a light product.
 *
 * Deliberately stateless. The inline script in the root layout resolves the
 * theme before first paint and the two icons swap on the `dark` class in CSS —
 * so React holding a copy of "is it dark" would only be a second answer able to
 * disagree with the DOM's, and reading it back after mount would flash the
 * wrong icon on every load.
 *
 * The icon shows the *destination*, not the current state: a sun while the
 * lights are down means clicking brings them up. "Sun = you are in light mode"
 * and "sun = click for light mode" are both common and neither is guessable, so
 * the one that describes what the button does wins.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch theme"
      title="Switch theme"
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-sm text-t2 transition-colors duration-160 hover:bg-panel-sunk hover:text-t1 focus-visible:outline-offset-1"
    >
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
