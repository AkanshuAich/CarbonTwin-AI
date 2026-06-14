import { genAI } from "./client";
import { logger } from "@/utils/logger";

const FALLBACK_MODEL = "gemini-2.5-flash-lite";

/**
 * Wraps a Gemini model call with automatic fallback to the lite model
 * on quota or overload errors (503/429). This pattern is used by every
 * Gemini service in the application.
 *
 * @param primary - Async function that calls the primary model
 * @param fallback - Async function that receives a fallback model instance
 * @param context - Label used in warning logs to identify the caller
 */
export async function withGeminiFallback<T>(
  primary: () => Promise<T>,
  fallback: (model: ReturnType<typeof genAI.getGenerativeModel>) => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await primary();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.warn({
      message: `Primary Gemini model failed in ${context}, falling back to ${FALLBACK_MODEL}`,
      error: errorMessage,
    });
    const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    return fallback(fallbackModel);
  }
}
