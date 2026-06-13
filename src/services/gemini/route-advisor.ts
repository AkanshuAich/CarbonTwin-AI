import { getFlashModel, genAI } from "./client";

export async function generateRouteAdvice(origin: string, destination: string): Promise<string> {
  const model = getFlashModel();

  const prompt = `You are a CarbonTwin AI Route Advisor. The user wants to travel from "${origin}" to "${destination}".
Google Maps Directions API could not find a direct ground route for this journey (likely because it crosses oceans, involves unmapped borders, or is an extreme distance).

Provide a practical, multi-modal travel itinerary that minimizes carbon emissions while remaining realistic.

RULES:
1. If an ocean must be crossed, it is perfectly fine to suggest a direct flight. Do not suggest a 3-week cargo ship voyage unless mentioning it as an extreme edge case.
2. Focus your green advice on the "last mile" and local connections. For example: "Take a direct flight from A to B. Once you land, use the local high-speed rail or electric transit instead of a private taxi."
3. Keep it relatively concise (3-4 sentences max).
4. Use an encouraging, eco-conscious tone.
5. Do not use markdown headers, just return a simple, clean string of text.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.response.text().trim();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.warn("Primary model failed for route advice, falling back to gemini-2.5-flash-lite", errorMessage);
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const result = await fallbackModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return result.response.text().trim();
    } catch (fallbackError: unknown) {
      console.error("Fallback model also failed", fallbackError);
      return `For long-distance or cross-ocean travel from ${origin} to ${destination}, flights are usually necessary. To keep your footprint low, choose direct flights and use public transit or electric trains once you arrive at your destination!`;
    }
  }
}
