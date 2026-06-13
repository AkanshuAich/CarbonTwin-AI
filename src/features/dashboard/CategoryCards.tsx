"use client";

import { motion } from "framer-motion";
import type { CategoryFootprint } from "@/types";
import { formatCO2, getCategoryColor } from "@/utils";

interface CategoryCardsProps {
  categories: CategoryFootprint;
  total: number;
}

const CATEGORY_CONFIG = [
  {
    key: "transport" as const,
    label: "Transport",
    emoji: "🚗",
    tip: "Your biggest lever is usually switching to public transit or working from home",
  },
  {
    key: "diet" as const,
    label: "Diet & Food",
    emoji: "🥗",
    tip: "Going vegetarian can reduce food emissions by up to 50%",
  },
  {
    key: "energy" as const,
    label: "Home Energy",
    emoji: "⚡",
    tip: "Switching to renewable energy can slash this category dramatically",
  },
  {
    key: "shopping" as const,
    label: "Shopping",
    emoji: "🛍️",
    tip: "Buying less and recycling more are the easiest wins here",
  },
];

export function CategoryCards({ categories, total }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" role="list">
      {CATEGORY_CONFIG.map(({ key, label, emoji, tip }, i) => {
        const value = categories[key];
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const color = getCategoryColor(key);

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass rounded-2xl p-5 card-hover"
            role="listitem"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-2xl" aria-hidden="true">{emoji}</div>
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {Math.round(percentage)}%
              </span>
            </div>
            <p className="font-semibold text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold mb-3">{formatCO2(value)}</p>

            {/* Bar */}
            <div
              className="h-1.5 rounded-full bg-muted overflow-hidden mb-3"
              role="progressbar"
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label}: ${Math.round(percentage)}% of total footprint`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
