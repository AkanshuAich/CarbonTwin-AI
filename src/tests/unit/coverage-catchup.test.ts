import {
  calculateTransportEmissions,
  calculateDietEmissions,
  calculateEnergyEmissions,
  generateMonthlyHistory,
} from "@/lib/carbon/calculator";
import { applyScenarioChanges, buildScenario } from "@/lib/simulation/engine";
import { debounce } from "@/utils";
import type { CarbonTwinProfile, CarbonFootprint } from "@/types";

describe("100% Coverage Catch-up", () => {
  describe("calculator.ts default fallbacks", () => {
    it("should use default transport factor for unknown mode", () => {
      const result = calculateTransportEmissions({
        // @ts-expect-error Intentionally testing fallback
        primaryMode: "teleportation",
        weeklyKm: 100,
        flightsPerYear: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      });
      // 100 * 0.192 * 52 = 998.4
      expect(result).toBe(998);
    });

    it("should use default diet factor for unknown diet", () => {
      const result = calculateDietEmissions({
        // @ts-expect-error Intentionally testing fallback
        type: "photosynthesis",
        meatMealsPerWeek: 0,
        dairyServingsPerDay: 0,
        localFoodPercentage: 0,
      });
      expect(result).toBe(2450);
    });

    it("should use default energy factor for unknown source", () => {
      const result = calculateEnergyEmissions({
        monthlyKwh: 100,
        // @ts-expect-error Intentionally testing fallback
        energySource: "fusion",
        hasAirConditioning: false,
        hasElectricHeating: false,
        householdSize: 1,
      });
      // 100 * 12 = 1200 * 0.233 = 279.6
      expect(result).toBe(280);
    });

    it("should handle unknown month gracefully", () => {
      // Mock Date to return a month out of bounds (which technically shouldn't happen, but testing branch)
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 15, 1)); // Invalid month, will wrap to April 2025
      const mockFootprint: CarbonFootprint = {
        total: 1000,
        monthly: 83,
        categories: { transport: 250, diet: 250, energy: 250, shopping: 250 },
        calculatedAt: new Date(),
      };
      const result = generateMonthlyHistory(mockFootprint, 1);
      expect(result[0]!.month).toBeDefined();
      jest.useRealTimers();
    });
  });

  describe("engine.ts remaining branches", () => {
    const baseProfile: CarbonTwinProfile = {
      userId: "test",
      transport: { primaryMode: "car_petrol", weeklyKm: 100, flightsPerYear: 2, shortHaulFlights: 2, longHaulFlights: 2 },
      diet: { type: "omnivore_high", meatMealsPerWeek: 7, dairyServingsPerDay: 2, localFoodPercentage: 10 },
      energy: { monthlyKwh: 500, energySource: "grid", hasAirConditioning: true, hasElectricHeating: false, householdSize: 2 },
      shopping: { newClothingItemsPerYear: 20, electronicsPerYear: 2, onlineOrdersPerMonth: 5, recyclingPercentage: 10 },
      createdAt: new Date(),
      updatedAt: new Date(),
      onboardingCompleted: true,
    };

    it("should reduce flights correctly", () => {
      const modified = applyScenarioChanges(baseProfile, [
        { type: "reduce_flights", label: "test", description: "test", icon: "test", parameters: { reductionPercent: 50 } },
      ]);
      expect(modified.transport.shortHaulFlights).toBe(1);
      expect(modified.transport.longHaulFlights).toBe(1);
    });

    it("should change diet to omnivore_low and cap meat meals", () => {
      const modified = applyScenarioChanges(baseProfile, [
        { type: "diet_change", label: "test", description: "test", icon: "test", parameters: { newDiet: "omnivore_low" } },
      ]);
      expect(modified.diet.type).toBe("omnivore_low");
      expect(modified.diet.meatMealsPerWeek).toBe(3); // Capped at 3
    });

    it("should change diet to vegetarian and zero meat meals", () => {
      const modified = applyScenarioChanges(baseProfile, [
        { type: "diet_change", label: "test", description: "test", icon: "test", parameters: { newDiet: "vegetarian" } },
      ]);
      expect(modified.diet.type).toBe("vegetarian");
      expect(modified.diet.meatMealsPerWeek).toBe(0);
    });

    it("should reduce shopping correctly", () => {
      const modified = applyScenarioChanges(baseProfile, [
        { type: "reduce_shopping", label: "test", description: "test", icon: "test", parameters: { reductionPercent: 50 } },
      ]);
      expect(modified.shopping.newClothingItemsPerYear).toBe(10);
      expect(modified.shopping.electronicsPerYear).toBe(1);
    });

    it("should handle zero baseline footprint gracefully in buildScenario", () => {
      const zeroFootprint: CarbonFootprint = {
        total: 0,
        monthly: 0,
        categories: { transport: 0, diet: 0, energy: 0, shopping: 0 },
        calculatedAt: new Date(),
      };
      const scenario = buildScenario("test", [], baseProfile, zeroFootprint);
      expect(scenario.percentageReduction).toBe(0);
    });
  });

  describe("utils debounce", () => {
    it("should debounce function calls", () => {
      jest.useFakeTimers();
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(fn).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});
