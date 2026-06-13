import { NextRequest, NextResponse } from "next/server";
import { generateRouteAdvice } from "@/services/gemini/route-advisor";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const RequestSchema = z.object({
  origin: z.string().min(1).max(500),
  destination: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const rateLimitResponse = checkRateLimit(ip, { limit: 10, windowMs: 60000 });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const advice = await generateRouteAdvice(parsed.origin, parsed.destination);
    return NextResponse.json({ advice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Origin and destination are required (max 500 characters each)" },
        { status: 400 }
      );
    }
    console.error("Route advisor error:", error);
    return NextResponse.json(
      { error: "Failed to generate route advice" },
      { status: 500 }
    );
  }
}
