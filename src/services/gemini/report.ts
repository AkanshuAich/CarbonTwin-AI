import { getProModel } from "./client";
import type { CarbonTwinProfile, CarbonFootprint, WeeklyReport } from "@/types";
import type { CategoryFootprint } from "@/types";

/**
 * Returns the category key with the highest emission value.
 * Extracted to avoid duplicating the sort expression in two places
 * within the same function.
 */
function getBiggestEmissionSource(
  categories: CategoryFootprint
): keyof CategoryFootprint {
  const entries = Object.entries(categories) as Array<
    [keyof CategoryFootprint, number]
  >;
  return (
    entries.sort(([, a], [, b]) => b - a)[0]?.[0] ?? "transport"
  );
}

/**
 * Generate a personalized weekly sustainability report
 */
export async function generateWeeklyReport(
  userId: string,
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): Promise<Omit<WeeklyReport, "id">> {
  const model = getProModel();
  const biggestSource = getBiggestEmissionSource(footprint.categories);

  const prompt = `You are CarbonTwin AI's sustainability expert. Generate a personalized, insightful weekly sustainability report for this user.

USER PROFILE:
- Transport: ${profile.transport.primaryMode} (${profile.transport.weeklyKm} km/week), ${profile.transport.shortHaulFlights + profile.transport.longHaulFlights} flights/year
- Diet: ${profile.diet.type}
- Energy: ${profile.energy.monthlyKwh} kWh/month on ${profile.energy.energySource} 
- Shopping recycling rate: ${profile.shopping.recyclingPercentage}%

FOOTPRINT:
- Total: ${footprint.total} kgCO2e/year (${footprint.monthly} kgCO2e/month)
- Breakdown: Transport ${footprint.categories.transport}, Diet ${footprint.categories.diet}, Energy ${footprint.categories.energy}, Shopping ${footprint.categories.shopping} kgCO2e/year

The biggest emission source is: ${biggestSource}

Write a warm, motivating report that:
1. Celebrates any wins the user has already made
2. Identifies their biggest opportunity area
3. Gives 3 specific, actionable recommendations for this week
4. Ends with an encouraging message

Format your response as JSON:
{
  "summary": "2-3 sentence personalized summary mentioning their actual footprint numbers",
  "improvements": ["improvement 1", "improvement 2"],
  "recommendedActions": ["Action 1 with specific detail", "Action 2", "Action 3"],
  "encouragementMessage": "Motivating closing message"
}

Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const json = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  const data = JSON.parse(json) as {
    summary: string;
    improvements: string[];
    recommendedActions: string[];
    encouragementMessage: string;
  };

  return {
    userId,
    weekOf: new Date(),
    summary: data.summary,
    biggestSource,
    improvements: data.improvements,
    recommendedActions: data.recommendedActions,
    footprintThisWeek: footprint.monthly / 4.33,
    comparedToPreviousWeek: 0, // Would need historical data for real comparison
    generatedAt: new Date(),
  };
}
