"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, TrendingDown, Zap, ShoppingBag, Utensils } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { getCarbonTwinProfile } from "@/services/firebase/firestore";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import type { AIRecommendation } from "@/types";
import { formatCO2, cn } from "@/utils";

const PRIORITY_CONFIG = {
  high: { label: "High Impact", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  medium: { label: "Medium Impact", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  low: { label: "Lower Impact", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
};

const EFFORT_CONFIG = {
  easy: { label: "Easy", emoji: "✅" },
  moderate: { label: "Moderate", emoji: "⚙️" },
  hard: { label: "Requires effort", emoji: "💪" },
};

const CATEGORY_ICONS = {
  transport: TrendingDown,
  diet: Utensils,
  energy: Zap,
  shopping: ShoppingBag,
};

export default function PrioritizerPage() {
  const { user } = useAuthContext();

  const { data: profile } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  const {
    data: recommendations,
    mutate: generateRecs,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation<AIRecommendation[]>({
    mutationFn: async () => {
      if (!profile) throw new Error("No profile");
      const footprint = calculateCarbonFootprint(profile);
      const res = await fetch("/api/ai/prioritizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, footprint }),
      });
      if (!res.ok) throw new Error("Failed to generate recommendations");
      const data = await res.json();
      return data.recommendations;
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold">AI Action Prioritizer</h1>
          </div>
          <p className="text-muted-foreground">
            Personalized recommendations ranked by impact on your specific Carbon Twin
          </p>
        </div>

        <button
          onClick={() => generateRecs()}
          disabled={isPending || !profile}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium gradient-brand text-white",
            "hover:shadow-lg hover:shadow-primary/20 transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          aria-label="Generate AI recommendations"
        >
          {isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          )}
          {isPending ? "Analyzing..." : "Generate Recommendations"}
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="glass rounded-2xl p-8 text-center border border-destructive/30" role="alert">
          <p className="text-destructive font-medium mb-2">Failed to generate recommendations</p>
          <p className="text-muted-foreground text-sm mb-4">
            {error instanceof Error ? error.message : "Please try again in a moment."}
          </p>
          <button
            onClick={() => generateRecs()}
            className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isSuccess && !isPending && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full gradient-brand-subtle flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Get Your Personalized Plan</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Our Gemini AI will analyze your Carbon Twin profile and generate 6 ranked 
            actions tailored specifically to your lifestyle and biggest opportunities.
          </p>
          <button
            onClick={() => generateRecs()}
            disabled={!profile}
            className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
          >
            {profile ? "Analyze My Carbon Twin" : "Loading profile..."}
          </button>
        </div>
      )}

      {/* Loading */}
      {isPending && (
        <div className="space-y-4" aria-busy="true" aria-label="Generating recommendations">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {/* Results */}
      {isSuccess && recommendations && (
        <div className="space-y-4" role="list" aria-label="AI recommendations">
          {recommendations.map((rec, i) => {
            const priorityConf = PRIORITY_CONFIG[rec.priorityLevel];
            const effortConf = EFFORT_CONFIG[rec.effortLevel];
            const CategoryIcon = CATEGORY_ICONS[rec.category];

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass rounded-2xl p-6 card-hover"
                role="listitem"
              >
                <div className="flex items-start gap-4">
                  {/* Rank number */}
                  <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h2 className="font-semibold text-lg">{rec.title}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: priorityConf.bg,
                            color: priorityConf.color,
                          }}
                        >
                          {priorityConf.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {effortConf.emoji} {effortConf.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                      {rec.reason}
                    </p>

                    {/* Impact metrics */}
                    <div className="flex flex-wrap gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Annual saving</p>
                        <p className="font-bold text-primary">
                          {formatCO2(rec.expectedCarbonImpact)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">% of footprint</p>
                        <p className="font-bold text-emerald-400">
                          -{rec.percentageImpact.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Impact timeline</p>
                        <p className="font-medium text-sm">{rec.timeToImpact}</p>
                      </div>
                    </div>

                    {/* Action steps */}
                    {rec.actionSteps.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Steps to take:</p>
                        <ul className="space-y-1">
                          {rec.actionSteps.map((step, si) => (
                            <li key={si} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-0.5 shrink-0">→</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Category icon */}
                  <div className="p-2 rounded-xl bg-muted shrink-0">
                    <CategoryIcon className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
