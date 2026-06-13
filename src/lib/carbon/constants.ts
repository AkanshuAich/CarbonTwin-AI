// ============================================================
// Carbon Emission Factors — Based on IPCC AR6 & EPA data
// ============================================================

// Transport (kgCO2e per km)
export const TRANSPORT_EMISSION_FACTORS: Record<string, number> = {
  car_petrol: 0.192,
  car_diesel: 0.171,
  car_electric: 0.053,
  motorcycle: 0.116,
  bus: 0.089,
  metro: 0.041,
  bicycle: 0.0,
  walking: 0.0,
};

// Flights (kgCO2e per km, includes radiative forcing)
export const FLIGHT_SHORT_HAUL_KG_PER_KM = 0.255;
export const FLIGHT_LONG_HAUL_KG_PER_KM = 0.195;
export const SHORT_HAUL_AVG_KM = 1200;
export const LONG_HAUL_AVG_KM = 8000;

// Diet (kgCO2e per year)
export const DIET_EMISSION_FACTORS: Record<string, number> = {
  vegan: 1000,
  vegetarian: 1390,
  pescatarian: 1520,
  omnivore_low: 1710,
  omnivore_medium: 2450,
  omnivore_high: 3300,
};

// Additional diet modifiers (kgCO2e per unit)
export const MEAT_MEAL_KG_CO2E = 7.19; // per meal
export const DAIRY_SERVING_KG_CO2E = 0.636; // per serving
export const LOCAL_FOOD_SAVING_FACTOR = 0.002; // per 1% local

// Energy (kgCO2e per kWh)
export const ENERGY_EMISSION_FACTORS: Record<string, number> = {
  grid: 0.233, // UK average grid (use locale-appropriate)
  renewable: 0.034,
  mixed: 0.142,
};

// Shopping (kgCO2e per item/year)
export const CLOTHING_ITEM_KG_CO2E = 33.4;
export const ELECTRONICS_ITEM_KG_CO2E = 400;
export const ONLINE_ORDER_KG_CO2E = 0.5; // per delivery
export const RECYCLING_SAVING_FACTOR = 150; // max kgCO2e saved per year at 100%

// Global / National averages (kgCO2e per year)
export const GLOBAL_AVERAGE_KG_CO2E = 4800;
export const UK_AVERAGE_KG_CO2E = 5600;
export const US_AVERAGE_KG_CO2E = 14600;
export const INDIA_AVERAGE_KG_CO2E = 1900;
export const TARGET_KG_CO2E = 2000; // Paris Agreement compatible individual target

// Carbon Equivalencies
export const TREE_ABSORBS_KG_CO2E_PER_YEAR = 21;
export const SHORT_HAUL_FLIGHT_KG_CO2E = SHORT_HAUL_AVG_KM * FLIGHT_SHORT_HAUL_KG_PER_KM;
export const KM_DRIVEN_KG_CO2E = 0.192; // same as car_petrol
export const KG_BEEF_KG_CO2E = 27;
export const KG_COAL_KG_CO2E = 2.42;

// Route emission factors (kgCO2e per km)
export const ROUTE_EMISSION_FACTORS: Record<string, number> = {
  driving: 0.192,
  transit: 0.089,
  bicycling: 0.0,
  walking: 0.0,
};

// Score thresholds (kgCO2e / year)
export const SCORE_THRESHOLDS = {
  excellent: 2000,
  good: 3500,
  average: 5500,
  high: 8000,
  // above 8000 = very_high
};
