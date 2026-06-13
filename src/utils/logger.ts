/**
 * Structured logger for Google Cloud operations
 * Emits JSON formatted logs that Cloud Logging can parse automatically
 */
type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

interface LogPayload {
  message: string;
  [key: string]: unknown;
}

export const logger = {
  log: (severity: LogLevel, payload: LogPayload | string) => {
    const entry =
      typeof payload === "string"
        ? { severity, message: payload }
        : { severity, ...payload };

    // Use JSON.stringify for Cloud Logging structured format
    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(entry));
    } else {
      // Human readable format for local development
      const colorMap = {
        DEBUG: "\x1b[34m", // Blue
        INFO: "\x1b[32m", // Green
        WARNING: "\x1b[33m", // Yellow
        ERROR: "\x1b[31m", // Red
        CRITICAL: "\x1b[41m", // Red background
      };
      const reset = "\x1b[0m";
      const { message, ...meta } = entry;
      const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : "";
      
      const logFn = severity === "ERROR" || severity === "CRITICAL" ? console.error : 
                    severity === "WARNING" ? console.warn : console.log;
                    
      logFn(`${colorMap[severity]}[${severity}]${reset} ${message}${metaStr}`);
    }
  },

  debug: (payload: LogPayload | string) => logger.log("DEBUG", payload),
  info: (payload: LogPayload | string) => logger.log("INFO", payload),
  warn: (payload: LogPayload | string) => logger.log("WARNING", payload),
  error: (payload: LogPayload | string) => logger.log("ERROR", payload),
  critical: (payload: LogPayload | string) => logger.log("CRITICAL", payload),
};
