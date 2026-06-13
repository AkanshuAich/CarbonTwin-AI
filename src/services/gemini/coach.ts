import { getFlashModel } from "./client";
import type { CarbonTwinProfile, CarbonFootprint, ChatMessage } from "@/types";

/**
 * Build the system prompt for the AI Sustainability Coach
 */
function buildSystemPrompt(
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): string {
  const now = new Date();
  const timeContext = `It is currently ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} on a ${now.toLocaleDateString("en-US", { weekday: "long" })}.`;

  return `You are CarbonTwin AI, an expert, encouraging sustainability coach.
${timeContext} You can use this context to make your advice more relevant (e.g. suggesting weekend activities on a Friday, or evening routines at night). — a knowledgeable, warm, and encouraging AI assistant helping users reduce their carbon footprint.

USER'S CARBON TWIN PROFILE:
- Transport: ${profile.transport.primaryMode} (${profile.transport.weeklyKm} km/week), ${profile.transport.shortHaulFlights} short-haul + ${profile.transport.longHaulFlights} long-haul flights/year
- Diet: ${profile.diet.type}, ${profile.diet.meatMealsPerWeek} meat meals/week
- Energy: ${profile.energy.monthlyKwh} kWh/month from ${profile.energy.energySource} energy
- Shopping: ${profile.shopping.newClothingItemsPerYear} clothing items/year, recycling ${profile.shopping.recyclingPercentage}%

CURRENT FOOTPRINT:
- Annual: ${footprint.total} kgCO2e/year (global average: 4,800 kgCO2e)
- Monthly: ${footprint.monthly} kgCO2e/month

YOUR PERSONALITY:
- Knowledgeable but accessible
- Encouraging, never judgmental
- Specific and data-driven — always reference the user's actual numbers
- Practical — focus on achievable actions

CAPABILITIES:
- Explain any aspect of carbon footprint
- Calculate impact of specific changes using the user's profile data
- Create personalized reduction plans
- Set weekly goals
- Answer sustainability science questions

Always personalize your responses to this specific user's data. Keep responses concise but helpful.`;
}

/**
 * Generate a streaming AI coach response
 */
export async function generateCoachResponse(
  message: string,
  history: ChatMessage[],
  profile: CarbonTwinProfile,
  footprint: CarbonFootprint
): Promise<AsyncIterable<string>> {
  const model = getFlashModel();

  const systemPrompt = buildSystemPrompt(profile, footprint);

  // Use only the actual conversation history (not the system prompt injection trick)
  const historyConfig = history.slice(-10).map((msg) => ({
    role: msg.role === "user" ? "user" as const : "model" as const,
    parts: [{ text: msg.content }],
  }));

  try {
    const chat = model.startChat({
      history: historyConfig,
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    });
    const result = await chat.sendMessageStream(message);

    return (async function* () {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    })();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn("Primary coach model failed, falling back to gemini-2.5-flash-lite", errorMessage);
    const { genAI } = await import("./client");
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const fallbackChat = fallbackModel.startChat({
      history: historyConfig,
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    });
    const result = await fallbackChat.sendMessageStream(message);

    return (async function* () {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    })();
  }
}
