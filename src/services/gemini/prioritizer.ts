import { getFlashModel } from "./client";
import { withGeminiFallback } from "./withFallback";
import type { CarbonTwinProfile, CarbonFootprint, AIRecommendation } from "@/types";
import { z } from "zod";

const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  reason: z.string(),
  expectedCarbonImpact: z.number(),
  percentageImpact: z.number(),
  priorityLevel: z.enum(["high", "medium", "low"]),
  effortLevel: z.enum(["easy", "moderate", "hard"]),
  category: z.enum(["transport", "diet", "energy", "shopping"]),
  actionSteps: z.array(z.string()),
  timeToImpact: z.string(),
});

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});

/**
 * Strips any markdown fencing that models may still add despite the
 * `responseMimeType: "application/json"` generation config.
 */
function cleanJsonResponse(text: string): string {
  return text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
}

/**
 * Generate personalized AI recommendations using the Carbon Twin profile
 */
export async function generateAIRecommendations(
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): Promise<AIRecommendation[]> {
  const prompt = `You are a carbon footprint expert. Analyze this user's Carbon Twin profile and generate exactly 6 personalized, actionable recommendations to reduce their carbon footprint.

USER PROFILE:
- Transport: ${profile.transport.primaryMode} (${profile.transport.weeklyKm} km/week), ${profile.transport.shortHaulFlights} short-haul + ${profile.transport.longHaulFlights} long-haul flights/year
- Diet: ${profile.diet.type}, ${profile.diet.meatMealsPerWeek} meat meals/week, ${profile.diet.dairyServingsPerDay} dairy/day
- Energy: ${profile.energy.monthlyKwh} kWh/month, source: ${profile.energy.energySource}, household: ${profile.energy.householdSize} people
- Shopping: ${profile.shopping.newClothingItemsPerYear} clothing items/year, ${profile.shopping.electronicsPerYear} electronics/year, ${profile.shopping.onlineOrdersPerMonth} online orders/month, recycling: ${profile.shopping.recyclingPercentage}%

CURRENT FOOTPRINT:
- Total: ${footprint.total} kgCO2e/year
- Transport: ${footprint.categories.transport} kgCO2e/year
- Diet: ${footprint.categories.diet} kgCO2e/year
- Energy: ${footprint.categories.energy} kgCO2e/year
- Shopping: ${footprint.categories.shopping} kgCO2e/year

Generate a JSON response with this exact structure:
{
  "recommendations": [
    {
      "id": "unique_id_1",
      "title": "Specific action title",
      "reason": "Why this matters for THIS user specifically (mention their actual numbers)",
      "expectedCarbonImpact": 500,
      "percentageImpact": 10.5,
      "priorityLevel": "high",
      "effortLevel": "easy",
      "category": "transport",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "timeToImpact": "Immediate"
    }
  ]
}

RULES:
- All recommendations must be specific to this user's actual data
- expectedCarbonImpact is in kgCO2e/year
- priorityLevel: high (>15% reduction), medium (5-15%), low (<5%)
- effortLevel: easy (no cost/habit change), moderate (some effort), hard (major change)
- Rank by impact descending
- Do NOT give generic advice. Reference their specific numbers.
- Return ONLY valid JSON, no markdown.`;

  const generateConfig = { responseMimeType: "application/json" } as const;

  const text = await withGeminiFallback(
    async () => {
      const result = await getFlashModel().generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generateConfig,
      });
      return result.response.text().trim();
    },
    async (fallbackModel) => {
      const result = await fallbackModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generateConfig,
      });
      return result.response.text().trim();
    },
    "generateAIRecommendations"
  );

  const parsed = RecommendationsResponseSchema.parse(
    JSON.parse(cleanJsonResponse(text))
  );
  return parsed.recommendations;
}
