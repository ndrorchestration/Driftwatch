/**
 * env.ts — minimal browser environment parsing for Driftwatch.
 *
 * The current public application does not have a verified server-side Gemini
 * boundary. A VITE_-prefixed key, if deliberately supplied for local
 * development, is browser-visible by design and must never be treated as a
 * protected deployment secret.
 */

export interface Env {
  VITE_GEMINI_API_KEY?: string;
  MODE: 'development' | 'production' | 'test';
}

function parseMode(value: string | undefined): Env['MODE'] {
  if (value === 'production' || value === 'test') return value;
  return 'development';
}

function parseEnv(): Env {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();

  if (apiKey && !apiKey.startsWith('AIza')) {
    throw new Error(
      '[Driftwatch] VITE_GEMINI_API_KEY appears malformed — expected prefix "AIza".',
    );
  }

  return {
    VITE_GEMINI_API_KEY: apiKey || undefined,
    MODE: parseMode(import.meta.env.MODE),
  };
}

export const env = parseEnv();
