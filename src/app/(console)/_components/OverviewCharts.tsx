"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import type { PlatformOverview } from "@/lib/platform/schemas";
import { Plate } from "./Plate";
import {
  axisProps,
  formatDay,
  formatFullDay,
  PlateLegend,
  Readout,
  useBoardPalette,
  type Series,
} from "./chart-kit";

/**
 * The observation plates.
 *
 * Recharts drives the two time series, where the work is real: a crosshair that
 * snaps to a day, a readout that names every series at that day, series you can
 * mute, drag-to-select a window, and a keyboard traversal that speaks. The
 * distribution ring below is hand-drawn instead — Recharts 3 removed `activeIndex`
 * from `Pie`, so a controlled lift plus a click-through to a filtered route would
 * be fighting the component rather than using it, and a four-segment ring is
 * thirty lines of SVG.
 *
 * Nothing here holds a colour of its own: `useBoardPalette` reads the board's
 * tokens off the document, so both characters and any future retint arrive here
 * without a second copy of the palette.
 */

const CHART_HEIGHT = 240;

/**
 * Recharts' mouse state, narrowed without reaching for `any`.
 *
 * Recharts 3 types both of these loosely — `activeLabel` is `string | number`
 * and `activeTooltipIndex` is `number | string | null` (its `TooltipIndex` is a
 * string). Checking for a number alone silently yields nothing on every hover,
 * which reads as "the feature does not work" rather than as a type mismatch, so
 * both accept either and coerce.
 */
function activeLabelOf(state: unknown): string | null {
  if (state && typeof state === "object" && "activeLabel" in state) {
    const value = (state as { activeLabel?: unknown }).activeLabel;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

function activeIndexOf(state: unknown): number | null {
  if (state && typeof state === "object" && "activeTooltipIndex" in state) {
    const value = (state as { activeTooltipIndex?: unknown }).activeTooltipIndex;
    if (typeof value === "number") return value;
    if (typeof value === "string" && value !== "") {
      const parsed = Number(value);
      return Number.isInteger(parsed) ? parsed : null;
    }
  }
  return null;
}

/** A Recharts tooltip payload row, narrowed the same way. */
type PayloadRow = { dataKey?: unknown; value?: unknown };

function payloadValue(payload: readonly PayloadRow[] | undefined, key: string) {
  const row = payload?.find((entry) => entry.dataKey === key);
  return typeof row?.value === "number" ? row.value : 0;
}

/* ===========================================================================
   Joining rate
   ======================================================================== */

export function GrowthChart({ data }: { data: PlatformOverview["growth"] }) {
  const palette = useBoardPalette();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Drag-to-select. `from`/`to` are the day labels under the pointer while the
  // drag is live; `range` is the committed window.
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [dragTo, setDragTo] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);

  const series: Series[] = useMemo(
    () => [
      { key: "usersJoined", label: "Accounts", color: palette.ink },
      { key: "schoolsJoined", label: "Schools", color: palette.review },
    ],
    [palette],
  );

  const visible = useMemo(
    () => (range ? data.slice(range.from, range.to + 1) : data),
    [data, range],
  );

  const clear = useCallback(() => {
    setRange(null);
    setDragFrom(null);
    setDragTo(null);
  }, []);

  // Esc gets you back to the whole window from anywhere, which is what an
  // operator reaches for after zooming into the wrong week.
  useEffect(() => {
    if (!range && !dragFrom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") clear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [range, dragFrom, clear]);

  const commitDrag = useCallback(() => {
    if (!dragFrom || !dragTo || dragFrom === dragTo) {
      setDragFrom(null);
      setDragTo(null);
      return;
    }

    const a = data.findIndex((point) => point.date === dragFrom);
    const b = data.findIndex((point) => point.date === dragTo);
    setDragFrom(null);
    setDragTo(null);
    if (a < 0 || b < 0) return;

    setRange({ from: Math.min(a, b), to: Math.max(a, b) });
  }, [data, dragFrom, dragTo]);

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <Plate
      title="Joining rate"
      description="New accounts and new schools created each day."
      aside={<PlateLegend series={series} hidden={hidden} onToggle={toggle} />}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-note">
          <span id="growth-plate-hint" className="text-ink-faint">
            {range
              ? `Reading ${formatDay(visible[0].date)} – ${formatDay(visible[visible.length - 1].date)}`
              : "Drag to select · ← → to step · Esc to reset"}
          </span>
          {range ? (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer rounded-sm px-1.5 py-0.5 font-medium text-violet transition-colors hover:bg-violet-wash"
            >
              Show all {data.length} days
            </button>
          ) : null}
        </div>
      }
    >
      {/* Dragging a window across the plate would otherwise select the axis
          labels under the pointer and leave them highlighted. */}
      <div className="select-none" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={visible}
            margin={{ top: 6, right: 6, bottom: 0, left: -18 }}
            // `accessibilityLayer` wires the arrow-key handler but does not make
            // the chart focusable, so without an explicit tabIndex the keyboard
            // path it advertises is unreachable.
            accessibilityLayer
            tabIndex={0}
            role="application"
            aria-label="Daily accounts and schools joined. Use the left and right arrow keys to step through days."
            aria-describedby="growth-plate-hint"
            onMouseDown={(state: unknown) => {
              const label = activeLabelOf(state);
              if (label) {
                setDragFrom(label);
                setDragTo(null);
              }
            }}
            onMouseMove={(state: unknown) => {
              if (!dragFrom) return;
              const label = activeLabelOf(state);
              if (label) setDragTo(label);
            }}
            onMouseUp={commitDrag}
            onMouseLeave={() => {
              setDragFrom(null);
              setDragTo(null);
            }}
            style={{ cursor: dragFrom ? "col-resize" : "crosshair" }}
          >
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={item.key}
                  id={`growth-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid stroke={palette["rule-soft"]} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              minTickGap={28}
              {...axisProps(palette)}
            />
            <YAxis width={52} allowDecimals={false} {...axisProps(palette)} />

            <Tooltip
              cursor={{ stroke: palette.ink, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={(props: { active?: boolean; label?: unknown; payload?: readonly PayloadRow[] }) => {
                if (!props.active || typeof props.label !== "string") return null;
                return (
                  <Readout
                    label={formatFullDay(props.label)}
                    rows={series
                      .filter((item) => !hidden.has(item.key))
                      .map((item) => ({
                        ...item,
                        value: payloadValue(props.payload, item.key),
                      }))}
                  />
                );
              }}
            />

            {series.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                hide={hidden.has(item.key)}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#growth-${item.key})`}
                // The focus commits: the day under the crosshair grows a real
                // marker rather than tinting the plate four percent.
                activeDot={{ r: 4, stroke: palette.tile, strokeWidth: 2, fill: item.color }}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {dragFrom && dragTo ? (
              <ReferenceArea
                x1={dragFrom}
                x2={dragTo}
                fill={palette.violet}
                fillOpacity={0.1}
                stroke={palette.violet}
                strokeOpacity={0.5}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Plate>
  );
}

/* ===========================================================================
   Platform activity
   ======================================================================== */

export function ActivityChart({
  data,
  totals,
  days,
}: {
  data: PlatformOverview["activity"];
  totals: PlatformOverview["summary"]["activity"];
  days: number;
}) {
  const palette = useBoardPalette();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const series: Series[] = useMemo(
    () => [
      { key: "attemptsStarted", label: "Started", color: palette.ink },
      { key: "attemptsSubmitted", label: "Submitted", color: palette.resolved },
      { key: "reportsFiled", label: "Reports", color: palette.open },
    ],
    [palette],
  );

  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const shown = series.filter((item) => !hidden.has(item.key));

  return (
    <Plate
      title="Platform activity"
      description="Tests started, tests submitted, and reports filed each day."
      aside={<PlateLegend series={series} hidden={hidden} onToggle={toggle} />}
      footer={
        <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-note">
          {[
            { label: "Started", value: totals.attemptsStarted },
            { label: "Submitted", value: totals.attemptsSubmitted },
            { label: "Reports", value: totals.reportsFiled },
          ].map((entry) => (
            <div key={entry.label} className="flex items-baseline gap-1.5">
              <dt className="text-ink-faint">{entry.label}</dt>
              <dd className="font-semibold text-ink">{entry.value.toLocaleString()}</dd>
            </div>
          ))}
          <span className="ml-auto text-ink-faint">over {days} days</span>
        </dl>
      }
    >
      <div className="select-none" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 6, right: 6, bottom: 0, left: -18 }}
            accessibilityLayer
            tabIndex={0}
            role="application"
            aria-label="Daily tests started, tests submitted and reports filed. Use the left and right arrow keys to step through days."
            barCategoryGap="18%"
            onMouseMove={(state: unknown) => setActiveIndex(activeIndexOf(state))}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid stroke={palette["rule-soft"]} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              minTickGap={28}
              {...axisProps(palette)}
            />
            <YAxis width={52} allowDecimals={false} {...axisProps(palette)} />

            <Tooltip
              cursor={{ fill: palette.wash, fillOpacity: 0.55 }}
              content={(props: { active?: boolean; label?: unknown; payload?: readonly PayloadRow[] }) => {
                if (!props.active || typeof props.label !== "string") return null;
                const rows = shown.map((item) => ({
                  ...item,
                  value: payloadValue(props.payload, item.key),
                }));
                return (
                  <Readout
                    label={formatFullDay(props.label)}
                    rows={rows}
                    total={{
                      label: "All events",
                      value: rows.reduce((sum, row) => sum + row.value, 0),
                    }}
                  />
                );
              }}
            />

            {shown.map((item, index) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                stackId="activity"
                fill={item.color}
                isAnimationActive={false}
                // Only the top segment of the stack takes the corner, so the
                // stack reads as one tile rather than three.
                radius={index === shown.length - 1 ? [2, 2, 0, 0] : undefined}
              >
                {data.map((point, pointIndex) => (
                  <Cell
                    key={point.date}
                    // The rest of the plate recedes while one day is being read.
                    fillOpacity={
                      activeIndex === null || activeIndex === pointIndex ? 1 : 0.32
                    }
                  />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Plate>
  );
}

/* ===========================================================================
   Distribution ring
   ======================================================================== */

export type DistributionItem = {
  label: string;
  value: number;
  color: string;
  href?: string;
  mark?: React.ReactNode;
};

const RING_SIZE = 148;
const RING_RADIUS = 58;
const RING_STROKE = 20;

export function DistributionChart({
  title,
  description,
  items,
  totalLabel,
}: {
  title: string;
  description: string;
  items: DistributionItem[];
  totalLabel: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * RING_RADIUS;

  const segments = items.map((item, index) => ({
    ...item,
    length: total > 0 ? (item.value / total) * circumference : 0,
    offset:
      total > 0
        ? (items.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) / total) *
          circumference
        : 0,
  }));

  const shown = items.find((item) => item.label === active);

  return (
    <Plate title={title} description={description}>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
        <div
          className="relative shrink-0"
          style={{ width: RING_SIZE, height: RING_SIZE }}
          onMouseLeave={() => setActive(null)}
        >
          {/* The list beside this ring states every value and is the keyboard
              and screen-reader path, so the ring itself is decoration of the
              data rather than the only way to reach it. */}
          <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="size-full" aria-hidden>
            {/* `stroke` is a presentation attribute and does not resolve
                `var()`, so every colour on this ring is set through `style`. */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              style={{ stroke: "var(--wash)" }}
              strokeWidth={RING_STROKE}
            />
            {segments.map((item) => {
              const isActive = active === item.label;
              const dimmed = active !== null && !isActive;

              return (
                <circle
                  key={item.label}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  // The hovered segment lifts off the ring; the rest recede.
                  strokeWidth={isActive ? RING_STROKE + 6 : RING_STROKE}
                  strokeOpacity={dimmed ? 0.3 : 1}
                  strokeDasharray={`${item.length} ${circumference - item.length}`}
                  strokeDashoffset={-item.offset}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  className={cn(
                    "transition-[stroke-width,stroke-opacity] duration-150",
                    item.href && "cursor-pointer",
                  )}
                  style={{ stroke: item.color, pointerEvents: "stroke" }}
                  onMouseEnter={() => setActive(item.label)}
                  onClick={() => item.href && router.push(item.href)}
                />
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <strong className="board-count text-figure">
              {(shown ? shown.value : total).toLocaleString()}
            </strong>
            <span className="board-label mt-1 max-w-full truncate">
              {shown ? shown.label : totalLabel}
            </span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 divide-y divide-rule-soft">
          {items.map((item) => {
            const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const isActive = active === item.label;

            const body = (
              <>
                {/* The disposition mark already carries this row's colour, so a
                    swatch beside it would say the same thing twice in the same
                    hue. Rows without a mark get the swatch instead. */}
                {item.mark ?? (
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[1px]"
                    style={{ background: item.color }}
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-13 text-ink-soft">{item.label}</span>
                <span className="text-note tabular-nums text-ink-faint">{share}%</span>
                <span className="w-14 text-right text-13 font-semibold tabular-nums text-ink">
                  {item.value.toLocaleString()}
                </span>
              </>
            );

            const rowClasses = cn(
              "flex items-center gap-2 rounded-sm px-1.5 py-2 transition-colors duration-150",
              isActive && "bg-wash",
            );

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(rowClasses, "hover:bg-wash")}
                    onMouseEnter={() => setActive(item.label)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(item.label)}
                    onBlur={() => setActive(null)}
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    className={rowClasses}
                    onMouseEnter={() => setActive(item.label)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Plate>
  );
}
