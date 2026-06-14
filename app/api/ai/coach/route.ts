import { NextRequest, NextResponse } from "next/server";
import { generateCoachResponse } from "@/services/gemini/coach";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/utils/logger";
import { sanitizeInput } from "@/utils";
import { z } from "zod";

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.coerce.date(),
    })
  ).max(20),
  profile: z.any(), // Will be typed by CarbonTwinProfile in the function
  footprint: z.any(), // Will be typed by CarbonFootprint in the function
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const rateLimitResponse = checkRateLimit(ip, { limit: 15, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    logger.info({ message: "Generating AI Coach response" });

    const sanitizedMessage = sanitizeInput(parsed.message);

    // Stream response from Gemini
    const stream = await generateCoachResponse(
      sanitizedMessage,
      parsed.history as Parameters<typeof generateCoachResponse>[1],
      parsed.profile,
      parsed.footprint
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error({ message: "AI Coach error", error: errorMessage });

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
