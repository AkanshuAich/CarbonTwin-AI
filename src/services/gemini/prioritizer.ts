import { getFlashModel, genAI } from "./client";
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
 * Generate personalized AI recommendations using the Carbon Twin profile
 */
export async function generateAIRecommendations(
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): Promise<AIRecommendation[]> {
  const model = getFlashModel();

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

  let text = "";
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    text = result.response.text().trim();
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    // If we hit a 503 on 2.5-flash, fallback to 2.5-flash-lite which is less likely to hit quotas
    console.warn("Primary model failed, falling back to gemini-2.5-flash-lite", errMessage);
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await fallbackModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    text = result.response.text().trim();
  }

  // Sometimes models still wrap in markdown even with responseMimeType
  const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

  const parsed = RecommendationsResponseSchema.parse(JSON.parse(json));
  return parsed.recommendations;
}
