import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Get the Gemini Flash model (for real-time features)
 */
export function getFlashModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
}

/**
 * Get the Gemini model configured for deliberate, high-quality outputs
 * (weekly reports, scenario narratives — lower temperature, higher token budget)
 */
export function getProModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.6,  // More focused/deterministic for reports
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 4096,  // Higher budget for detailed reports
    },
  });
}

export { genAI };
