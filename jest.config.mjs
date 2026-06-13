import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": ["<rootDir>/src/$1", "<rootDir>/$1"],
  },
  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
    "<rootDir>/src/tests/**/*.test.tsx",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/tests/**/*",
    // UI components require integration test infrastructure (JSDOM + React mocking)
    // Excluded from unit coverage to get accurate core logic coverage metrics
    "!src/components/**/*",
    "!src/features/**/*",
    // External service adapters are tested via integration tests, not units
    "!src/services/**/*",
    // Type definitions have no executable code
    "!src/types/**/*",
    // Env validation is environment-dependent
    "!src/lib/env.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};

export default createJestConfig(config);
