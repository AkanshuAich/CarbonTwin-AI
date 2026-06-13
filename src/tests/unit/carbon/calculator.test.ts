import {
  calculateTransportEmissions,
  calculateDietEmissions,
  calculateEnergyEmissions,
  calculateShoppingEmissions,
  calculateCarbonFootprint,
  calculateEquivalencies,
  getCarbonRank,
  getCarbonScore,
} from "@/lib/carbon/calculator";
import type { CarbonTwinProfile } from "@/types";

const MOCK_PROFILE: CarbonTwinProfile = {
  userId: "test-user",
  transport: {
    primaryMode: "car_petrol",
    weeklyKm: 100,
    flightsPerYear: 2,
    shortHaulFlights: 1,
    longHaulFlights: 1,
  },
  diet: {
    type: "omnivore_medium",
    meatMealsPerWeek: 5,
    dairyServingsPerDay: 2,
    localFoodPercentage: 20,
  },
  energy: {
    monthlyKwh: 300,
    energySource: "grid",
    hasAirConditioning: false,
    hasElectricHeating: false,
    householdSize: 2,
  },
  shopping: {
    newClothingItemsPerYear: 20,
    electronicsPerYear: 1,
    onlineOrdersPerMonth: 4,
    recyclingPercentage: 30,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  onboardingCompleted: true,
};

describe("Carbon Calculator", () => {
  describe("calculateTransportEmissions", () => {
    it("should calculate petrol car emissions correctly", () => {
      const result = calculateTransportEmissions({
        primaryMode: "car_petrol",
        weeklyKm: 100,
        flightsPerYear: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      });
      // 100km/week * 0.192 kgCO2e/km * 52 weeks ≈ 998
      expect(result).toBeCloseTo(998, -1);
    });

    it("should return 0 for walking with no flights", () => {
      const result = calculateTransportEmissions({
        primaryMode: "walking",
        weeklyKm: 50,
        flightsPerYear: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      });
      expect(result).toBe(0);
    });

    it("should include flight emissions", () => {
      const withFlights = calculateTransportEmissions({
        primaryMode: "metro",
        weeklyKm: 0,
        flightsPerYear: 2,
        shortHaulFlights: 1,
        longHaulFlights: 1,
      });
      // Short: 1200km * 0.255 = 306, Long: 8000km * 0.195 = 1560
      expect(withFlights).toBeGreaterThan(1800);
    });

    it("should calculate EV emissions lower than petrol", () => {
      const petrol = calculateTransportEmissions({
        primaryMode: "car_petrol",
        weeklyKm: 100,
        flightsPerYear: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      });
      const ev = calculateTransportEmissions({
        primaryMode: "car_electric",
        weeklyKm: 100,
        flightsPerYear: 0,
        shortHaulFlights: 0,
        longHaulFlights: 0,
      });
      expect(ev).toBeLessThan(petrol);
    });
  });

  describe("calculateDietEmissions", () => {
    it("should return less emissions for vegan than omnivore", () => {
      const vegan = calculateDietEmissions({
        type: "vegan",
        meatMealsPerWeek: 0,
        dairyServingsPerDay: 0,
        localFoodPercentage: 0,
      });
      const omnivore = calculateDietEmissions({
        type: "omnivore_high",
        meatMealsPerWeek: 14,
        dairyServingsPerDay: 3,
        localFoodPercentage: 0,
      });
      expect(vegan).toBeLessThan(omnivore);
    });

    it("should never return negative emissions", () => {
      const result = calculateDietEmissions({
        type: "vegan",
        meatMealsPerWeek: 0,
        dairyServingsPerDay: 0,
        localFoodPercentage: 100,
      });
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateEnergyEmissions", () => {
    it("should return lower emissions for renewable vs grid", () => {
      const grid = calculateEnergyEmissions({
        monthlyKwh: 300,
        energySource: "grid",
        hasAirConditioning: false,
        hasElectricHeating: false,
        householdSize: 1,
      });
      const renewable = calculateEnergyEmissions({
        monthlyKwh: 300,
        energySource: "renewable",
        hasAirConditioning: false,
        hasElectricHeating: false,
        householdSize: 1,
      });
      expect(renewable).toBeLessThan(grid);
    });

    it("should divide by household size", () => {
      const singlePerson = calculateEnergyEmissions({
        monthlyKwh: 300,
        energySource: "grid",
        hasAirConditioning: false,
        hasElectricHeating: false,
        householdSize: 1,
      });
      const twoPeople = calculateEnergyEmissions({
        monthlyKwh: 300,
        energySource: "grid",
        hasAirConditioning: false,
        hasElectricHeating: false,
        householdSize: 2,
      });
      expect(singlePerson).toBeGreaterThan(twoPeople);
    });
  });

  describe("calculateShoppingEmissions", () => {
    it("should never return negative", () => {
      const result = calculateShoppingEmissions({
        newClothingItemsPerYear: 0,
        electronicsPerYear: 0,
        onlineOrdersPerMonth: 0,
        recyclingPercentage: 100,
      });
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should increase with more purchases", () => {
      const low = calculateShoppingEmissions({
        newClothingItemsPerYear: 5,
        electronicsPerYear: 0,
        onlineOrdersPerMonth: 1,
        recyclingPercentage: 50,
      });
      const high = calculateShoppingEmissions({
        newClothingItemsPerYear: 50,
        electronicsPerYear: 5,
        onlineOrdersPerMonth: 20,
        recyclingPercentage: 0,
      });
      expect(high).toBeGreaterThan(low);
    });
  });

  describe("calculateCarbonFootprint", () => {
    it("should return all categories", () => {
      const result = calculateCarbonFootprint(MOCK_PROFILE);
      expect(result.categories.transport).toBeGreaterThan(0);
      expect(result.categories.diet).toBeGreaterThan(0);
      expect(result.categories.energy).toBeGreaterThan(0);
      expect(result.categories.shopping).toBeGreaterThan(0);
    });

    it("should have total equal to sum of categories", () => {
      const result = calculateCarbonFootprint(MOCK_PROFILE);
      const sum =
        result.categories.transport +
        result.categories.diet +
        result.categories.energy +
        result.categories.shopping;
      expect(result.total).toBe(sum);
    });

    it("should have monthly approximately = total / 12", () => {
      const result = calculateCarbonFootprint(MOCK_PROFILE);
      expect(result.monthly).toBeCloseTo(result.total / 12, -1);
    });
  });

  describe("calculateEquivalencies", () => {
    it("should return 5 equivalency types", () => {
      const result = calculateEquivalencies(2000);
      expect(result).toHaveLength(5);
    });

    it("should calculate trees planted correctly", () => {
      const result = calculateEquivalencies(2100); // 2100 / 21 = 100 trees
      const trees = result.find((e) => e.type === "trees");
      expect(trees?.value).toBe(100);
    });

    it("should return 0 for all equivalencies when saving is 0", () => {
      const result = calculateEquivalencies(0);
      result.forEach((equiv) => {
        expect(equiv.value).toBe(0);
      });
    });
  });

  describe("getCarbonRank", () => {
    it("should return excellent for low footprint", () => {
      expect(getCarbonRank(1500)).toBe("excellent");
    });

    it("should return very_high for large footprint", () => {
      expect(getCarbonRank(10000)).toBe("very_high");
    });
  });

  describe("getCarbonScore", () => {
    it("should return 100 for 0 footprint", () => {
      expect(getCarbonScore(0)).toBe(100);
    });

    it("should return 0 for extremely high footprint", () => {
      expect(getCarbonScore(30000)).toBe(0);
    });

    it("should be between 0 and 100", () => {
      const score = getCarbonScore(5000);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
