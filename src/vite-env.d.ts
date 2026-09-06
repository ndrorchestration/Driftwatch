/// <reference types="vite/client" />

// Keep Vite's canonical ImportMeta/ImportMetaEnv declarations. App.tsx currently
// carries its own narrow declaration for VITE_GEMINI_API_KEY; duplicating the
// `env` property here with a different structural type breaks TypeScript.

declare const now: number;
