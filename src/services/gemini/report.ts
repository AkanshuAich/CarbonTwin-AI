import { getProModel, getFlashModel } from "./client";
import type { CarbonTwinProfile, CarbonFootprint, WeeklyReport } from "@/types";

/**
 * Generate a personalized weekly sustainability report
 */
export async function generateWeeklyReport(
  userId: string,
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): Promise<Omit<WeeklyReport, "id">> {
  const model = getProModel();

  const prompt = `You are CarbonTwin AI's sustainability expert. Generate a personalized, insightful weekly sustainability report for this user.

USER PROFILE:
- Transport: ${profile.transport.primaryMode} (${profile.transport.weeklyKm} km/week), ${profile.transport.shortHaulFlights + profile.transport.longHaulFlights} flights/year
- Diet: ${profile.diet.type}
- Energy: ${profile.energy.monthlyKwh} kWh/month on ${profile.energy.energySource} 
- Shopping recycling rate: ${profile.shopping.recyclingPercentage}%

FOOTPRINT:
- Total: ${footprint.total} kgCO2e/year (${footprint.monthly} kgCO2e/month)
- Breakdown: Transport ${footprint.categories.transport}, Diet ${footprint.categories.diet}, Energy ${footprint.categories.energy}, Shopping ${footprint.categories.shopping} kgCO2e/year

The biggest emission source is: ${Object.entries(footprint.categories)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ?? "unknown"
  }

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
  const data = JSON.parse(json);

  const biggestSource = (Object.entries(footprint.categories)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ?? "transport") as keyof typeof footprint.categories;

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

/**
 * Generate an AI narrative for a future impact scenario
 */
export async function generateScenarioNarrative(
  scenarioName: string,
  savedKgCO2ePerYear: number,
  percentageReduction: number,
  changes: Array<{ label: string; description: string }>
): Promise<string> {
  const model = getFlashModel();

  const prompt = `You are CarbonTwin AI. Write a 2-sentence inspiring narrative for this future lifestyle scenario.

Scenario: "${scenarioName}"
Changes: ${changes.map((c) => c.label).join(", ")}
CO2 saved: ${savedKgCO2ePerYear} kgCO2e/year (${percentageReduction}% reduction)

Write a motivating, specific message about the real-world impact of these changes. Mention the CO2 savings. Be concise and inspiring. No JSON, just plain text.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
