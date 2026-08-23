"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Palette

   Recharts writes colours as SVG *presentation attributes* (`fill="…"`), and a
   presentation attribute does not resolve `var()`. Passing `var(--open)` there
   silently paints nothing. So the tokens are read off the document once on
   mount and re-read whenever the theme class flips, which keeps every stroke on
   the console's own palette in both characters without duplicating a hex
   anywhere but here.

   The initial values match `.dark` in globals.css exactly, because dark is the
   default character — so the server render and the first client render agree
   and hydration stays quiet.
   ------------------------------------------------------------------------ */

const TOKENS = [
  "t1",
  "t2",
  "t3",
  "edge",
  "edge-lit",
  "panel-solid",
  "panel-sunk",
  "pen",
  "open",
  "review",
  "resolved",
  "dismissed",
] as const;

type Token = (typeof TOKENS)[number];
export type ChartPalette = Record<Token, string>;

const DARK: ChartPalette = {
  t1: "#eef1f8",
  t2: "#9aa4bb",
  t3: "#778096",
  edge: "rgb(255 255 255 / 0.085)",
  "edge-lit": "rgb(255 255 255 / 0.18)",
  "panel-solid": "#12141d",
  "panel-sunk": "rgb(0 0 0 / 0.28)",
  pen: "#8b6cff",
  open: "#ffab5c",
  review: "#5ad4e6",
  resolved: "#5fdc9d",
  dismissed: "#97a2b9",
};

export function useChartPalette(): ChartPalette {
  const [palette, setPalette] = useState<ChartPalette>(DARK);

  useEffect(() => {
    const root = document.documentElement;

    const read = () => {
      const styles = getComputedStyle(root);
      const next = {} as ChartPalette;
      for (const token of TOKENS) {
        next[token] = styles.getPropertyValue(`--${token}`).trim() || DARK[token];
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

   A real control, not a colour key. Clicking a series mutes it; the rule that
   nothing carries its state in colour alone applies here too, so a muted series
   is struck through and drops its swatch to an outline rather than only fading.
   ------------------------------------------------------------------------ */

/**
 * The series swatch, shared by the legend, the readout and any distribution
 * list so they can never drift. The corner is deliberate: at 10px the radius
 * floor (`--r-xs`, 6px) rounds it into a dot, and a chart key needs to read as
 * a square of colour — hence the one sanctioned `--radius-swatch` token.
 */
export function ChartSwatch({ color, outlined = false }: { color: string; outlined?: boolean }) {
  return (
    <span
      aria-hidden
      className="size-2.5 shrink-0 rounded-swatch border"
      style={{
        borderColor: color,
        background: outlined ? "transparent" : color,
      }}
    />
  );
}

export function PanelLegend({
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
              "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-note font-medium",
              "transition-colors duration-160 hover:bg-panel-sunk",
              muted ? "text-t3 line-through decoration-1" : "text-t2",
            )}
          >
            <ChartSwatch color={item.color} outlined={muted} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The readout

   A panel lifted off the field. It reads every series at the day under the
   crosshair, including the ones sitting at zero — an absent row reads as "no
   data" when the truth is "none that day", and those are different answers.
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
    <div className="glass-raised min-w-[196px] rounded-md p-3">
      <p className="label text-t2">{label}</p>
      <ul className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2.5 text-13">
            <ChartSwatch color={row.color} />
            <span className="min-w-0 flex-1 truncate text-t2">{row.label}</span>
            <span className="font-semibold text-t1">{row.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {total ? (
        <div className="mt-2 flex items-center gap-2.5 border-t border-edge pt-2 text-13">
          <span className="min-w-0 flex-1 truncate text-t3">{total.label}</span>
          <span className="font-semibold text-t1">{total.value.toLocaleString()}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Shared Recharts axis dressing, so both trend plates are set the same way. */
export function axisProps(palette: ChartPalette) {
  return {
    tick: { fill: palette.t3, fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: palette.edge },
  } as const;
}
