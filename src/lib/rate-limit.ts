import { NextResponse } from "next/server";

const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { limit: 10, windowMs: 60 * 1000 }
) {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  if (!record || record.expiresAt < now) {
    rateLimitCache.set(ip, { count: 1, expiresAt: now + config.windowMs });
    return null; // Allowed
  }

  if (record.count >= config.limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  record.count++;
  return null; // Allowed
}

// Memory cleanup interval
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitCache.entries()) {
      if (record.expiresAt < now) {
        rateLimitCache.delete(ip);
      }
    }
  }, 60 * 1000);
}
