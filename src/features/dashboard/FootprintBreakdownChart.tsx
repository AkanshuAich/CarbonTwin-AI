"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategoryFootprint } from "@/types";
import { formatCO2, getCategoryColor } from "@/utils";
import { useTheme } from "next-themes";

interface FootprintBreakdownChartProps {
  categories: CategoryFootprint;
}

const CATEGORIES = [
  { key: "transport" as const, label: "Transport" },
  { key: "diet" as const, label: "Diet" },
  { key: "energy" as const, label: "Energy" },
  { key: "shopping" as const, label: "Shopping" },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const dataPoint = payload[0];

  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-medium">{dataPoint.name}</p>
      <p className="text-primary">{formatCO2(dataPoint.value as number)}</p>
    </div>
  );
};

export const FootprintBreakdownChart = React.memo(function FootprintBreakdownChart({ categories }: FootprintBreakdownChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: categories[cat.key],
    color: getCategoryColor(cat.key),
  }));

  return (
    <div
      role="img"
      aria-label="Pie chart showing carbon footprint breakdown by category"
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: isDark ? "#ecfdf5" : "#0a1a12", fontSize: "12px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
