import { renderHook, act } from "@testing-library/react";
import { useGreenRoutes } from "@/hooks/useGreenRoutes";

jest.mock("@/utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("@googlemaps/js-api-loader", () => ({
  setOptions: jest.fn(),
  importLibrary: jest.fn().mockResolvedValue({}),
}));

describe("useGreenRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useGreenRoutes());

    expect(result.current.origin).toBe("");
    expect(result.current.destination).toBe("");
    expect(result.current.routes).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.aiRecommendation).toBe("");
    expect(result.current.activeMode).toBeNull();
  });

  it("handles missing API key", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { result } = renderHook(() => useGreenRoutes());
    
    // Test that it doesn't crash on init
    expect(result.current.isLoading).toBe(false);
  });
  
  it("handleSearch exits early if no origin or destination", async () => {
    const { result } = renderHook(() => useGreenRoutes());
    
    await act(async () => {
      await result.current.handleSearch();
    });
    
    expect(result.current.isLoading).toBe(false); // Didn't start loading
  });
  
  it("handleSelectRoute exits early if no google maps ref", () => {
    const { result } = renderHook(() => useGreenRoutes());
    
    act(() => {
      result.current.handleSelectRoute("driving");
    });
    
    expect(result.current.activeMode).toBeNull();
  });
});
