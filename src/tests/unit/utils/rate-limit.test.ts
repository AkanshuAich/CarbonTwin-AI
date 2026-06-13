/**
 * @jest-environment node
 */
import { NextResponse } from "next/server";

// Note: rate-limit.ts contains a module-level setInterval; fake timers must be
// activated before the module is imported so the interval is also faked.
jest.useFakeTimers();

// Re-import after fake timers are active
const { checkRateLimit } = jest.requireActual<typeof import("@/lib/rate-limit")>(
  "@/lib/rate-limit"
);

describe("checkRateLimit", () => {
  // Advance time past any existing windows between tests
  beforeEach(() => {
    jest.advanceTimersByTime(120_000);
  });

  it("should allow the first request from a new IP", () => {
    const result = checkRateLimit("1.2.3.4");
    expect(result).toBeNull();
  });

  it("should allow requests within the limit window", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(ip, { limit: 10, windowMs: 60_000 })).toBeNull();
    }
  });

  it("should block requests that exceed the limit and return a 429 response", () => {
    const ip = "192.168.1.5";
    const config = { limit: 3, windowMs: 60_000 };
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    // 4th request exceeds limit
    const result = checkRateLimit(ip, config);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(429);
  });

  it("should return a 429 JSON body with the expected error message", async () => {
    const ip = "192.168.1.99";
    const config = { limit: 1, windowMs: 60_000 };
    checkRateLimit(ip, config); // 1st — allowed
    const result = checkRateLimit(ip, config); // 2nd — blocked
    expect(result).not.toBeNull();
    const body = await (result as NextResponse).json();
    expect(body).toEqual({ error: "Too many requests. Please try again later." });
  });

  it("should reset the counter after the window expires", () => {
    const ip = "172.16.0.1";
    const config = { limit: 2, windowMs: 30_000 };
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    expect(checkRateLimit(ip, config)).not.toBeNull(); // over limit

    // Advance past window
    jest.advanceTimersByTime(31_000);

    // Should be allowed again in a new window
    expect(checkRateLimit(ip, config)).toBeNull();
  });

  it("should track different IPs independently", () => {
    const config = { limit: 2, windowMs: 60_000 };
    checkRateLimit("ip-A", config);
    checkRateLimit("ip-A", config);
    expect(checkRateLimit("ip-A", config)).not.toBeNull(); // A is over limit
    expect(checkRateLimit("ip-B", config)).toBeNull();    // B is fresh
  });

  it("should use default config when none is provided", () => {
    expect(checkRateLimit("default-config-ip")).toBeNull();
  });

  it("should clean up expired entries when the cleanup interval fires", () => {
    const ip = "cleanup-test-ip";
    checkRateLimit(ip, { limit: 5, windowMs: 1_000 });
    jest.advanceTimersByTime(2_000);     // window expires
    jest.advanceTimersByTime(60_000);   // cleanup interval fires
    // New request should be treated as a fresh start
    expect(checkRateLimit(ip, { limit: 5, windowMs: 60_000 })).toBeNull();
  });
});
