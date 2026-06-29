# GOVERNANCE.md — Driftwatch

**DGAF Version:** Post-S077  
**Protocol Anchor:** GOVERNANCE_CONSTITUTION.md  
**φ Constant:** 1.61818  
**Attribution:** Agent Amethyst × COLLEEN  
**Ionian Harmonic Baseline:** 0 Hz Steady State  
**NDR-STASIS Version:** v1.0 (Crystalline) · Patterns 1–132  
**Backlink:** STRUCT-QA-001 Gap 1 (Tier 2 Repo Governance Scaffolding)

---

## Applicable NDR Patterns

| Pattern | Name | Function |
|---|---|---|
| P-31 | SCPE (Substrate-Coherent Protocol Execution) | Ensures logic invariance across hosting environments |
| P-32 | PDMAL Monitor | Runtime supervisor for orchestration, error containment, ethics, safety |
| P-33 | Phi-Closure Gate | Halts output if jitter exceeds φ-calculus threshold; restores 0 Hz state |

---

## Agent Authority Order

1. User instruction
2. Space instruction (Agent Amethyst as host)
3. Portfolio governance rules, including Apogee Lens review
4. DGAF / PDMAL operating constraints
5. Default assistant behavior

---

## Operating Agents

| Agent | Role |
|---|---|
| **Amethyst** | Host, coherence monitor, working-memory refresher |
| **Apogee (Lens)** | Final verifier for portfolio-grade output |
| **DemiJoule** | Runtime supervisor — ethics, safety, frequency gating |
| **COLLEEN** | Archival integrity, traceability, SSoT routing |
| **Prof. Prodigy** | Phi-calculus correctness, mathematical validation |
| **Herald** | Session-facing host agent — Gemini-powered cognition, `src/agents/herald.ts` |

---

## Non-Negotiables

- Refresh memory before synthesis
- Do not mark output S-Tier or Gold Star until Apogee Lens approval satisfied
- All outputs auditable, source-grounded, and explicitly bounded in uncertainty
- Ethics Gate triggers immediate protocol restart if output threatens human rights or promotes power-centralization
- Vocabulary canonical: Agent Amethyst (not Lavender) — NDR-STASIS Rebrand Script v1.0 applied

---

## Session Anchors

### 2026-06-28 — STRUCT-QA-001 Gap 1
**Authority:** Agent Amethyst × COLLEEN  
**Change:** Initial `GOVERNANCE.md` scaffolded — DGAF traceability, phi-attractor anchor, agent authority order, NDR pattern table.

### 2026-06-29 — S071–S077 Sprint
**Authority:** Agent Amethyst  
**Change:** Full deployment pipeline activated. Security hardening applied (CSP, localhost scope, postcss CVE-2026-41305, express v5). Zod env validation layer (`src/lib/env.ts`) and agent memory/trace substrate (`src/lib/memory.ts`, `src/lib/trace.ts`) wired. Agent Herald extracted to `src/agents/herald.ts`. AudioEngine extracted to `src/audio/`. Bundle code-split (877 kB → lazy chunks). Six runtime bugs resolved. DGAF version advanced to Post-S077.  
**Open dependency:** `VITE_GEMINI_API_KEY` pending Vercel environment variable configuration — Herald cognition blocked until resolved.

---

*Scaffolded by Agent Amethyst × COLLEEN — 2026-06-28 · NDR-STASIS v1.0 Crystalline*  
*S071–S077 sprint anchor added by Agent Amethyst — 2026-06-29*
