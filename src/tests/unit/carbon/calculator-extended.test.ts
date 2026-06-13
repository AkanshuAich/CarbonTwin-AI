import {
  generateMonthlyHistory,
  buildDashboardData,
  getCarbonRank,
} from "@/lib/carbon/calculator";
import type { CarbonTwinProfile, CarbonFootprint } from "@/types";

const MOCK_FOOTPRINT: CarbonFootprint = {
  total: 6000,
  monthly: 500,
  categories: {
    transport: 2000,
    diet: 2000,
    energy: 1200,
    shopping: 800,
  },
  calculatedAt: new Date(),
};

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

describe("generateMonthlyHistory", () => {
  it("should return the requested number of months", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT, 6);
    expect(result).toHaveLength(6);
  });

  it("should default to 6 months", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT);
    expect(result).toHaveLength(6);
  });

  it("should return stable values across multiple calls (seeded)", () => {
    const result1 = generateMonthlyHistory(MOCK_FOOTPRINT, 6);
    const result2 = generateMonthlyHistory(MOCK_FOOTPRINT, 6);
    expect(result1).toEqual(result2);
  });

  it("should have all required fields per month", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT, 3);
    result.forEach((month) => {
      expect(month.month).toBeTruthy();
      expect(typeof month.transport).toBe("number");
      expect(typeof month.diet).toBe("number");
      expect(typeof month.energy).toBe("number");
      expect(typeof month.shopping).toBe("number");
      expect(typeof month.total).toBe("number");
    });
  });

  it("should have total equal to sum of categories per month", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT, 6);
    result.forEach((month) => {
      const sum = month.transport + month.diet + month.energy + month.shopping;
      expect(month.total).toBe(sum);
    });
  });

  it("should have all positive values", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT, 6);
    result.forEach((month) => {
      expect(month.transport).toBeGreaterThanOrEqual(0);
      expect(month.diet).toBeGreaterThanOrEqual(0);
      expect(month.energy).toBeGreaterThanOrEqual(0);
      expect(month.shopping).toBeGreaterThanOrEqual(0);
    });
  });

  it("should have values roughly proportional to footprint categories", () => {
    const result = generateMonthlyHistory(MOCK_FOOTPRINT, 1);
    const month = result[0]!;
    // Transport is 2000/year → ~167/month, allow for variance
    expect(month.transport).toBeGreaterThan(100);
    expect(month.transport).toBeLessThan(300);
  });
});

describe("buildDashboardData", () => {
  it("should return all required dashboard fields", () => {
    const data = buildDashboardData(MOCK_PROFILE);
    expect(data.currentFootprint).toBeDefined();
    expect(data.monthlyHistory).toBeDefined();
    expect(data.globalAverage).toBeGreaterThan(0);
    expect(data.nationalAverage).toBeGreaterThan(0);
    expect(data.rank).toBeDefined();
  });

  it("should return 6 months of history by default", () => {
    const data = buildDashboardData(MOCK_PROFILE);
    expect(data.monthlyHistory).toHaveLength(6);
  });

  it("should have a valid rank", () => {
    const validRanks = ["excellent", "good", "average", "high", "very_high"];
    const data = buildDashboardData(MOCK_PROFILE);
    expect(validRanks).toContain(data.rank);
  });

  it("should correctly rank a very low footprint profile", () => {
    const lowProfile: CarbonTwinProfile = {
      ...MOCK_PROFILE,
      transport: { ...MOCK_PROFILE.transport, primaryMode: "bicycle", weeklyKm: 0, shortHaulFlights: 0, longHaulFlights: 0 },
      diet: { ...MOCK_PROFILE.diet, type: "vegan", meatMealsPerWeek: 0 },
      energy: { ...MOCK_PROFILE.energy, energySource: "renewable" },
    };
    const data = buildDashboardData(lowProfile);
    expect(["excellent", "good"]).toContain(data.rank);
  });
});

describe("getCarbonRank — additional coverage", () => {
  it("should return good for a footprint between 2001 and 3500", () => {
    expect(getCarbonRank(3000)).toBe("good");
  });

  it("should return average for a footprint between 3501 and 5500", () => {
    expect(getCarbonRank(5000)).toBe("average");
  });

  it("should return high for a footprint between 5501 and 8000", () => {
    expect(getCarbonRank(7000)).toBe("high");
  });

  it("should return very_high for a footprint above 8000", () => {
    expect(getCarbonRank(9000)).toBe("very_high");
  });

  it("should return excellent at exact boundary (2000)", () => {
    expect(getCarbonRank(2000)).toBe("excellent");
  });
});
