import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught this board's type scale.
 *
 * Without this it cannot tell `text-13` (a font size we defined) from
 * `text-violet-ink` (a colour), files them in the same conflict group, and
 * silently drops whichever came first. That is not a cosmetic problem: it is
 * what turned the primary button's label from white into near-black on violet,
 * a 1.9:1 contrast failure that every solid button on the board inherited,
 * while the range tabs lost their font size instead.
 *
 * Declaring the font-size members explicitly leaves every other `text-*` class
 * to the colour group, where it belongs.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["note", "13", "15", "figure", "count"] }],
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
