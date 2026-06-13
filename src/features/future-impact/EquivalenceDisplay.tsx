"use client";

import { motion } from "framer-motion";
import type { CarbonEquivalency } from "@/types";

interface EquivalenceDisplayProps {
  equivalencies: CarbonEquivalency[];
  savedKgCO2e: number;
}

export function EquivalenceDisplay({
  equivalencies,
  savedKgCO2e,
}: EquivalenceDisplayProps) {
  if (savedKgCO2e <= 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No savings to display yet. Add more changes to see equivalencies.
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
      role="list"
      aria-label="Carbon saving equivalencies"
    >
      {equivalencies.map((equiv, i) => (
        <motion.div
          key={equiv.type}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50 text-center card-hover"
          role="listitem"
        >
          <span className="text-3xl" aria-hidden="true">
            {equiv.icon}
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">
              {equiv.value.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {equiv.unit}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{equiv.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
