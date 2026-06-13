"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingDown,
  Plus,
  Trash2,
  Save,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import type { CarbonTwinProfile, Scenario, ScenarioChange } from "@/types";
import { buildScenario } from "@/lib/simulation/engine";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import { SCENARIO_PRESETS, SCENARIO_TEMPLATES } from "@/lib/simulation/presets";
import { getCarbonTwinProfile } from "@/services/firebase/firestore";
import { saveScenario, getUserScenarios } from "@/services/firebase/firestore";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { formatCO2, cn } from "@/utils";
import { ImpactComparisonChart } from "@/features/future-impact/ImpactComparisonChart";
import { EquivalenceDisplay } from "@/features/future-impact/EquivalenceDisplay";
import { CategoryChangeBreakdown } from "@/features/future-impact/CategoryChangeBreakdown";

const CATEGORIES = [
  { key: "transport", label: "Transport", emoji: "🚗" },
  { key: "diet", label: "Diet", emoji: "🥗" },
  { key: "energy", label: "Energy", emoji: "⚡" },
  { key: "shopping", label: "Shopping", emoji: "🛍️" },
] as const;

export default function FutureImpactPage() {
  const { user } = useAuthContext();
  const [selectedChanges, setSelectedChanges] = useState<ScenarioChange[]>([]);
  const [scenarioName, setScenarioName] = useState("My Future Scenario");
  const [activeCategory, setActiveCategory] = useState<string>("transport");
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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

  // Compute scenario in real-time as user makes selections
  const currentScenario = useMemo(() => {
    if (!profile) return null;
    const baselineFootprint = calculateCarbonFootprint(profile);
    if (selectedChanges.length === 0) return null;
    return buildScenario(scenarioName, selectedChanges, profile, baselineFootprint);
  }, [profile, selectedChanges, scenarioName]);

  const baselineFootprint = useMemo(() => {
    if (!profile) return null;
    return calculateCarbonFootprint(profile);
  }, [profile]);

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
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPresets = SCENARIO_PRESETS.filter((p) => {
    if (activeCategory === "all") return true;
    const categoryPrefixMap: Record<string, string[]> = {
      transport: ["transport", "reduce_flights", "work_from_home"],
      diet: ["diet"],
      energy: ["reduce_electricity", "install_renewable"],
      shopping: ["reduce_shopping", "increase_recycling"],
    };
    const prefixes = categoryPrefixMap[activeCategory] ?? [];
    return prefixes.some((prefix) => p.type.startsWith(prefix));
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your Carbon Twin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <p className="text-xl font-semibold mb-2">No Carbon Twin found</p>
          <p className="text-muted-foreground mb-4">
            Complete your onboarding to create your Digital Carbon Twin first.
          </p>
          <a
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold"
          >
            Start Onboarding <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-6 h-6 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold">Future Impact Explorer</h1>
          </div>
          <p className="text-muted-foreground">
            Simulate lifestyle changes and see their environmental impact in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-primary text-sm font-medium"
            >
              ✓ {savedMessage}
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={!currentScenario || isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm",
              "gradient-brand text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all hover:shadow-lg hover:shadow-primary/20"
            )}
            aria-label="Save current scenario"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save Scenario"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* LEFT — Scenario Builder */}
        <div className="xl:col-span-2 space-y-6">
          {/* Scenario Name */}
          <div className="glass rounded-2xl p-5">
            <label htmlFor="scenario-name" className="block text-sm font-medium mb-2 text-muted-foreground">
              Scenario Name
            </label>
            <input
              id="scenario-name"
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-colors"
              placeholder="My Future Scenario"
              maxLength={50}
              aria-describedby="scenario-name-hint"
            />
            <p id="scenario-name-hint" className="text-xs text-muted-foreground mt-1">
              Give your scenario a descriptive name
            </p>
          </div>

          {/* Quick Templates */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
              Quick Templates
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIO_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template.changes)}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  aria-label={`Apply template: ${template.name}`}
                >
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Choose Changes</h2>

            {/* Category selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1" role="tablist" aria-label="Change categories">
              {[{ key: "all", label: "All", emoji: "🌍" }, ...CATEGORIES].map(
                (cat) => (
                  <button
                    key={cat.key}
                    role="tab"
                    aria-selected={activeCategory === cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      activeCategory === cat.key
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    <span aria-hidden="true">{cat.emoji}</span>
                    {cat.label}
                  </button>
                )
              )}
            </div>

            {/* Preset cards */}
            <div
              className="space-y-2 max-h-80 overflow-y-auto pr-1"
              role="tabpanel"
              aria-label={`${activeCategory} changes`}
            >
              {filteredPresets.map((preset) => {
                const selected = isSelected(preset);
                return (
                  <motion.button
                    key={`${preset.type}-${preset.label}`}
                    onClick={() => toggleChange(preset)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selected
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    )}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Remove" : "Add"}: ${preset.label}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">
                        {preset.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{preset.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {preset.description}
                        </p>
                      </div>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected Changes Summary */}
          {selectedChanges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">
                  Selected Changes ({selectedChanges.length})
                </h2>
                <button
                  onClick={() => setSelectedChanges([])}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                  aria-label="Clear all selected changes"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {selectedChanges.map((change) => (
                  <div
                    key={`${change.type}-${change.label}`}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{change.icon}</span>
                      {change.label}
                    </span>
                    <button
                      onClick={() => toggleChange(change)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                      aria-label={`Remove ${change.label}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT — Impact Visualization */}
        <div className="xl:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {!currentScenario ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center"
                role="status"
                aria-live="polite"
              >
                <div className="w-20 h-20 rounded-full gradient-brand-subtle flex items-center justify-center mb-4">
                  <TrendingDown className="w-10 h-10 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Select Lifestyle Changes</h2>
                <p className="text-muted-foreground max-w-sm">
                  Choose changes from the left panel to instantly see their impact on your carbon footprint
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
                aria-live="polite"
                aria-label="Impact simulation results"
              >
                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCO2(baselineFootprint!.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">per year</p>
                  </div>
                  <div className="glass rounded-2xl p-5 text-center border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1">Future</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCO2(currentScenario.projectedFootprint.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">per year</p>
                  </div>
                  <div className="glass rounded-2xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">You&apos;d save</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCO2(currentScenario.savedKgCO2ePerYear)}
                    </p>
                    <p className="text-xs text-primary font-medium">
                      {currentScenario.percentageReduction}% less
                    </p>
                  </div>
                </div>

                {/* Comparison Chart */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Carbon Footprint Comparison</h2>
                  <ImpactComparisonChart
                    baseline={baselineFootprint!}
                    projected={currentScenario.projectedFootprint}
                  />
                </div>

                {/* Category Breakdown */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Category Impact</h2>
                  <CategoryChangeBreakdown
                    baseline={baselineFootprint!}
                    projected={currentScenario.projectedFootprint}
                  />
                </div>

                {/* Equivalencies */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-semibold mb-4">Real-World Equivalents</h2>
                  <EquivalenceDisplay
                    equivalencies={currentScenario.equivalencies}
                    savedKgCO2e={currentScenario.savedKgCO2ePerYear}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Saved Scenarios */}
      {savedScenarios && savedScenarios.length > 0 && (
        <section aria-labelledby="saved-scenarios-heading" className="space-y-4">
          <h2 id="saved-scenarios-heading" className="text-xl font-bold">
            Saved Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="glass rounded-2xl p-5 card-hover cursor-pointer"
                onClick={() => setSelectedChanges(scenario.changes)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedChanges(scenario.changes);
                  }
                }}
                aria-label={`Load scenario: ${scenario.name}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <span className="text-primary font-bold text-sm">
                    -{scenario.percentageReduction}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Saves {formatCO2(scenario.savedKgCO2ePerYear)}/year
                </p>
                <div className="flex flex-wrap gap-1">
                  {scenario.changes.slice(0, 3).map((change) => (
                    <span
                      key={change.label}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {change.icon} {change.label}
                    </span>
                  ))}
                  {scenario.changes.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      +{scenario.changes.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
