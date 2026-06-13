import type {
  CarbonTwinProfile,
  CarbonFootprint,
  CategoryFootprint,
  CarbonEquivalency,
  DashboardData,
  MonthlyData,
} from "@/types";
import {
  TRANSPORT_EMISSION_FACTORS,
  FLIGHT_SHORT_HAUL_KG_PER_KM,
  FLIGHT_LONG_HAUL_KG_PER_KM,
  SHORT_HAUL_AVG_KM,
  LONG_HAUL_AVG_KM,
  DIET_EMISSION_FACTORS,
  MEAT_MEAL_KG_CO2E,
  DAIRY_SERVING_KG_CO2E,
  LOCAL_FOOD_SAVING_FACTOR,
  ENERGY_EMISSION_FACTORS,
  CLOTHING_ITEM_KG_CO2E,
  ELECTRONICS_ITEM_KG_CO2E,
  ONLINE_ORDER_KG_CO2E,
  RECYCLING_SAVING_FACTOR,
  TREE_ABSORBS_KG_CO2E_PER_YEAR,
  SHORT_HAUL_FLIGHT_KG_CO2E,
  KM_DRIVEN_KG_CO2E,
  KG_BEEF_KG_CO2E,
  KG_COAL_KG_CO2E,
  SCORE_THRESHOLDS,
  GLOBAL_AVERAGE_KG_CO2E,
  UK_AVERAGE_KG_CO2E,
  TARGET_KG_CO2E,
} from "./constants";

/**
 * Calculate annual transport emissions in kgCO2e
 */
export function calculateTransportEmissions(
  profile: CarbonTwinProfile["transport"]
): number {
  const weeklyTransportKg =
    profile.weeklyKm * (TRANSPORT_EMISSION_FACTORS[profile.primaryMode] ?? 0.192);
  const annualTransportKg = weeklyTransportKg * 52;

  const shortHaulKg =
    profile.shortHaulFlights * SHORT_HAUL_AVG_KM * FLIGHT_SHORT_HAUL_KG_PER_KM;
  const longHaulKg =
    profile.longHaulFlights * LONG_HAUL_AVG_KM * FLIGHT_LONG_HAUL_KG_PER_KM;

  return Math.round(annualTransportKg + shortHaulKg + longHaulKg);
}

/**
 * Calculate annual diet emissions in kgCO2e
 */
export function calculateDietEmissions(
  profile: CarbonTwinProfile["diet"]
): number {
  const baseDietKg = DIET_EMISSION_FACTORS[profile.type] ?? 2450;

  // Additional meat meals on top of base diet
  const meatAdjustment =
    profile.meatMealsPerWeek * MEAT_MEAL_KG_CO2E * 52 * 0.3; // 30% additive (base already includes some)

  // Dairy adjustment
  const dairyKg = profile.dairyServingsPerDay * DAIRY_SERVING_KG_CO2E * 365;

  // Local food discount
  const localSaving = profile.localFoodPercentage * LOCAL_FOOD_SAVING_FACTOR * baseDietKg;

  return Math.max(
    0,
    Math.round(baseDietKg + meatAdjustment + dairyKg - localSaving)
  );
}

/**
 * Calculate annual energy emissions in kgCO2e
 */
export function calculateEnergyEmissions(
  profile: CarbonTwinProfile["energy"]
): number {
  const annualKwh = profile.monthlyKwh * 12;
  const emissionFactor = ENERGY_EMISSION_FACTORS[profile.energySource] ?? 0.233;
  const perPersonKwh = annualKwh / Math.max(1, profile.householdSize);
  return Math.round(perPersonKwh * emissionFactor);
}

/**
 * Calculate annual shopping emissions in kgCO2e
 */
export function calculateShoppingEmissions(
  profile: CarbonTwinProfile["shopping"]
): number {
  const clothingKg = profile.newClothingItemsPerYear * CLOTHING_ITEM_KG_CO2E;
  const electronicsKg = profile.electronicsPerYear * ELECTRONICS_ITEM_KG_CO2E;
  const deliveryKg = profile.onlineOrdersPerMonth * ONLINE_ORDER_KG_CO2E * 12;
  const recyclingSaving =
    (profile.recyclingPercentage / 100) * RECYCLING_SAVING_FACTOR;

  return Math.max(
    0,
    Math.round(clothingKg + electronicsKg + deliveryKg - recyclingSaving)
  );
}

/**
 * Calculate the complete carbon footprint from a Carbon Twin profile
 */
export function calculateCarbonFootprint(
  profile: CarbonTwinProfile
): CarbonFootprint {
  const categories: CategoryFootprint = {
    transport: calculateTransportEmissions(profile.transport),
    diet: calculateDietEmissions(profile.diet),
    energy: calculateEnergyEmissions(profile.energy),
    shopping: calculateShoppingEmissions(profile.shopping),
  };

  const total = Object.values(categories).reduce((sum, v) => sum + v, 0);

  return {
    total,
    monthly: Math.round(total / 12),
    categories,
    calculatedAt: new Date(),
  };
}

/**
 * Calculate human-friendly carbon equivalencies for a given kgCO2e saving
 */
export function calculateEquivalencies(
  kgCO2eSaved: number
): CarbonEquivalency[] {
  return [
    {
      type: "trees",
      label: "Trees planted annually",
      value: Math.round(kgCO2eSaved / TREE_ABSORBS_KG_CO2E_PER_YEAR),
      unit: "trees",
      icon: "🌳",
    },
    {
      type: "flights",
      label: "Short-haul flights avoided",
      value: parseFloat((kgCO2eSaved / SHORT_HAUL_FLIGHT_KG_CO2E).toFixed(1)),
      unit: "flights",
      icon: "✈️",
    },
    {
      type: "driving",
      label: "Km not driven by car",
      value: Math.round(kgCO2eSaved / KM_DRIVEN_KG_CO2E),
      unit: "km",
      icon: "🚗",
    },
    {
      type: "beef",
      label: "Kg of beef not produced",
      value: Math.round(kgCO2eSaved / KG_BEEF_KG_CO2E),
      unit: "kg",
      icon: "🥩",
    },
    {
      type: "coal",
      label: "Kg of coal not burned",
      value: Math.round(kgCO2eSaved / KG_COAL_KG_CO2E),
      unit: "kg",
      icon: "⚫",
    },
  ];
}

/**
 * Determine the carbon score rank for a given annual footprint
 */
export function getCarbonRank(
  annualKgCO2e: number
): DashboardData["rank"] {
  if (annualKgCO2e <= SCORE_THRESHOLDS.excellent) return "excellent";
  if (annualKgCO2e <= SCORE_THRESHOLDS.good) return "good";
  if (annualKgCO2e <= SCORE_THRESHOLDS.average) return "average";
  if (annualKgCO2e <= SCORE_THRESHOLDS.high) return "high";
  return "very_high";
}

/**
 * Get a 0-100 carbon score (higher = better)
 */
export function getCarbonScore(annualKgCO2e: number): number {
  const maxBad = 30000;
  const target = TARGET_KG_CO2E;
  const score = Math.max(0, Math.min(100, ((maxBad - annualKgCO2e) / (maxBad - target)) * 100));
  return Math.round(score);
}

/**
 * Generate simulated monthly history data for the dashboard
 * Uses a seeded pseudo-random so values are stable across page refreshes
 */
export function generateMonthlyHistory(
  currentFootprint: CarbonFootprint,
  months: number = 6
): MonthlyData[] {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Simple seeded LCG for deterministic "variance" — stable across refreshes
  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed + 1) * 10000;
    return 0.85 + (x - Math.floor(x)) * 0.3; // range [0.85, 1.15]
  };

  const now = new Date();
  const result: MonthlyData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[d.getMonth()] as string;
    // Use month index + category offset as seed for stable, varied values
    const monthSeed = d.getFullYear() * 12 + d.getMonth();
    const cats = currentFootprint.categories;

    const transport = Math.round((cats.transport / 12) * seededRandom(monthSeed));
    const diet = Math.round((cats.diet / 12) * seededRandom(monthSeed + 1));
    const energy = Math.round((cats.energy / 12) * seededRandom(monthSeed + 2));
    const shopping = Math.round((cats.shopping / 12) * seededRandom(monthSeed + 3));

    result.push({
      month,
      transport,
      diet,
      energy,
      shopping,
      total: transport + diet + energy + shopping,
    });
  }

  return result;
}

/**
 * Build full dashboard data from a profile
 */
export function buildDashboardData(profile: CarbonTwinProfile): DashboardData {
  const currentFootprint = calculateCarbonFootprint(profile);
  const monthlyHistory = generateMonthlyHistory(currentFootprint);

  return {
    currentFootprint,
    monthlyHistory,
    globalAverage: GLOBAL_AVERAGE_KG_CO2E,
    nationalAverage: UK_AVERAGE_KG_CO2E,
    rank: getCarbonRank(currentFootprint.total),
    score: getCarbonScore(currentFootprint.total),
  };
}
