import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyReport } from "@/services/gemini/report";
import { saveWeeklyReport } from "@/services/firebase/firestore";
import { z } from "zod";

const RequestSchema = z.object({
  userId: z.string().min(1),
  profile: z.record(z.string(), z.unknown()),
  footprint: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const report = await generateWeeklyReport(
      parsed.userId,
      parsed.profile as unknown as Parameters<typeof generateWeeklyReport>[1],
      parsed.footprint as unknown as Parameters<typeof generateWeeklyReport>[2]
    );

    const id = await saveWeeklyReport(report);

    return NextResponse.json({ report: { ...report, id } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("Report error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
