"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Palette

   Recharts writes colours as SVG *presentation attributes* (`fill="…"`), and a
   presentation attribute does not resolve `var()`. Passing `var(--open)` there
   silently paints nothing. So the tokens are read off the document once on
   mount and re-read whenever the theme class flips, which keeps every stroke on
   the board's own palette in both characters without duplicating hex anywhere
   but here.

   The initial values match `:root` in globals.css exactly, so the server render
   and the first client render agree and hydration stays quiet.
   ------------------------------------------------------------------------ */

const TOKENS = [
  "ink",
  "ink-soft",
  "ink-faint",
  "rule",
  "rule-soft",
  "tile",
  "wash",
  "violet",
  "open",
  "review",
  "resolved",
  "dismissed",
] as const;

type Token = (typeof TOKENS)[number];
export type BoardPalette = Record<Token, string>;

const LIGHT: BoardPalette = {
  ink: "#1a1d1f",
  "ink-soft": "#4c5457",
  "ink-faint": "#646c6f",
  rule: "#c6ccca",
  "rule-soft": "#dde2e0",
  tile: "#ffffff",
  wash: "#e7eae9",
  violet: "#4c25e5",
  open: "#b04713",
  review: "#0b6d79",
  resolved: "#2c7a45",
  dismissed: "#5e6a6b",
};

export function useBoardPalette(): BoardPalette {
  const [palette, setPalette] = useState<BoardPalette>(LIGHT);

  useEffect(() => {
    const root = document.documentElement;

    const read = () => {
      const styles = getComputedStyle(root);
      const next = {} as BoardPalette;
      for (const token of TOKENS) {
        next[token] = styles.getPropertyValue(`--${token}`).trim() || LIGHT[token];
      }
      setPalette(next);
    };

    read();

    // The theme toggle writes a class on <html> rather than holding React
    // state, so this is how the charts hear about it.
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/* --------------------------------------------------------------------------- */

export type Series = {
  key: string;
  label: string;
  color: string;
};

/** "12 Aug" — the axis and readout format. UTC because the API sends dates, not moments. */
export function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

/** "Wed 12 Aug 2026" — the readout's own heading, where there is room to be exact. */
export function formatFullDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

/* ---------------------------------------------------------------------------
   The legend

   A real control, not a colour key. Clicking a series mutes it; the board's
   rule that nothing carries its state in colour alone applies here too, so a
   muted series is struck through and drops its swatch to an outline rather
   than only fading.
   ------------------------------------------------------------------------ */

export function PlateLegend({
  series,
  hidden,
  onToggle,
  className,
}: {
  series: Series[];
  hidden: Set<string>;
  onToggle: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-1", className)}>
      {series.map((item) => {
        const muted = hidden.has(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            aria-pressed={!muted}
            title={muted ? `Show ${item.label}` : `Hide ${item.label}`}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-1.5 py-1 text-note font-medium",
              "transition-colors duration-150 hover:bg-wash",
              muted ? "text-ink-faint line-through decoration-1" : "text-ink-soft",
            )}
          >
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[1px] border"
              style={{
                borderColor: item.color,
                background: muted ? "transparent" : item.color,
              }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The readout

   A tile picked up off the board. It reads every series at the day under the
   crosshair, including the ones sitting at zero — an absent row reads as "no
   data" when the truth is "none that day", and on this board those are
   different answers.
   ------------------------------------------------------------------------ */

export function Readout({
  label,
  rows,
  total,
}: {
  label: string;
  rows: Array<{ key: string; label: string; color: string; value: number }>;
  total?: { label: string; value: number };
}) {
  return (
    <div className="min-w-[184px] rounded-md border border-rule bg-tile p-2.5 shadow-lift-2">
      <p className="board-label text-ink-soft">{label}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2 text-13">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[1px]"
              style={{ background: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{row.label}</span>
            <span className="font-semibold text-ink">{row.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {total ? (
        <div className="mt-1.5 flex items-center gap-2 border-t border-rule-soft pt-1.5 text-13">
          <span className="min-w-0 flex-1 truncate text-ink-faint">{total.label}</span>
          <span className="font-semibold text-ink">{total.value.toLocaleString()}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Shared Recharts axis dressing, so both trend plates are set the same way. */
export function axisProps(palette: BoardPalette) {
  return {
    tick: { fill: palette["ink-faint"], fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: palette.rule },
  } as const;
}
