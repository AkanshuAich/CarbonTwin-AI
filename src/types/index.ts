// ============================================================
// CarbonTwin AI — Global Types
// ============================================================

// ── User / Auth ──────────────────────────────────────────────
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

// ── Carbon Twin Profile ──────────────────────────────────────
export type TransportMode =
  | "car_petrol"
  | "car_diesel"
  | "car_electric"
  | "motorcycle"
  | "bus"
  | "metro"
  | "bicycle"
  | "walking";

export type DietType =
  | "vegan"
  | "vegetarian"
  | "pescatarian"
  | "omnivore_low"
  | "omnivore_medium"
  | "omnivore_high";

export type EnergySource = "grid" | "renewable" | "mixed";

export interface TransportHabits {
  primaryMode: TransportMode;
  weeklyKm: number;
  flightsPerYear: number;
  shortHaulFlights: number;
  longHaulFlights: number;
}

export interface DietHabits {
  type: DietType;
  meatMealsPerWeek: number;
  dairyServingsPerDay: number;
  localFoodPercentage: number; // 0-100
}

export interface EnergyHabits {
  monthlyKwh: number;
  energySource: EnergySource;
  hasAirConditioning: boolean;
  hasElectricHeating: boolean;
  householdSize: number;
}

export interface ShoppingHabits {
  newClothingItemsPerYear: number;
  electronicsPerYear: number;
  onlineOrdersPerMonth: number;
  recyclingPercentage: number; // 0-100
}

export interface CarbonTwinProfile {
  userId: string;
  transport: TransportHabits;
  diet: DietHabits;
  energy: EnergyHabits;
  shopping: ShoppingHabits;
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted: boolean;
}

// ── Carbon Footprint ─────────────────────────────────────────
export interface CategoryFootprint {
  transport: number; // kgCO2e/year
  diet: number;
  energy: number;
  shopping: number;
}

export interface CarbonFootprint {
  total: number; // kgCO2e/year
  monthly: number; // kgCO2e/month
  categories: CategoryFootprint;
  calculatedAt: Date;
}

// ── Simulation / Future Impact ───────────────────────────────
export type ScenarioChangeType =
  | "transport_mode_change"
  | "reduce_flights"
  | "work_from_home"
  | "diet_change"
  | "reduce_electricity"
  | "install_renewable"
  | "reduce_shopping"
  | "increase_recycling";

export interface ScenarioChange {
  type: ScenarioChangeType;
  label: string;
  description: string;
  icon: string;
  parameters: Record<string, number | string>;
  estimatedImpact?: number; // kgCO2e saved per year
}

export interface Scenario {
  id: string;
  name: string;
  changes: ScenarioChange[];
  baselineFootprint: CarbonFootprint;
  projectedFootprint: CarbonFootprint;
  savedKgCO2ePerYear: number;
  percentageReduction: number;
  equivalencies: CarbonEquivalency[];
  createdAt: Date;
}

export interface CarbonEquivalency {
  type: "trees" | "flights" | "driving" | "beef" | "coal";
  label: string;
  value: number;
  unit: string;
  icon: string;
}

// ── AI Recommendations ───────────────────────────────────────
export type PriorityLevel = "high" | "medium" | "low";
export type EffortLevel = "easy" | "moderate" | "hard";

export interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
  expectedCarbonImpact: number; // kgCO2e saved per year
  percentageImpact: number;
  priorityLevel: PriorityLevel;
  effortLevel: EffortLevel;
  category: keyof CategoryFootprint;
  actionSteps: string[];
  timeToImpact: string; // e.g., "Immediate", "Within 1 month"
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekOf: Date;
  summary: string;
  biggestSource: keyof CategoryFootprint;
  improvements: string[];
  recommendedActions: string[];
  footprintThisWeek: number; // kgCO2e
  comparedToPreviousWeek: number; // percentage change
  generatedAt: Date;
}

// ── Green Routes ─────────────────────────────────────────────
export type TravelMode = "driving" | "transit" | "bicycling" | "walking";

export interface RouteOption {
  mode: TravelMode;
  displayName: string;
  icon: string;
  durationMinutes: number;
  distanceKm: number;
  emissionsKgCO2e: number;
  cost?: number;
  recommended?: boolean;
  aiReason?: string;
}

export interface GreenRouteQuery {
  origin: string;
  destination: string;
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
}

// ── Chat / AI Coach ──────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── Dashboard Analytics ──────────────────────────────────────
export interface MonthlyData {
  month: string;
  transport: number;
  diet: number;
  energy: number;
  shopping: number;
  total: number;
}

export interface DashboardData {
  currentFootprint: CarbonFootprint;
  monthlyHistory: MonthlyData[];
  globalAverage: number;
  nationalAverage: number;
  rank: "excellent" | "good" | "average" | "high" | "very_high";
  score: number;
}

// ── API Response Wrappers ────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
