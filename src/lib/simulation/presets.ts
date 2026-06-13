import type { ScenarioChange } from "@/types";

/**
 * Pre-defined lifestyle change presets for the Future Impact Explorer
 */
export const SCENARIO_PRESETS: ScenarioChange[] = [
  {
    type: "transport_mode_change",
    label: "Switch to Metro",
    description: "Replace car commuting with metro/subway transit",
    icon: "🚇",
    parameters: { newMode: "metro" },
  },
  {
    type: "transport_mode_change",
    label: "Switch to Bus",
    description: "Replace car trips with bus commuting",
    icon: "🚌",
    parameters: { newMode: "bus" },
  },
  {
    type: "transport_mode_change",
    label: "Switch to Electric Vehicle",
    description: "Replace petrol/diesel car with an EV",
    icon: "⚡",
    parameters: { newMode: "car_electric" },
  },
  {
    type: "transport_mode_change",
    label: "Cycle to Work",
    description: "Switch to cycling for your daily commute",
    icon: "🚲",
    parameters: { newMode: "bicycle" },
  },
  {
    type: "work_from_home",
    label: "WFH 1 Day/Week",
    description: "Work remotely one day per week to reduce commuting",
    icon: "🏠",
    parameters: { daysPerWeek: 1 },
  },
  {
    type: "work_from_home",
    label: "WFH 2 Days/Week",
    description: "Work remotely two days per week",
    icon: "🏠",
    parameters: { daysPerWeek: 2 },
  },
  {
    type: "work_from_home",
    label: "WFH 3 Days/Week",
    description: "Work remotely three days per week",
    icon: "🏠",
    parameters: { daysPerWeek: 3 },
  },
  {
    type: "work_from_home",
    label: "Full Remote Work",
    description: "Work fully remotely and eliminate commuting",
    icon: "💻",
    parameters: { daysPerWeek: 5 },
  },
  {
    type: "reduce_flights",
    label: "Cut Flights by 50%",
    description: "Take half as many flights per year",
    icon: "✈️",
    parameters: { reductionPercent: 50 },
  },
  {
    type: "reduce_flights",
    label: "Eliminate Flights",
    description: "Stop flying entirely for one year",
    icon: "🚫",
    parameters: { reductionPercent: 100 },
  },
  {
    type: "diet_change",
    label: "Go Vegetarian",
    description: "Switch to a vegetarian diet",
    icon: "🥗",
    parameters: { newDiet: "vegetarian" },
  },
  {
    type: "diet_change",
    label: "Go Vegan",
    description: "Switch to a fully plant-based diet",
    icon: "🌱",
    parameters: { newDiet: "vegan" },
  },
  {
    type: "diet_change",
    label: "Reduce Meat (Low)",
    description: "Reduce meat consumption significantly",
    icon: "🥩",
    parameters: { newDiet: "omnivore_low" },
  },
  {
    type: "reduce_electricity",
    label: "Cut Electricity 20%",
    description: "Reduce home electricity usage by 20% through efficiency",
    icon: "💡",
    parameters: { reductionPercent: 20 },
  },
  {
    type: "reduce_electricity",
    label: "Cut Electricity 40%",
    description: "Cut energy usage by 40% with smart home upgrades",
    icon: "🔌",
    parameters: { reductionPercent: 40 },
  },
  {
    type: "install_renewable",
    label: "Switch to Renewables",
    description: "Switch to a renewable energy tariff or install solar panels",
    icon: "☀️",
    parameters: {},
  },
  {
    type: "reduce_shopping",
    label: "Halve New Purchases",
    description: "Buy 50% fewer new clothing and electronics items",
    icon: "🛍️",
    parameters: { reductionPercent: 50 },
  },
  {
    type: "increase_recycling",
    label: "Recycle 80%",
    description: "Increase recycling rate to 80% of waste",
    icon: "♻️",
    parameters: { newPercentage: 80 },
  },
  {
    type: "increase_recycling",
    label: "Recycle 100%",
    description: "Achieve near-zero waste through maximum recycling",
    icon: "🌿",
    parameters: { newPercentage: 100 },
  },
];

/**
 * Pre-built scenario templates combining multiple changes
 */
export const SCENARIO_TEMPLATES = [
  {
    name: "Urban Commuter Switch",
    description: "Metro + WFH 2 days",
    changes: [
      SCENARIO_PRESETS.find((p) => p.label === "Switch to Metro")!,
      SCENARIO_PRESETS.find((p) => p.label === "WFH 2 Days/Week")!,
    ],
  },
  {
    name: "Plant-Based & Green",
    description: "Vegan diet + renewable energy",
    changes: [
      SCENARIO_PRESETS.find((p) => p.label === "Go Vegan")!,
      SCENARIO_PRESETS.find((p) => p.label === "Switch to Renewables")!,
    ],
  },
  {
    name: "EV & Smart Home",
    description: "Electric vehicle + 40% energy reduction",
    changes: [
      SCENARIO_PRESETS.find((p) => p.label === "Switch to Electric Vehicle")!,
      SCENARIO_PRESETS.find((p) => p.label === "Cut Electricity 40%")!,
    ],
  },
  {
    name: "Minimal Carbon Lifestyle",
    description: "Full remote + vegan + renewables",
    changes: [
      SCENARIO_PRESETS.find((p) => p.label === "Full Remote Work")!,
      SCENARIO_PRESETS.find((p) => p.label === "Go Vegan")!,
      SCENARIO_PRESETS.find((p) => p.label === "Switch to Renewables")!,
      SCENARIO_PRESETS.find((p) => p.label === "Recycle 100%")!,
    ],
  },
];
