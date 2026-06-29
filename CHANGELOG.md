# Changelog — Driftwatch

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- CI workflow: TypeScript type-check, ESLint, build gate (`.github/workflows/ci.yml`)
- `VITE_GEMINI_API_KEY` environment variable documented in `.env.example` with inline guidance on the required `VITE_` prefix and key acquisition URL
- README Quick Start expanded with Environment Setup section to prevent Gemini agent cognition errors on first run
- `vercel.json` — Vite/React deployment configuration for Vercel (S071)
- `src/lib/env.ts` — Zod-validated environment parsing; app fails fast with a clear error on missing required vars (S076)
- `src/lib/memory.ts` — Agent session memory architecture (S076)
- `src/lib/trace.ts` — Runtime trace logging for agent decisions and state transitions (S076)
- `src/agents/herald.ts` — Agent Herald extracted as dedicated module; Gemini-powered host cognition layer (S077)
- `src/audio/` — AudioEngine extracted as dedicated subsystem (S077)
- `AGENTS.md` updated: Formation Registry table added mapping all agents and subsystems to module paths and status; S071–S077 session anchor table appended
- `GOVERNANCE.md` updated: 2026-06-29 sprint session anchor added

### Fixed
- esbuild parse failure: extracted `ChatMessage` interface to resolve inline-generic ternary misparse in `App.tsx` (S076 build gate)
- `VITE_GEMINI_API_KEY` prefix alignment between `vite.config.ts` define block and `import.meta.env` read site
- 6 runtime bugs: stale `dissonanceCount` closure ref, shallow config mutation, missing outer wrapper close tag, `Vector3` allocated inside render loop, pointer-events layering conflict, dead `@google/genai` import

### Performance
- `manualChunks` code-splitting added to `vite.config.ts` — addressed 877 kB monolithic bundle (S073)
- Surgical per-library chunk split: `three`, `gsap`, `motion`, `lucide` each in dedicated lazy-loaded chunk (S074)

### Security
- Content Security Policy (CSP) and HTTP hardening headers added to `vercel.json`
- Dev server scoped to `localhost`; `dev:expose` script added for intentional network binding
- `express` moved to `devDependencies` and upgraded to v5 to resolve outstanding CVEs
- `postcss` bumped 8.5.9 → 8.5.13 — CVE-2026-41305 XSS patch (Dependabot)

---

## [1.0.0] — 2026-04-11

### Added
- Initial release: Phi-driven multi-agent synthesis simulation
- Real-time drift detection engine
- Truth scoring system
- Harmonic state monitoring
- `AGENTS.md` formation registry
- `CONTRIBUTING.md`, `SECURITY.md` community health files
- `tsconfig.json` + `vite.config.ts` TypeScript/Vite scaffold
- `.env.example` environment template

---

_Maintained by ndrorchestration | Governed by Agent Amethyst_
