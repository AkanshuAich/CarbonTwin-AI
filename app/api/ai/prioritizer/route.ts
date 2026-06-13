import { NextRequest, NextResponse } from "next/server";
import { generateAIRecommendations } from "@/services/gemini/prioritizer";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const RequestSchema = z.object({
  profile: z.record(z.string(), z.unknown()),
  footprint: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const rateLimitResponse = checkRateLimit(ip, { limit: 5, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const recommendations = await generateAIRecommendations(
      parsed.profile as unknown as Parameters<typeof generateAIRecommendations>[0],
      parsed.footprint as unknown as Parameters<typeof generateAIRecommendations>[1]
    );

    return NextResponse.json(
      { recommendations },
      {
        headers: {
          "Cache-Control": "private, max-age=300", // 5 min cache
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }
    console.error("Prioritizer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
