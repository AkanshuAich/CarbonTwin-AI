import { NextRequest, NextResponse } from "next/server";
import { generateScenarioNarrative } from "@/services/gemini/scenario";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/utils/logger";
import { z } from "zod";

const RequestSchema = z.object({
  scenarioName: z.string().min(1).max(100),
  savedKgCO2ePerYear: z.number().nonnegative(),
  percentageReduction: z.number().min(0).max(100),
  changeLabels: z.array(z.string().max(100)).max(10),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    // Slightly tighter limit — narrative generation is not interactive like the coach
    const rateLimitResponse = checkRateLimit(ip, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    logger.info({
      message: "Generating AI scenario narrative",
      scenarioName: parsed.scenarioName,
    });

    const narrative = await generateScenarioNarrative({
      scenarioName: parsed.scenarioName,
      savedKgCO2ePerYear: parsed.savedKgCO2ePerYear,
      percentageReduction: parsed.percentageReduction,
      changeLabels: parsed.changeLabels,
    });

    return NextResponse.json(
      { narrative },
      {
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message: "Scenario narrative generation error", error: errorMessage });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
