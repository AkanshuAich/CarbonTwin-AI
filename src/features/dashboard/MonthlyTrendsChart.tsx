"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlyData } from "@/types";
import { formatCO2 } from "@/utils";
import { useTheme } from "next-themes";

interface MonthlyTrendsChartProps {
  data: MonthlyData[];
}

const AREAS = [
  { key: "transport", color: "#3b82f6", label: "Transport" },
  { key: "diet", color: "#f59e0b", label: "Diet" },
  { key: "energy", color: "#ef4444", label: "Energy" },
  { key: "shopping", color: "#a855f7", label: "Shopping" },
] as const;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{formatCO2(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-border mt-2 pt-2 flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-bold text-primary">{formatCO2(total)}</span>
      </div>
    </div>
  );
};

export const MonthlyTrendsChart = React.memo(function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const tickColor = isDark ? "#6ee7b7" : "#4b5563";

  return (
    <div role="img" aria-label="Area chart showing monthly carbon footprint trends by category over 6 months">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            {AREAS.map((area) => (
              <linearGradient
                key={area.key}
                id={`gradient-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v)}kg`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: isDark ? "#ecfdf5" : "#0a1a12", fontSize: "11px" }}>
                {value}
              </span>
            )}
          />
          {AREAS.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#gradient-${area.key})`}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
