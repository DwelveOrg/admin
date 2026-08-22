"use client";

import Link from "next/link";
import { useId } from "react";

import { cn } from "@/lib/utils";
import { useCountUp, useSpotlight } from "./interaction";

/**
 * A standing total, as a lit instrument panel.
 *
 * Four of these open the console, and between them they answer "is anything
 * different today". Each carries three things and no more: the figure, its own
 * recent shape, and one line of context. A fourth would make the row a
 * dashboard to be studied rather than a bank of readings to be glanced at.
 */
export function Signal({
  label,
  value,
  note,
  delta,
  series,
  tone = "neutral",
  mark,
  href,
}: {
  label: string;
  value: number;
  note?: string;
  delta?: { value: number; unit: string };
  series?: number[];
  tone?: "neutral" | "open" | "review" | "resolved";
  mark?: React.ReactNode;
  href?: string;
}) {
  const { ref, onPointerMove } = useSpotlight<HTMLDivElement>();

  const body = (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "spotlight glass relative flex h-full flex-col overflow-hidden p-5",
        "transition-[border-color,transform] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        href && "hover:-translate-y-0.5 hover:border-edge-lit",
      )}
    >
      <p className="label flex items-center gap-2">
        {mark}
        {label}
      </p>

      <p className="mt-3 flex items-baseline gap-2.5">
        <Counter value={value} className={cn("figure text-count", TONE_INK[tone])} />
        {delta ? <Delta {...delta} /> : null}
      </p>

      {note ? <p className="mt-2 text-note text-t3">{note}</p> : null}

      {series && series.length > 1 ? (
        <Sparkline
          values={series}
          className={cn("mt-4 h-9 w-full", TONE_INK[tone])}
          label={`${label} over the selected range`}
        />
      ) : null}
    </div>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className="group block h-full rounded-lg focus-visible:outline-offset-2"
    >
      {body}
    </Link>
  );
}

const TONE_INK = {
  neutral: "text-t1",
  open: "text-open",
  review: "text-review",
  resolved: "text-resolved",
} as const;

function Counter({ value, className }: { value: number; className?: string }) {
  const shown = useCountUp(value);
  return <strong className={className}>{shown.toLocaleString()}</strong>;
}

/**
 * A change stated as an event, not as a judgement.
 *
 * A drawn caret carries the direction so the mark still reads without colour,
 * and the whole thing stays in text ink rather than going green-up / red-down —
 * borrowing a disposition colour to say "went up" would make more accounts look
 * like a resolved report.
 */
function Delta({ value, unit }: { value: number; unit: string }) {
  if (value === 0) {
    return <span className="text-note text-t3">No change {unit}</span>;
  }

  const up = value > 0;

  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-panel-sunk px-1.5 py-1 text-note font-medium text-t2">
      <svg viewBox="0 0 8 8" className="size-2 shrink-0" aria-hidden focusable="false">
        <path d={up ? "M4 1 7.2 6.4H0.8z" : "M4 7 0.8 1.6h6.4z"} fill="currentColor" />
      </svg>
      {Math.abs(value).toLocaleString()} {unit}
    </span>
  );
}

/**
 * The panel's own recent shape.
 *
 * Deliberately unlabelled and unscaled — it carries direction and volatility,
 * not values. Anything that needs to be read exactly is on the trend plates
 * below with axes and a crosshair, and putting numbers on a 36px-tall line
 * would only invite reading them.
 *
 * Colour comes from `currentColor` rather than a token: a `var()` in an SVG
 * presentation attribute paints nothing, and this way the line simply inherits
 * whatever ink the caller set.
 */
export function Sparkline({
  values,
  className,
  label,
}: {
  values: number[];
  className?: string;
  label: string;
}) {
  const width = 100;
  const height = 32;
  const max = Math.max(...values);
  const min = Math.min(...values);
  // A flat series must not divide by zero, and must not render as a line jammed
  // against the top of the box either — a span of 1 puts it through the middle.
  const span = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  // From useId, not from the label: two sparklines sharing a slug would share a
  // gradient id, and an SVG document resolves a duplicate id to whichever came
  // first — so the second chart would silently paint with the first one's ink.
  const gradientId = `spark${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
