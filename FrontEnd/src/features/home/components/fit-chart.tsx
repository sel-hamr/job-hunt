"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import type { Stats } from "@jobhunt/shared";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// One bar per fit label, filled with its meaning color, with a thin ink outline (DESIGN.md, part 6).
const BARS = [
  { key: "good_fit", label: "Good fit", fill: "var(--done)" },
  { key: "some_gaps", label: "Some gaps", fill: "var(--mustard-soft)" },
  { key: "big_gaps", label: "Big gaps", fill: "var(--pink)" },
  { key: "not_matched", label: "Not matched", fill: "var(--sheet)" },
] as const;

const config = { jobs: { label: "Jobs" } } satisfies ChartConfig;

export function FitChart({ byFit }: { byFit: Stats["jobs_by_fit"] }) {
  const rows = BARS.map((bar) => ({ label: bar.label, jobs: byFit[bar.key], fill: bar.fill }));

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full" aria-label="Jobs by fit label">
      <BarChart data={rows} margin={{ top: 20, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--grid)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--ink-2)" }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--ink-2)" }} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
        <Bar dataKey="jobs" stroke="var(--ink)" strokeWidth={1} isAnimationActive={false} maxBarSize={56}>
          {rows.map((row) => (
            <Cell key={row.label} fill={row.fill} />
          ))}
          <LabelList dataKey="jobs" position="top" fontSize={11} fill="var(--ink)" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
