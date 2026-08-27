"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import type { PlatformOverview } from "@/lib/platform/schemas";
import { Panel } from "@/components/ui/Panel";
import {
  axisProps,
  ChartSwatch,
  formatDay,
  formatFullDay,
  PanelLegend,
  Readout,
  useChartPalette,
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
 * Nothing here holds a colour of its own: `useChartPalette` reads the board's
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
  const palette = useChartPalette();
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Drag-to-select. `from`/`to` are the day labels under the pointer while the
  // drag is live; `range` is the committed window.
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [dragTo, setDragTo] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);

  const series: Series[] = useMemo(
    () => [
      { key: "usersJoined", label: "Accounts", color: palette.t1 },
      { key: "schoolsJoined", label: "Schools", color: palette.review },
    ],
    [palette],
  );

  // The committed window is client state and outlives a query-string
  // navigation (`/?days=90` → `/?days=7` keeps this component mounted), so a
  // held range can exceed a shorter dataset. Clamp it during render — the
  // adjustment-from-state pattern React prescribes — instead of crashing on
  // an empty slice.
  const last = data.length - 1;
  let effective: { from: number; to: number } | null = null;
  if (range && last >= 0) {
    const from = Math.min(Math.max(range.from, 0), last);
    const to = Math.min(Math.max(range.to, from), last);
    effective = { from, to };
  }
  if (
    range &&
    (effective === null || effective.from !== range.from || effective.to !== range.to)
  ) {
    setRange(effective);
  }

  // Keyed on the clamped bounds, not on `effective` — that object is rebuilt
  // every render, so an identity dependency would never let the memo hit.
  const from = effective?.from ?? null;
  const to = effective?.to ?? null;
  const visible = useMemo(
    () => (from === null || to === null ? data : data.slice(from, to + 1)),
    [data, from, to],
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
    <Panel
      title="Joining rate"
      description="New accounts and new schools created each day."
      aside={<PanelLegend series={series} hidden={hidden} onToggle={toggle} />}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-note">
          <span id="growth-plate-hint" className="text-t3">
            {range && visible.length > 0
              ? `Reading ${formatDay(visible[0].date)} – ${formatDay(visible[visible.length - 1].date)}`
              : "Drag to select · ← → to step · Esc to reset"}
          </span>
          {range ? (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer rounded-sm px-1.5 py-0.5 font-medium text-pen transition-colors hover:bg-pen-wash"
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

            <CartesianGrid stroke={palette.edge} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              minTickGap={28}
              {...axisProps(palette)}
            />
            <YAxis width={52} allowDecimals={false} {...axisProps(palette)} />

            <Tooltip
              cursor={{ stroke: palette.t1, strokeWidth: 1, strokeDasharray: "3 3" }}
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
                activeDot={{ r: 4, stroke: palette["panel-solid"], strokeWidth: 2, fill: item.color }}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {dragFrom && dragTo ? (
              <ReferenceArea
                x1={dragFrom}
                x2={dragTo}
                fill={palette.pen}
                fillOpacity={0.1}
                stroke={palette.pen}
                strokeOpacity={0.5}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
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
  const palette = useChartPalette();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const series: Series[] = useMemo(
    () => [
      { key: "attemptsStarted", label: "Started", color: palette.t1 },
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
    <Panel
      title="Platform activity"
      description="Tests started, tests submitted, and reports filed each day."
      aside={<PanelLegend series={series} hidden={hidden} onToggle={toggle} />}
      footer={
        <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-note">
          {[
            { label: "Started", value: totals.attemptsStarted },
            { label: "Submitted", value: totals.attemptsSubmitted },
            { label: "Reports", value: totals.reportsFiled },
          ].map((entry) => (
            <div key={entry.label} className="flex items-baseline gap-1.5">
              <dt className="text-t3">{entry.label}</dt>
              <dd className="font-semibold text-t1">{entry.value.toLocaleString()}</dd>
            </div>
          ))}
          <span className="ml-auto text-t3">over {days} days</span>
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
            <CartesianGrid stroke={palette.edge} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              minTickGap={28}
              {...axisProps(palette)}
            />
            <YAxis width={52} allowDecimals={false} {...axisProps(palette)} />

            <Tooltip
              cursor={{ fill: palette["panel-sunk"], fillOpacity: 0.55 }}
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
    </Panel>
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
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Panel
      title={title}
      description={description}
      aside={
        <div className="text-right">
          <strong className="figure text-figure">{total.toLocaleString()}</strong>
          <span className="mt-1 block text-note text-t3">{totalLabel}</span>
        </div>
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-edge">
        {items.map((item) => {
          const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const body = (
            <>
              <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-2">
                {item.mark ?? <ChartSwatch color={item.color} />}
                <span className="truncate text-13 font-medium text-t2">{item.label}</span>
              </span>
              <span className="relative col-span-3 col-start-1 row-start-2 h-1.5 overflow-hidden rounded-full bg-panel-sunk sm:col-span-1 sm:col-start-2 sm:row-start-1">
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${share}%`, backgroundColor: item.color }}
                />
              </span>
              <span className="col-start-2 row-start-1 text-right text-note tabular-nums text-t3 sm:col-start-3">{share}%</span>
              <strong className="col-start-3 row-start-1 text-right text-13 tabular-nums text-t1 sm:col-start-4">
                {item.value.toLocaleString()}
              </strong>
            </>
          );
          const classes =
            "grid grid-cols-[minmax(0,1fr)_2.5rem_3.5rem] items-center gap-3 px-5 py-3 transition-colors hover:bg-panel-sunk sm:grid-cols-[minmax(7.5rem,1fr)_minmax(5rem,1.3fr)_2.5rem_3.5rem]";

          return (
            <li key={item.label}>
              {item.href ? (
                <Link href={item.href} className={classes}>
                  {body}
                </Link>
              ) : (
                <div className={classes}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
