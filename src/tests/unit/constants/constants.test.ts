import { CATEGORY_CONFIG } from "@/constants/categories";
import {
  WALKING_MAX_DISPLAY_KM,
  CYCLING_MAX_DISPLAY_KM,
  WALKING_RECOMMEND_MAX_KM,
  CYCLING_RECOMMEND_MAX_KM,
  TRANSIT_MAX_DRIVING_TIME_RATIO,
  DRIVING_COST_PER_KM,
  TRANSIT_FLAT_FARE,
} from "@/constants/routes";
import * as ConstantsIndex from "@/constants/index";

describe("Constants", () => {
  it("exports CATEGORY_CONFIG correctly", () => {
    expect(CATEGORY_CONFIG).toBeDefined();
    expect(CATEGORY_CONFIG.length).toBeGreaterThan(0);
  });

  it("exports routing thresholds correctly", () => {
    expect(WALKING_MAX_DISPLAY_KM).toBeDefined();
    expect(CYCLING_MAX_DISPLAY_KM).toBeDefined();
    expect(WALKING_RECOMMEND_MAX_KM).toBeDefined();
    expect(CYCLING_RECOMMEND_MAX_KM).toBeDefined();
    expect(TRANSIT_MAX_DRIVING_TIME_RATIO).toBeDefined();
    expect(DRIVING_COST_PER_KM).toBeDefined();
    expect(TRANSIT_FLAT_FARE).toBeDefined();
  });

  it("exports all constants from index", () => {
    expect(ConstantsIndex.CATEGORY_CONFIG).toBeDefined();
  });
});
