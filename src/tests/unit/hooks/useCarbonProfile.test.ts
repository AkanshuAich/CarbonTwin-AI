import { renderHook } from "@testing-library/react";
import { useCarbonProfile } from "@/hooks/useCarbonProfile";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { useQuery } from "@tanstack/react-query";

jest.mock("@/features/auth/AuthProvider", () => ({
  useAuthContext: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/services/firebase/firestore", () => ({
  getCarbonTwinProfile: jest.fn(),
}));

describe("useCarbonProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns profile data when user is authenticated and query resolves", () => {
    const mockUser = { uid: "test-user-123" };
    const mockProfile = { id: "test-user-123", transport: {}, diet: {}, energy: {}, shopping: {} };
    
    (useAuthContext as jest.Mock).mockReturnValue({ user: mockUser });
    (useQuery as jest.Mock).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useCarbonProfile());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["carbonTwinProfile", "test-user-123"],
      queryFn: expect.any(Function),
      enabled: true,
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handles unauthenticated state safely", () => {
    (useAuthContext as jest.Mock).mockReturnValue({ user: null });
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useCarbonProfile());

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ["carbonTwinProfile", undefined],
      queryFn: expect.any(Function),
      enabled: false,
    });

    expect(result.current.profile).toBeUndefined();
  });
});
