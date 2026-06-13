"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, RefreshCw, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { getCarbonTwinProfile, getLatestWeeklyReport } from "@/services/firebase/firestore";
import { calculateCarbonFootprint } from "@/lib/carbon/calculator";
import type { WeeklyReport } from "@/types";
import { formatCO2, cn } from "@/utils";

export default function ReportPage() {
  const { user } = useAuthContext();

  const { data: profile } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  const { data: existingReport } = useQuery({
    queryKey: ["latestReport", user?.uid],
    queryFn: () => getLatestWeeklyReport(user!.uid),
    enabled: !!user?.uid,
  });

  const {
    data: report,
    mutate: generateReport,
    isPending,
  } = useMutation<WeeklyReport>({
    mutationFn: async () => {
      if (!profile || !user) throw new Error("No profile");
      const footprint = calculateCarbonFootprint(profile);
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, profile, footprint }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      return data.report;
    },
  });

  const displayReport = report ?? existingReport;

  const CATEGORY_LABELS: Record<string, string> = {
    transport: "Transport 🚗",
    diet: "Diet & Food 🥗",
    energy: "Home Energy ⚡",
    shopping: "Shopping 🛍️",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-6 h-6 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold">Weekly Sustainability Report</h1>
          </div>
          <p className="text-muted-foreground">
            AI-generated personalized insights about your environmental impact
          </p>
        </div>
        <button
          onClick={() => generateReport()}
          disabled={isPending || !profile}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium gradient-brand text-white",
            "hover:shadow-lg hover:shadow-primary/20 transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed"
          )}
          aria-label="Generate new weekly report"
        >
          {isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          )}
          {isPending ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="glass rounded-2xl p-12 text-center" aria-busy="true">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-semibold mb-1">Gemini is analyzing your Carbon Twin...</p>
          <p className="text-muted-foreground text-sm">
            Generating your personalized weekly report
          </p>
        </div>
      )}

      {/* Empty state */}
      {!displayReport && !isPending && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full gradient-brand-subtle flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No report yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Generate your first weekly sustainability report to get AI-powered insights 
            about your carbon footprint.
          </p>
          <button
            onClick={() => generateReport()}
            disabled={!profile}
            className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold"
          >
            Generate First Report
          </button>
        </div>
      )}

      {/* Report content */}
      {displayReport && !isPending && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          role="article"
          aria-label="Weekly sustainability report"
        >
          {/* Summary card */}
          <div className="glass rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">This Week&apos;s Summary</h2>
            </div>
            <p className="text-foreground leading-relaxed">{displayReport.summary}</p>

            {/* Weekly footprint */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">This week&apos;s footprint</p>
                <p className="text-xl font-bold text-primary mt-0.5">
                  {formatCO2(displayReport.footprintThisWeek)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Biggest source</p>
                <p className="text-xl font-bold mt-0.5">
                  {CATEGORY_LABELS[displayReport.biggestSource] ?? displayReport.biggestSource}
                </p>
              </div>
            </div>
          </div>

          {/* Improvements */}
          {displayReport.improvements.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                <h2 className="font-semibold">What You&apos;re Doing Well</h2>
              </div>
              <ul className="space-y-2" role="list">
                {displayReport.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0" aria-hidden="true">✓</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended actions */}
          {displayReport.recommendedActions.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" aria-hidden="true" />
                <h2 className="font-semibold">Recommended Actions This Week</h2>
              </div>
              <ol className="space-y-2" role="list">
                {displayReport.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span
                      className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Report metadata */}
          <p className="text-xs text-muted-foreground text-center">
            Generated by Gemini AI on{" "}
            {new Date(displayReport.generatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>
      )}
    </div>
  );
}
