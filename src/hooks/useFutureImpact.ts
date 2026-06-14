import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ScenarioChange } from "@/types";
import { buildScenario } from "@/lib/simulation/engine";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import { SCENARIO_PRESETS } from "@/lib/simulation/presets";
import {
  getCarbonTwinProfile,
  saveScenario,
  getUserScenarios,
} from "@/services/firebase/firestore";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { logger } from "@/utils/logger";

export function useFutureImpact() {
  const { user } = useAuthContext();
  const [selectedChanges, setSelectedChanges] = useState<ScenarioChange[]>([]);
  const [scenarioName, setScenarioName] = useState("My Future Scenario");
  const [activeCategory, setActiveCategory] = useState<string>("transport");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);

  // Load Carbon Twin profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  // Load saved scenarios
  const { data: savedScenarios, refetch: refetchScenarios } = useQuery({
    queryKey: ["userScenarios", user?.uid],
    queryFn: () => getUserScenarios(user!.uid),
    enabled: !!user?.uid,
  });

  const baselineFootprint = useMemo(() => {
    if (!profile) return null;
    return calculateCarbonFootprint(profile);
  }, [profile]);

  // Compute scenario in real-time as user makes selections
  const currentScenario = useMemo(() => {
    if (!profile || !baselineFootprint) return null;
    if (selectedChanges.length === 0) return null;
    return buildScenario(
      scenarioName,
      selectedChanges,
      profile,
      baselineFootprint
    );
  }, [profile, selectedChanges, scenarioName, baselineFootprint]);

  const toggleChange = useCallback((change: ScenarioChange) => {
    setSelectedChanges((prev) => {
      const exists = prev.find(
        (c) => c.type === change.type && c.label === change.label
      );
      if (exists) {
        return prev.filter((c) => c !== exists);
      }
      // Remove conflicting changes of same type
      const filtered = prev.filter((c) => c.type !== change.type);
      return [...filtered, change];
    });
    // Reset narrative when the scenario changes
    setAiNarrative(null);
  }, []);

  const isSelected = useCallback(
    (change: ScenarioChange) =>
      selectedChanges.some(
        (c) => c.type === change.type && c.label === change.label
      ),
    [selectedChanges]
  );

  const applyTemplate = useCallback((changes: ScenarioChange[]) => {
    setSelectedChanges(changes);
  }, []);

  const handleSave = async () => {
    if (!currentScenario || !user?.uid) return;
    setIsSaving(true);
    try {
      await saveScenario(user.uid, {
        name: currentScenario.name,
        changes: currentScenario.changes,
        baselineFootprint: currentScenario.baselineFootprint,
        projectedFootprint: currentScenario.projectedFootprint,
        savedKgCO2ePerYear: currentScenario.savedKgCO2ePerYear,
        percentageReduction: currentScenario.percentageReduction,
        equivalencies: currentScenario.equivalencies,
      });
      setSavedMessage("Scenario saved!");
      refetchScenarios();
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err) {
      logger.error({ message: "Failed to save scenario", error: String(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateNarrative = async () => {
    if (!currentScenario) return;
    setIsGeneratingNarrative(true);
    try {
      const res = await fetch("/api/ai/scenario-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioName: currentScenario.name,
          savedKgCO2ePerYear: currentScenario.savedKgCO2ePerYear,
          percentageReduction: currentScenario.percentageReduction,
          changeLabels: currentScenario.changes.map((c) => c.label),
        }),
      });
      if (!res.ok) throw new Error("Failed to generate narrative");
      const data = await res.json();
      setAiNarrative(data.narrative ?? null);
    } catch {
      setAiNarrative(
        "Unable to generate AI insight at this time. Please try again."
      );
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const filteredPresets = useMemo(() => {
    if (activeCategory === "all") return SCENARIO_PRESETS;
    const categoryPrefixMap: Record<string, string[]> = {
      transport: ["transport", "reduce_flights", "work_from_home"],
      diet: ["diet"],
      energy: ["reduce_electricity", "install_renewable"],
      shopping: ["reduce_shopping", "increase_recycling"],
    };
    const prefixes = categoryPrefixMap[activeCategory] ?? [];
    return SCENARIO_PRESETS.filter((p) =>
      prefixes.some((prefix) => p.type.startsWith(prefix))
    );
  }, [activeCategory]);

  return {
    profile,
    profileLoading,
    savedScenarios,
    currentScenario,
    baselineFootprint,
    selectedChanges,
    scenarioName,
    setScenarioName,
    activeCategory,
    setActiveCategory,
    isSaving,
    savedMessage,
    aiNarrative,
    setAiNarrative,
    isGeneratingNarrative,
    toggleChange,
    isSelected,
    applyTemplate,
    handleSave,
    handleGenerateNarrative,
    filteredPresets,
    setSelectedChanges,
  };
}
