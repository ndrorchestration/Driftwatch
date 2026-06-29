/**
 * env.ts — Zod environment validation
 * Validates all required env vars at module load time.
 * A missing or malformed var throws at startup, not silently at runtime.
 *
 * Usage: import { env } from '@/lib/env'
 *        env.VITE_GEMINI_API_KEY  // typed, validated string
 */

import { z } from 'zod';

const envSchema = z.object({
  /** Gemini API key — required for agent cognition */
  VITE_GEMINI_API_KEY: z
    .string()
    .min(1, 'VITE_GEMINI_API_KEY is missing. Set it in Vercel → Settings → Environment Variables.')
    .refine((k) => k.startsWith('AIza'), {
      message: 'VITE_GEMINI_API_KEY appears malformed — expected prefix "AIza".',
    }),

  /** App mode — defaults to 'development' */
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Parse and validate import.meta.env at module load.
 * Throws a descriptive ZodError on first missing/invalid var.
 */
function parseEnv() {
  const raw = {
    VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    MODE: import.meta.env.MODE,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    const message = `[Driftwatch] Environment validation failed:\n${issues}\n\nAdd missing vars in Vercel → Settings → Environment Variables.`;
    // In production: surface as a visible error, not a silent undefined
    if (import.meta.env.MODE === 'production') {
      console.error(message);
    }
    throw new Error(message);
  }

  return result.data;
}

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
