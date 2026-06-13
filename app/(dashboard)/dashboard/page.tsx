"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Zap, Globe, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { getCarbonTwinProfile, deleteCarbonTwinProfile } from "@/services/firebase/firestore";
import { buildDashboardData } from "@/lib/carbon/calculator";
import { formatCO2, formatPercent, getRankConfig } from "@/utils";
import { CarbonScoreCard } from "@/features/dashboard/CarbonScoreCard";
import { FootprintBreakdownChart } from "@/features/dashboard/FootprintBreakdownChart";
import { MonthlyTrendsChart } from "@/features/dashboard/MonthlyTrendsChart";
import { CategoryCards } from "@/features/dashboard/CategoryCards";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["carbonTwinProfile", user?.uid],
    queryFn: () => getCarbonTwinProfile(user!.uid),
    enabled: !!user?.uid,
  });

  const dashboardData = useMemo(
    () => (profile?.onboardingCompleted ? buildDashboardData(profile) : null),
    [profile]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Calculating your Carbon Twin...</p>
        </div>
      </div>
    );
  }

  if (!profile?.onboardingCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-10 text-center max-w-lg"
        >
          <div className="w-20 h-20 rounded-full gradient-brand-subtle flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl" aria-hidden="true">🌱</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">Create Your Carbon Twin</h1>
          <p className="text-muted-foreground mb-6">
            Welcome to CarbonTwin AI! Complete a quick onboarding to create your 
            Digital Carbon Twin and start understanding your environmental impact.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
            aria-label="Start the onboarding process to create your Carbon Twin"
          >
            Get Started <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    );
  }


  if (!dashboardData) return null;

  const { currentFootprint, monthlyHistory, globalAverage, rank } = dashboardData;
  const rankConfig = getRankConfig(rank);
  const vsGlobal = ((currentFootprint.total - globalAverage) / globalAverage) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carbon Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back,{" "}
            <span className="text-foreground font-medium">
              {user?.displayName?.split(" ")[0]}
            </span>{" "}
            — here&apos;s your environmental footprint overview
          </p>
        </div>
        <Link
          href="/future-impact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          <TrendingDown className="w-4 h-4" aria-hidden="true" />
          Explore Future Impact
        </Link>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CarbonScoreCard
          score={dashboardData.score}
          rank={rank}
          rankConfig={rankConfig}
        />
        <div className="glass rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Annual Footprint</p>
              <p className="text-3xl font-bold mt-1">{formatCO2(currentFootprint.total)}</p>
            </div>
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: rankConfig.bgColor }}
            >
              <TrendingDown
                className="w-5 h-5"
                style={{ color: rankConfig.color }}
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Monthly:{" "}
            <span className="font-medium text-foreground">
              {formatCO2(currentFootprint.monthly)}
            </span>
          </p>
        </div>
        <div className="glass rounded-2xl p-6 card-hover">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">vs Global Average</p>
              <p
                className="text-3xl font-bold mt-1"
                style={{ color: vsGlobal > 0 ? "#ef4444" : "#22c55e" }}
              >
                {formatPercent(Math.abs(vsGlobal), false)}
                {vsGlobal > 0 ? " above" : " below"}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Globe className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Global avg:{" "}
            <span className="font-medium text-foreground">
              {formatCO2(globalAverage)}/year
            </span>
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Footprint by Category</h2>
          <FootprintBreakdownChart categories={currentFootprint.categories} />
        </div>
        <div className="lg:col-span-3 glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">6-Month Trend</h2>
          <MonthlyTrendsChart data={monthlyHistory} />
        </div>
      </div>

      {/* Category Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
        <CategoryCards categories={currentFootprint.categories} total={currentFootprint.total} />
      </div>

      {/* CTA to Future Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-8 text-center border border-primary/20"
      >
        <div className="w-14 h-14 rounded-full gradient-brand-subtle flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold mb-2">Ready to make a change?</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Use the Future Impact Explorer to simulate lifestyle changes and see 
          exactly how much CO₂ you can save before committing to any changes.
        </p>
        <Link
          href="/future-impact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          Open Future Impact Explorer <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </motion.div>

      {/* Reset Twin Button */}
      <div className="flex justify-center mt-12 pb-8">
        <button
          onClick={async () => {
            if (confirm("Are you sure you want to reset your Carbon Twin? This cannot be undone.")) {
              await deleteCarbonTwinProfile(user!.uid);
              await queryClient.invalidateQueries({ queryKey: ["carbonTwinProfile", user!.uid] });
              router.push("/onboarding");
            }
          }}
          className="text-sm text-destructive hover:underline"
        >
          Reset my Carbon Twin
        </button>
      </div>
    </div>
  );
}
