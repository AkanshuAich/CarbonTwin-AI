"use client";

import { motion } from "framer-motion";
import type { CarbonFootprint } from "@/types";
import { formatCO2, getCategoryColor } from "@/utils";

interface CategoryChangeBreakdownProps {
  baseline: CarbonFootprint;
  projected: CarbonFootprint;
}

import { CATEGORY_CONFIG } from "@/constants";

export function CategoryChangeBreakdown({
  baseline,
  projected,
}: CategoryChangeBreakdownProps) {
  return (
    <div className="space-y-4" role="list" aria-label="Category-by-category impact breakdown">
      {CATEGORY_CONFIG.map(({ key, label, emoji }, i) => {
        const current = baseline.categories[key];
        const future = projected.categories[key];
        const saved = current - future;
        const percentSaved = current > 0 ? (saved / current) * 100 : 0;
        const color = getCategoryColor(key);
        const barWidth = Math.max(0, Math.min(100, (future / current) * 100));

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="space-y-1"
            role="listitem"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden="true">{emoji}</span>
                {label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs">
                  {formatCO2(current)} → {formatCO2(future)}
                </span>
                {saved > 0 && (
                  <span
                    className="text-emerald-400 text-xs font-semibold"
                    aria-label={`${Math.round(percentSaved)}% reduction in ${label}`}
                  >
                    -{Math.round(percentSaved)}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="relative h-2 rounded-full overflow-hidden bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(barWidth)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label}: ${Math.round(barWidth)}% of current`}
            >
              {/* Baseline bar (ghost) */}
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{ backgroundColor: color }}
              />
              {/* Future bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
