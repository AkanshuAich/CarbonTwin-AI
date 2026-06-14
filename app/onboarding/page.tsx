"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/AuthProvider";
import { saveCarbonTwinProfile } from "@/services/firebase/firestore";
import type { CarbonTwinProfile } from "@/types";
import { TransportStep } from "@/features/onboarding/TransportStep";
import { DietStep } from "@/features/onboarding/DietStep";
import { EnergyStep } from "@/features/onboarding/EnergyStep";
import { ShoppingStep } from "@/features/onboarding/ShoppingStep";
import { Leaf, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/utils";
import { logger } from "@/utils/logger";

const STEPS = [
  { id: 1, label: "Transport", emoji: "🚗" },
  { id: 2, label: "Diet", emoji: "🥗" },
  { id: 3, label: "Energy", emoji: "⚡" },
  { id: 4, label: "Shopping", emoji: "🛍️" },
];

type PartialProfile = Pick<
  CarbonTwinProfile,
  "transport" | "diet" | "energy" | "shopping"
>;

const DEFAULT_PROFILE: PartialProfile = {
  transport: {
    primaryMode: "car_petrol",
    weeklyKm: 100,
    flightsPerYear: 2,
    shortHaulFlights: 1,
    longHaulFlights: 1,
  },
  diet: {
    type: "omnivore_medium",
    meatMealsPerWeek: 5,
    dairyServingsPerDay: 2,
    localFoodPercentage: 20,
  },
  energy: {
    monthlyKwh: 300,
    energySource: "grid",
    hasAirConditioning: false,
    hasElectricHeating: false,
    householdSize: 2,
  },
  shopping: {
    newClothingItemsPerYear: 20,
    electronicsPerYear: 1,
    onlineOrdersPerMonth: 4,
    recyclingPercentage: 30,
  },
};

export default function OnboardingPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<PartialProfile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateProfile = <K extends keyof PartialProfile>(
    key: K,
    data: PartialProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveCarbonTwinProfile({
        userId: user.uid,
        ...profile,
        onboardingCompleted: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["carbonTwinProfile", user.uid] });
      router.push("/dashboard");
    } catch (err) {
      logger.error({ message: "Failed to save Carbon Twin profile during onboarding", error: String(err) });
      setSaveError("Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Nav */}
      <nav className="flex items-center gap-2 px-6 py-4 border-b border-border/30">
        <Leaf className="w-6 h-6 text-primary" aria-hidden="true" />
        <span className="font-bold text-lg">CarbonTwin AI</span>
        <span className="text-muted-foreground ml-2 text-sm">· Creating your Digital Carbon Twin</span>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Step indicators */}
          <div className="flex items-center gap-0 mb-10" role="list" aria-label="Onboarding steps">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1" role="listitem">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    disabled={step.id > currentStep}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all",
                      step.id < currentStep
                        ? "gradient-brand text-white cursor-pointer"
                        : step.id === currentStep
                        ? "border-2 border-primary text-primary"
                        : "border-2 border-border text-muted-foreground"
                    )}
                    aria-label={`Step ${step.id}: ${step.label}${step.id < currentStep ? " (completed)" : step.id === currentStep ? " (current)" : ""}`}
                    aria-current={step.id === currentStep ? "step" : undefined}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      step.emoji
                    )}
                  </button>
                  <span className={cn(
                    "text-xs mt-1.5 font-medium",
                    step.id === currentStep ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 mt-[-12px] transition-all",
                      step.id < currentStep ? "bg-primary" : "bg-border"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="glass rounded-2xl p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <TransportStep
                    data={profile.transport}
                    onChange={(data) => updateProfile("transport", data)}
                  />
                )}
                {currentStep === 2 && (
                  <DietStep
                    data={profile.diet}
                    onChange={(data) => updateProfile("diet", data)}
                  />
                )}
                {currentStep === 3 && (
                  <EnergyStep
                    data={profile.energy}
                    onChange={(data) => updateProfile("energy", data)}
                  />
                )}
                {currentStep === 4 && (
                  <ShoppingStep
                    data={profile.shopping}
                    onChange={(data) => updateProfile("shopping", data)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            {saveError && (
              <p role="alert" className="text-destructive text-sm col-span-full mb-2">
                {saveError}
              </p>
            )}
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                "border border-border hover:bg-muted",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </button>

            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium gradient-brand text-white hover:shadow-lg hover:shadow-primary/20 transition-all"
                aria-label="Go to next step"
              >
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium gradient-brand text-white",
                  "hover:shadow-lg hover:shadow-primary/20 transition-all",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                aria-label="Complete onboarding and create your Carbon Twin"
              >
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                {isSaving ? "Creating Twin..." : "Create My Twin"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
