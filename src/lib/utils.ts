import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught this console's type scale.
 *
 * Without this it cannot tell `text-13` (a font size we defined) from
 * `text-pen-ink` (a colour), files them in the same conflict group, and
 * silently drops whichever came first. That is not a cosmetic problem: it is
 * what once turned the primary button's label from white into near-black on
 * violet, a 1.9:1 contrast failure every solid button inherited, while the
 * range tabs lost their font size instead.
 *
 * Declaring the font-size members explicitly leaves every other `text-*` class
 * to the colour group, where it belongs. Every name here must match a
 * `--text-*` in globals.css; adding one there and not here re-opens the bug.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["note", "13", "15", "17", "figure", "count", "display"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
