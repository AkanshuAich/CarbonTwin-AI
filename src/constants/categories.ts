/**
 * Shared category metadata used across dashboard, future-impact, and
 * onboarding features. Consolidates the duplicated CATEGORIES / CATEGORY_CONFIG
 * constants that previously existed in multiple component files.
 */
export const CATEGORY_CONFIG = [
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
] as const;

/** Union of category keys — use this instead of `string` wherever a category is expected */
export type CategoryKey = (typeof CATEGORY_CONFIG)[number]["key"];
