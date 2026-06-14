import { getProModel } from "./client";
import { withGeminiFallback } from "./withFallback";

export interface ScenarioNarrativeInput {
  scenarioName: string;
  savedKgCO2ePerYear: number;
  percentageReduction: number;
  changeLabels: string[];
}

/**
 * Generate a concise, motivational 2-3 sentence AI narrative describing
 * the real-world impact of a user's simulated lifestyle scenario.
 * Uses the Pro model (lower temperature, higher focus) like the report service.
 * Falls back to gemini-2.5-flash-lite on quota errors via withGeminiFallback.
 */
export async function generateScenarioNarrative(
  input: ScenarioNarrativeInput
): Promise<string> {
  const savedTonnes = (input.savedKgCO2ePerYear / 1000).toFixed(2);
  const changesList = input.changeLabels.join(", ");

  const prompt = `You are a sustainability AI assistant. A user has simulated a lifestyle scenario called "${input.scenarioName}" which combines these changes: ${changesList}.

This would save ${input.savedKgCO2ePerYear} kg CO₂e per year (${input.percentageReduction.toFixed(1)}% reduction = ${savedTonnes} tonnes of CO₂).

Write a short, warm, and motivating narrative of exactly 2-3 sentences that:
1. Acknowledges what they're doing in plain human language
2. Frames the ${savedTonnes} tonne saving in a relatable real-world context (e.g. equivalent impact to something tangible)
3. Ends with a positive, action-oriented encouragement

Keep the tone friendly and empowering, not preachy. Do not use bullet points or headers. Output only the narrative text.`;

  return withGeminiFallback(
    async () => {
      const result = await getProModel().generateContent(prompt);
      return result.response.text().trim();
    },
    async (fallbackModel) => {
      const result = await fallbackModel.generateContent(prompt);
      return result.response.text().trim();
    },
    "generateScenarioNarrative"
  );
}
