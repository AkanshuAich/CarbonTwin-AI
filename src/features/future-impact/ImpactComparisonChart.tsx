"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CarbonFootprint } from "@/types";
import { formatCO2, getCategoryColor } from "@/utils";
import { useTheme } from "next-themes";

interface ImpactComparisonChartProps {
  baseline: CarbonFootprint;
  projected: CarbonFootprint;
}

const CATEGORIES = ["transport", "diet", "energy", "shopping"] as const;

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
      <p className="font-semibold text-sm mb-2 capitalize">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{formatCO2(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function ImpactComparisonChart({
  baseline,
  projected,
}: ImpactComparisonChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    Current: baseline.categories[cat],
    Future: projected.categories[cat],
    color: getCategoryColor(cat),
  }));

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Bar chart comparing current and future carbon footprint by category"
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "#6ee7b7" : "#4b5563", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark ? "#6ee7b7" : "#4b5563", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 1000 * 10) / 10}t`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            formatter={(value) => (
              <span style={{ color: isDark ? "#ecfdf5" : "#0a1a12" }}>{value}</span>
            )}
          />
          <Bar
            dataKey="Current"
            name="Current"
            fill="#64748b"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Bar
            dataKey="Future"
            name="Future"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
