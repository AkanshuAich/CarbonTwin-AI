import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as kgCO2e with appropriate unit
 */
export function formatCO2(kgCO2e: number): string {
  if (kgCO2e >= 1000) {
    return `${(kgCO2e / 1000).toFixed(1)} tCO₂e`;
  }
  return `${Math.round(kgCO2e)} kgCO₂e`;
}

/**
 * Format a percentage with sign
 */
export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Clamp a number value between a minimum and maximum bound
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Get the Tailwind-compatible hex color for a carbon footprint category
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    transport: "#3b82f6",
    diet: "#f59e0b",
    energy: "#ef4444",
    shopping: "#a855f7",
  };
  return colors[category] ?? "#22c55e";
}

/**
 * Get carbon rank display config
 */
export function getRankConfig(rank: string): {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
} {
  const configs: Record<string, { label: string; color: string; bgColor: string; emoji: string }> = {
    excellent: {
      label: "Excellent",
      color: "#22c55e",
      bgColor: "rgba(34, 197, 94, 0.1)",
      emoji: "🌟",
    },
    good: {
      label: "Good",
      color: "#84cc16",
      bgColor: "rgba(132, 204, 22, 0.1)",
      emoji: "✅",
    },
    average: {
      label: "Average",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      emoji: "📊",
    },
    high: {
      label: "High Impact",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      emoji: "⚠️",
    },
    very_high: {
      label: "Very High",
      color: "#dc2626",
      bgColor: "rgba(220, 38, 38, 0.1)",
      emoji: "🚨",
    },
  };
  return configs[rank] ?? configs.average!;
}

/**
 * Strip dangerous HTML characters from user-provided text before sending to the AI
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 2000);
}
