import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { getCarbonTwinProfile } from "@/services/firebase/firestore";
import type { CarbonTwinProfile } from "@/types";

export interface UseCarbonProfileResult {
  profile: CarbonTwinProfile | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Shared hook for fetching the authenticated user's Carbon Twin profile.
 *
 * Encapsulates the `useQuery` + `useAuthContext` coupling that appears
 * on every dashboard page, providing a single source of truth for the
 * query key and fetcher.
 */
export function useCarbonProfile(): UseCarbonProfileResult {
  const { user } = useAuthContext();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  return {
    profile,
    isLoading,
    error: error as Error | null,
  };
}
