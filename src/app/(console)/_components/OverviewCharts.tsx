import type { PlatformOverview } from "@/lib/platform/schemas";

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const PADDING_X = 28;
const PADDING_Y = 22;

export function GrowthChart({ data }: { data: PlatformOverview["growth"] }) {
  const values = data.flatMap((point) => [point.usersJoined, point.schoolsJoined]);
  const max = Math.max(...values, 1);
  const userPoints = linePoints(data.map((point) => point.usersJoined), max);
  const schoolPoints = linePoints(data.map((point) => point.schoolsJoined), max);

  return (
    <ChartCard
      eyebrow="Acquisition"
      title="Joining rate"
      description="New accounts and new schools created each day."
      legend={[
        { label: "Users", color: "var(--violet)" },
        { label: "Schools", color: "var(--review)" },
      ]}
    >
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Daily user and school joining rate"
        className="h-[220px] w-full overflow-visible"
      >
        <ChartGrid max={max} />
        <polyline
          points={userPoints}
          fill="none"
          stroke="var(--violet)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={schoolPoints}
          fill="none"
          stroke="var(--review)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((point, index) => {
          const x = xAt(index, data.length);
          const userY = yAt(point.usersJoined, max);
          return (
            <circle key={point.date} cx={x} cy={userY} r="3" fill="var(--violet)">
              <title>
                {formatDate(point.date)}: {point.usersJoined} users, {point.schoolsJoined} schools
              </title>
            </circle>
          );
        })}
        <AxisDates dates={data.map((point) => point.date)} />
      </svg>
    </ChartCard>
  );
}

export function ActivityChart({ data }: { data: PlatformOverview["activity"] }) {
  const visible = data.slice(-14);
  const max = Math.max(
    ...visible.map(
      (point) => point.attemptsStarted + point.attemptsSubmitted + point.reportsFiled,
    ),
    1,
  );
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2;
  const plotWidth = CHART_WIDTH - PADDING_X * 2;
  const slot = plotWidth / Math.max(visible.length, 1);
  const barWidth = Math.min(slot * 0.6, 24);

  return (
    <ChartCard
      eyebrow="Engagement"
      title="Platform activity"
      description="Test starts, submissions, and reports across the last 14 days."
      legend={[
        { label: "Started", color: "var(--violet)" },
        { label: "Submitted", color: "var(--resolved)" },
        { label: "Reports", color: "var(--open)" },
      ]}
    >
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="Daily platform activity"
        className="h-[220px] w-full overflow-visible"
      >
        <ChartGrid max={max} />
        {visible.map((point, index) => {
          const x = PADDING_X + slot * index + (slot - barWidth) / 2;
          const segments = [
            { value: point.attemptsStarted, color: "var(--violet)" },
            { value: point.attemptsSubmitted, color: "var(--resolved)" },
            { value: point.reportsFiled, color: "var(--open)" },
          ];
          let usedHeight = 0;

          return (
            <g key={point.date}>
              {segments.map((segment, segmentIndex) => {
                const height = (segment.value / max) * plotHeight;
                usedHeight += height;
                return (
                  <rect
                    key={segmentIndex}
                    x={x}
                    y={CHART_HEIGHT - PADDING_Y - usedHeight}
                    width={barWidth}
                    height={height}
                    rx={segmentIndex === segments.length - 1 ? 2 : 0}
                    fill={segment.color}
                  />
                );
              })}
              <title>
                {formatDate(point.date)}: {point.attemptsStarted} starts, {point.attemptsSubmitted}{" "}
                submissions, {point.reportsFiled} reports
              </title>
            </g>
          );
        })}
        <AxisDates dates={visible.map((point) => point.date)} />
      </svg>
    </ChartCard>
  );
}

export function DistributionChart({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => ({
    ...item,
    length: total > 0 ? (item.value / total) * circumference : 0,
    offset:
      total > 0
        ? (items.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) / total) *
          circumference
        : 0,
  }));

  return (
    <section className="rounded-xl border border-rule bg-file p-5 shadow-file">
      <p className="field-label">{eyebrow}</p>
      <h2 className="mt-1.5 text-base font-semibold tracking-[-0.015em] text-ink">{title}</h2>
      <p className="mt-1 text-13 leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 140 140" role="img" aria-label={`${title}: ${total} total`}>
            <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--wash)" strokeWidth="16" />
            {segments.map((item) => {
              return (
                <circle
                  key={item.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={`${item.length} ${circumference - item.length}`}
                  strokeDashoffset={-item.offset}
                  transform="rotate(-90 70 70)"
                >
                  <title>
                    {item.label}: {item.value}
                  </title>
                </circle>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-xl font-semibold text-ink">{total.toLocaleString()}</strong>
            <span className="field-label">Total</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-13">
              <span className="size-2 rounded-full" style={{ background: item.color }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-ink-soft">{item.label}</span>
              <strong className="font-medium text-ink">{item.value.toLocaleString()}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ChartCard({
  eyebrow,
  title,
  description,
  legend,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  legend: Array<{ label: string; color: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-rule bg-file p-5 shadow-file">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="field-label">{eyebrow}</p>
          <h2 className="mt-1.5 text-base font-semibold tracking-[-0.015em] text-ink">{title}</h2>
          <p className="mt-1 text-13 leading-relaxed text-ink-soft">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-2xs text-ink-soft">
              <span className="size-2 rounded-full" style={{ background: item.color }} aria-hidden />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function ChartGrid({ max }: { max: number }) {
  return (
    <g aria-hidden>
      {[0, 0.5, 1].map((ratio) => {
        const y = PADDING_Y + (CHART_HEIGHT - PADDING_Y * 2) * ratio;
        const value = Math.round(max * (1 - ratio));
        return (
          <g key={ratio}>
            <line
              x1={PADDING_X}
              x2={CHART_WIDTH - PADDING_X}
              y1={y}
              y2={y}
              stroke="var(--rule-soft)"
              strokeWidth="1"
            />
            <text x="0" y={y + 4} fill="var(--ink-faint)" fontSize="10">
              {value}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AxisDates({ dates }: { dates: string[] }) {
  if (dates.length === 0) return null;
  const indexes = Array.from(new Set([0, Math.floor((dates.length - 1) / 2), dates.length - 1]));
  return (
    <g aria-hidden>
      {indexes.map((index) => (
        <text
          key={index}
          x={xAt(index, dates.length)}
          y={CHART_HEIGHT - 2}
          textAnchor={index === 0 ? "start" : index === dates.length - 1 ? "end" : "middle"}
          fill="var(--ink-faint)"
          fontSize="10"
        >
          {formatDate(dates[index])}
        </text>
      ))}
    </g>
  );
}

function linePoints(values: number[], max: number) {
  return values.map((value, index) => `${xAt(index, values.length)},${yAt(value, max)}`).join(" ");
}

function xAt(index: number, length: number) {
  if (length <= 1) return CHART_WIDTH / 2;
  return PADDING_X + (index / (length - 1)) * (CHART_WIDTH - PADDING_X * 2);
}

function yAt(value: number, max: number) {
  return CHART_HEIGHT - PADDING_Y - (value / max) * (CHART_HEIGHT - PADDING_Y * 2);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}
