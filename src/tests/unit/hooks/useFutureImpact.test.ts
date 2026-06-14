import { renderHook, act } from "@testing-library/react";
import { useFutureImpact } from "@/hooks/useFutureImpact";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";

jest.mock("@/features/auth/AuthProvider", () => ({
  useAuthContext: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/services/firebase/firestore", () => ({
  getCarbonTwinProfile: jest.fn(),
  getUserScenarios: jest.fn(),
  saveScenario: jest.fn(),
}));

jest.mock("@/lib/carbon/calculator", () => ({
  calculateCarbonFootprint: jest.fn().mockReturnValue({ total: 1000 }),
}));

jest.mock("@/utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe("useFutureImpact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with default state and computes baseline", () => {
    const mockUser = { uid: "test-user" };
    (useAuthContext as jest.Mock).mockReturnValue({ user: mockUser });
    
    // First useQuery is profile, second is scenarios
    (useQuery as jest.Mock).mockImplementation((opts) => {
      if (opts.queryKey[0] === "carbonTwinProfile") {
        return { data: { id: "test" }, isLoading: false };
      }
      return { data: [], isLoading: false };
    });

    const { result } = renderHook(() => useFutureImpact());

    expect(result.current.scenarioName).toBe("My Future Scenario");
    expect(result.current.selectedChanges).toEqual([]);
    expect(result.current.activeCategory).toBe("transport");
    expect(result.current.baselineFootprint).toBeDefined();
    expect(calculateCarbonFootprint).toHaveBeenCalled();
  });

  it("handles toggleChange, applyTemplate, and category selection", () => {
    const mockUser = { uid: "test-user" };
    (useAuthContext as jest.Mock).mockReturnValue({ user: mockUser });
    (useQuery as jest.Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useFutureImpact());

    const mockChange = { type: "test-type", label: "Test Label", description: "", icon: "", impact: {}, parameters: {} } as unknown as import("@/types").ScenarioChange;

    act(() => {
      result.current.toggleChange(mockChange);
    });

    expect(result.current.selectedChanges).toContainEqual(mockChange);
    expect(result.current.isSelected(mockChange)).toBe(true);

    act(() => {
      result.current.toggleChange(mockChange);
    });

    expect(result.current.selectedChanges).not.toContainEqual(mockChange);

    act(() => {
      result.current.applyTemplate([mockChange]);
    });

    expect(result.current.selectedChanges).toContainEqual(mockChange);

    act(() => {
      result.current.setActiveCategory("diet");
    });

    expect(result.current.activeCategory).toBe("diet");
  });
});
