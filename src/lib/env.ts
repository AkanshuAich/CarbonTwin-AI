import { z } from "zod";

const envSchema = z.object({
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Google Maps (public - only for loading the script)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),

  // Gemini (server-side only)
  GEMINI_API_KEY: z.string().min(1),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Only validate on server side to protect secrets
function validateEnv() {
  if (typeof window !== "undefined") {
    // Client-side: only validate public vars
    return envSchema.partial().parse(process.env);
  }
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
