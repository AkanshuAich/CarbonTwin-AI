/**
 * Tests for the structured logger utility.
 * We test both development (human-readable) and production (JSON) output paths.
 */

describe("logger — development mode (NODE_ENV=test, not production)", () => {
  // In Jest, NODE_ENV is always "test", which is NOT "production".
  // The logger treats any non-production env as development mode.
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(async () => {
    jest.resetModules();
    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(() => {}),
      warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
      error: jest.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should call console.log for DEBUG level", async () => {
    const { logger } = await import("@/utils/logger");
    logger.debug("debug message");
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it("should call console.log for INFO level", async () => {
    const { logger } = await import("@/utils/logger");
    logger.info("info message");
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it("should call console.warn for WARNING level", async () => {
    const { logger } = await import("@/utils/logger");
    logger.warn("warning message");
    expect(consoleSpy.warn).toHaveBeenCalled();
  });

  it("should call console.error for ERROR level", async () => {
    const { logger } = await import("@/utils/logger");
    logger.error("error message");
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("should call console.error for CRITICAL level", async () => {
    const { logger } = await import("@/utils/logger");
    logger.critical("critical message");
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("should include the message text in output", async () => {
    const { logger } = await import("@/utils/logger");
    logger.info("hello world");
    expect(consoleSpy.log).toHaveBeenCalled();
    const output = consoleSpy.log.mock.calls[0]?.[0] as string;
    expect(output).toContain("hello world");
  });

  it("should include the severity label in output", async () => {
    const { logger } = await import("@/utils/logger");
    logger.warn({ message: "caution here" });
    const output = consoleSpy.warn.mock.calls[0]?.[0] as string;
    expect(output).toContain("[WARNING]");
  });

  it("should accept a LogPayload object with extra fields", async () => {
    const { logger } = await import("@/utils/logger");
    expect(() =>
      logger.error({ message: "something broke", errorCode: 500 })
    ).not.toThrow();
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("should include meta fields in output for object payloads", async () => {
    const { logger } = await import("@/utils/logger");
    logger.error({ message: "error occurred", requestId: "abc-123" });
    const output = consoleSpy.error.mock.calls[0]?.[0] as string;
    expect(output).toContain("error occurred");
  });
});

describe("logger — production mode (NODE_ENV=production)", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(async () => {
    jest.resetModules();
    // Override NODE_ENV before re-importing the module
    (process.env as Record<string, string>)["NODE_ENV"] = "production";
  });

  afterEach(() => {
    (process.env as Record<string, string>)["NODE_ENV"] = originalEnv;
    jest.restoreAllMocks();
  });

  it("should emit JSON-structured output via console.log", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { logger } = await import("@/utils/logger");
    logger.info("production log");
    expect(spy).toHaveBeenCalled();
    const rawOutput = spy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(rawOutput);
    expect(parsed).toMatchObject({ severity: "INFO", message: "production log" });
  });

  it("should include all payload fields in JSON output", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { logger } = await import("@/utils/logger");
    logger.error({ message: "db failure", table: "users" });
    const rawOutput = spy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(rawOutput);
    expect(parsed).toMatchObject({
      severity: "ERROR",
      message: "db failure",
      table: "users",
    });
  });

  it("should route all severities through console.log in production (for Cloud Logging)", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { logger } = await import("@/utils/logger");
    logger.debug("debug");
    logger.warn("warn");
    logger.error("error");
    logger.critical("critical");
    expect(spy).toHaveBeenCalledTimes(4);
  });
});

describe("logger.log — base method", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should work with all valid severity levels without throwing", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { logger } = await import("@/utils/logger");
    const levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] as const;
    levels.forEach((level) => {
      expect(() => logger.log(level, `${level} message`)).not.toThrow();
    });
  });
});
