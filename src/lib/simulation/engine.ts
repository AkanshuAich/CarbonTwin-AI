import type {
  CarbonTwinProfile,
  CarbonFootprint,
  Scenario,
  ScenarioChange,
  ScenarioChangeType,
} from "@/types";
import { calculateCarbonFootprint, calculateEquivalencies } from "@/lib/carbon/calculator";
import { TRANSPORT_EMISSION_FACTORS } from "@/lib/carbon/constants";
import { nanoid } from "@/utils/nanoid";

/**
 * Apply a set of scenario changes to a profile and compute the new footprint
 */
export function applyScenarioChanges(
  baseProfile: CarbonTwinProfile,
  changes: ScenarioChange[]
): CarbonTwinProfile {
  // Deep clone the profile to avoid mutation
  const modified: CarbonTwinProfile = JSON.parse(JSON.stringify(baseProfile));

  for (const change of changes) {
    switch (change.type) {
      case "transport_mode_change": {
        const newMode = change.parameters.newMode as CarbonTwinProfile["transport"]["primaryMode"];
        modified.transport.primaryMode = newMode;
        break;
      }
      case "reduce_flights": {
        const reduction = Number(change.parameters.reductionPercent) / 100;
        modified.transport.shortHaulFlights = Math.max(
          0,
          Math.round(baseProfile.transport.shortHaulFlights * (1 - reduction))
        );
        modified.transport.longHaulFlights = Math.max(
          0,
          Math.round(baseProfile.transport.longHaulFlights * (1 - reduction))
        );
        break;
      }
      case "work_from_home": {
        const wfhDays = Number(change.parameters.daysPerWeek);
        const commuteFraction = wfhDays / 5;
        modified.transport.weeklyKm = Math.round(
          baseProfile.transport.weeklyKm * (1 - commuteFraction)
        );
        break;
      }
      case "diet_change": {
        const newDiet = change.parameters.newDiet as CarbonTwinProfile["diet"]["type"];
        modified.diet.type = newDiet;
        if (newDiet === "vegan" || newDiet === "vegetarian") {
          modified.diet.meatMealsPerWeek = 0;
        } else if (newDiet === "omnivore_low") {
          modified.diet.meatMealsPerWeek = Math.min(
            baseProfile.diet.meatMealsPerWeek,
            3
          );
        }
        break;
      }
      case "reduce_electricity": {
        const reduction = Number(change.parameters.reductionPercent) / 100;
        modified.energy.monthlyKwh = Math.round(
          baseProfile.energy.monthlyKwh * (1 - reduction)
        );
        break;
      }
      case "install_renewable": {
        modified.energy.energySource = "renewable";
        break;
      }
      case "reduce_shopping": {
        const reduction = Number(change.parameters.reductionPercent) / 100;
        modified.shopping.newClothingItemsPerYear = Math.round(
          baseProfile.shopping.newClothingItemsPerYear * (1 - reduction)
        );
        modified.shopping.electronicsPerYear = Math.round(
          baseProfile.shopping.electronicsPerYear * (1 - reduction)
        );
        break;
      }
      case "increase_recycling": {
        modified.shopping.recyclingPercentage = Math.min(
          100,
          Number(change.parameters.newPercentage)
        );
        break;
      }
    }
  }

  return modified;
}

/**
 * Build a full Scenario object from changes applied to a base profile
 */
export function buildScenario(
  name: string,
  changes: ScenarioChange[],
  baseProfile: CarbonTwinProfile,
  baselineFootprint: CarbonFootprint
): Scenario {
  const modifiedProfile = applyScenarioChanges(baseProfile, changes);
  const projectedFootprint = calculateCarbonFootprint(modifiedProfile);

  const savedKgCO2ePerYear = Math.max(
    0,
    baselineFootprint.total - projectedFootprint.total
  );

  const percentageReduction =
    baselineFootprint.total > 0
      ? (savedKgCO2ePerYear / baselineFootprint.total) * 100
      : 0;

  return {
    id: nanoid(),
    name,
    changes,
    baselineFootprint,
    projectedFootprint,
    savedKgCO2ePerYear: Math.round(savedKgCO2ePerYear),
    percentageReduction: Math.round(percentageReduction * 10) / 10,
    equivalencies: calculateEquivalencies(savedKgCO2ePerYear),
    createdAt: new Date(),
  };
}

/**
 * Calculate the incremental impact of a single change type on a profile
 */
export function calculateSingleChangeImpact(
  changeType: ScenarioChangeType,
  parameters: Record<string, number | string>,
  baseProfile: CarbonTwinProfile,
  baselineFootprint: CarbonFootprint
): number {
  const change: ScenarioChange = {
    type: changeType,
    label: "",
    description: "",
    icon: "",
    parameters,
  };

  const modified = applyScenarioChanges(baseProfile, [change]);
  const newFootprint = calculateCarbonFootprint(modified);
  return Math.max(0, baselineFootprint.total - newFootprint.total);
}
