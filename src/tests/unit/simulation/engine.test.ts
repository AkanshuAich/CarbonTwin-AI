import { buildScenario, applyScenarioChanges, calculateSingleChangeImpact } from "@/lib/simulation/engine";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import type { CarbonTwinProfile, ScenarioChange } from "@/types";

const BASE_PROFILE: CarbonTwinProfile = {
  userId: "test-user",
  transport: {
    primaryMode: "car_petrol",
    weeklyKm: 100,
    flightsPerYear: 2,
    shortHaulFlights: 2,
    longHaulFlights: 0,
  },
  diet: {
    type: "omnivore_medium",
    meatMealsPerWeek: 5,
    dairyServingsPerDay: 2,
    localFoodPercentage: 10,
  },
  energy: {
    monthlyKwh: 300,
    energySource: "grid",
    hasAirConditioning: false,
    hasElectricHeating: false,
    householdSize: 1,
  },
  shopping: {
    newClothingItemsPerYear: 20,
    electronicsPerYear: 1,
    onlineOrdersPerMonth: 4,
    recyclingPercentage: 20,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  onboardingCompleted: true,
};

describe("Simulation Engine", () => {
  describe("applyScenarioChanges", () => {
    it("should not mutate the original profile", () => {
      const originalMode = BASE_PROFILE.transport.primaryMode;
      const change: ScenarioChange = {
        type: "transport_mode_change",
        label: "Switch to Metro",
        description: "",
        icon: "🚇",
        parameters: { newMode: "metro" },
      };
      applyScenarioChanges(BASE_PROFILE, [change]);
      expect(BASE_PROFILE.transport.primaryMode).toBe(originalMode);
    });

    it("should apply transport mode change correctly", () => {
      const change: ScenarioChange = {
        type: "transport_mode_change",
        label: "Switch to Metro",
        description: "",
        icon: "🚇",
        parameters: { newMode: "metro" },
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      expect(modified.transport.primaryMode).toBe("metro");
    });

    it("should apply work from home reduction correctly", () => {
      const change: ScenarioChange = {
        type: "work_from_home",
        label: "WFH 2 Days",
        description: "",
        icon: "🏠",
        parameters: { daysPerWeek: 2 },
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      // 2/5 = 40% reduction in weekly km
      const expectedKm = Math.round(BASE_PROFILE.transport.weeklyKm * (1 - 2 / 5));
      expect(modified.transport.weeklyKm).toBe(expectedKm);
    });

    it("should apply diet change correctly", () => {
      const change: ScenarioChange = {
        type: "diet_change",
        label: "Go Vegan",
        description: "",
        icon: "🌱",
        parameters: { newDiet: "vegan" },
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      expect(modified.diet.type).toBe("vegan");
      expect(modified.diet.meatMealsPerWeek).toBe(0);
    });

    it("should apply renewable energy switch", () => {
      const change: ScenarioChange = {
        type: "install_renewable",
        label: "Switch to Renewables",
        description: "",
        icon: "☀️",
        parameters: {},
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      expect(modified.energy.energySource).toBe("renewable");
    });

    it("should apply electricity reduction", () => {
      const change: ScenarioChange = {
        type: "reduce_electricity",
        label: "Cut 20%",
        description: "",
        icon: "💡",
        parameters: { reductionPercent: 20 },
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      const expectedKwh = Math.round(BASE_PROFILE.energy.monthlyKwh * 0.8);
      expect(modified.energy.monthlyKwh).toBe(expectedKwh);
    });

    it("should not allow negative weekly km", () => {
      const change: ScenarioChange = {
        type: "work_from_home",
        label: "Full Remote",
        description: "",
        icon: "💻",
        parameters: { daysPerWeek: 5 },
      };
      const modified = applyScenarioChanges(BASE_PROFILE, [change]);
      expect(modified.transport.weeklyKm).toBeGreaterThanOrEqual(0);
    });
  });

  describe("buildScenario", () => {
    const baselineFootprint = calculateCarbonFootprint(BASE_PROFILE);

    it("should return a scenario with correct structure", () => {
      const changes: ScenarioChange[] = [{
        type: "transport_mode_change",
        label: "Switch to Metro",
        description: "",
        icon: "🚇",
        parameters: { newMode: "metro" },
      }];
      const scenario = buildScenario("Test", changes, BASE_PROFILE, baselineFootprint);

      expect(scenario.name).toBe("Test");
      expect(scenario.changes).toHaveLength(1);
      expect(scenario.equivalencies).toHaveLength(5);
      expect(scenario.id).toBeTruthy();
    });

    it("should show reduced footprint after positive changes", () => {
      const changes: ScenarioChange[] = [
        {
          type: "transport_mode_change",
          label: "Switch to Metro",
          description: "",
          icon: "🚇",
          parameters: { newMode: "metro" },
        },
        {
          type: "diet_change",
          label: "Go Vegan",
          description: "",
          icon: "🌱",
          parameters: { newDiet: "vegan" },
        },
      ];
      const scenario = buildScenario("Green Scenario", changes, BASE_PROFILE, baselineFootprint);

      expect(scenario.projectedFootprint.total).toBeLessThan(baselineFootprint.total);
      expect(scenario.savedKgCO2ePerYear).toBeGreaterThan(0);
      expect(scenario.percentageReduction).toBeGreaterThan(0);
    });

    it("should never have negative savings", () => {
      const changes: ScenarioChange[] = [{
        type: "increase_recycling",
        label: "Recycle 50%",
        description: "",
        icon: "♻️",
        parameters: { newPercentage: 50 },
      }];
      const scenario = buildScenario("Recycling", changes, BASE_PROFILE, baselineFootprint);
      expect(scenario.savedKgCO2ePerYear).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateSingleChangeImpact", () => {
    const baselineFootprint = calculateCarbonFootprint(BASE_PROFILE);

    it("should calculate positive impact for metro switch", () => {
      const impact = calculateSingleChangeImpact(
        "transport_mode_change",
        { newMode: "metro" },
        BASE_PROFILE,
        baselineFootprint
      );
      expect(impact).toBeGreaterThan(0);
    });

    it("should calculate zero impact for changes already in profile", () => {
      const impact = calculateSingleChangeImpact(
        "transport_mode_change",
        { newMode: "car_petrol" }, // Same as current
        BASE_PROFILE,
        baselineFootprint
      );
      expect(impact).toBe(0);
    });
  });
});
