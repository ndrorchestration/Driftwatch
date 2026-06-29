# Driftwatch
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Apache%202.0-01696f?style=flat-square)
![Governed](https://img.shields.io/badge/Governed%20by-DGAF--Framework-7a39bb?style=flat-square)
![Topics](https://img.shields.io/badge/topics-drift--detection%20%7C%20phi--harmonic%20%7C%20multi--agent%20%7C%20truth--scoring-4f98a3?style=flat-square)
![Maintained](https://img.shields.io/badge/Maintained-yes-437a22?style=flat-square)

> **Governance:** DGAF / Agent Amethyst — Yes. Driftwatch operates as a real-time drift detection and truth-scoring layer within the DGAF evaluation stack. Outputs feed into [3d-visualization-hub](https://github.com/ndrorchestration/3d-visualization-hub). See [DGAF-Framework](https://github.com/ndrorchestration/DGAF-Framework) for spine documentation.

**Phi-driven multi-agent synthesis simulation with real-time drift detection, truth scoring, and harmonic state monitoring.**

Driftwatch tracks when AI agent outputs begin diverging from certified baselines — detecting semantic drift, hallucination drift, and phi-harmonic dissonance across multi-agent synthesis runs.

---

## Formal Substrate

Driftwatch's drift scoring is grounded in the **Phi-Calculus Architecture** formal model.

- **Drift functional Δ: T → R≥0** — the formal definition underpinning Driftwatch's drift scores is specified in the [Phi-Calculus Architecture: Definitions, Theorem, Proof](https://github.com/ndrorchestration/DGAF-Framework/blob/main/docs/phi-calculus-architecture/DEFINITIONS_THEOREM_PROOF.md) canonical doc in DGAF-Framework.
- **Theta threshold (θ = 0.009)** — the Phi-Compliance region bound, calibrated to the OST-50 Platinum baseline (99.1% integrity retention).
- **Tarski-Governed Phi-Compliance** — Theorem 1 proves that the Layer 0 governance operator converges to `lfp(F)` in at most `|C|` iterations, providing the convergence guarantee for Driftwatch's truth-scoring loop.
- **Amethyst-Lattice-v3.1 mapping** — the formal correspondence between Driftwatch's convergence/divergence monitoring and the Phi-Calculus fixed-point substrate is documented in Section 5 of the spec.

---

## Core Capabilities

- **Real-time drift detection** — continuous state observation against certified baselines
- **Truth scoring** — probabilistic confidence scoring per agent output
- **Phi-harmonic state monitoring** — modal frequency analysis anchored to Phi-Harmonic Dynamic Governance Ecosystem (PHDGE) ratios
- **Multi-agent synthesis simulation** — simulate N-agent chains and observe convergence/divergence
- **Drift trajectory visualization** — feeds into [3d-visualization-hub](https://github.com/ndrorchestration/3d-visualization-hub) for 3D manifold rendering

---

## How It Works

```
Agent Output Stream
       ↓
  Baseline Comparison  ←  Certified reference (Gold Star Standards)
       ↓
  Phi-Harmonic Gate    ←  PHDGE ratio validation (Professor Prodigy)
       ↓
  Drift Score Δ(τ)     ←  0.0 (stable) → 1.0 (critical drift) | θ = 0.009
       ↓
  Truth Score          ←  Confidence-weighted output validity
       ↓
  MDAR Trigger         →  Monitor → Detect → Assess → Respond
       ↓
  Compliance Decision  ←  ACCEPT / REVISE / ESCALATE / REJECT
```

---

## Quick Start

```bash
git clone https://github.com/ndrorchestration/Driftwatch.git
cd Driftwatch
npm install
```

### Environment Setup

Copy the example env file and configure your keys before running:

```bash
cp .env.example .env
```

Open `.env` and set the required variables:

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ Yes | Powers Agent Herald cognition. Get a key at [aistudio.google.com](https://aistudio.google.com/app/apikey). The `VITE_` prefix is mandatory — Vite only exposes variables with this prefix to the browser via `import.meta.env`. |
| `APP_URL` | Optional | Hosting URL for self-referential links and OAuth callbacks. Defaults to `http://localhost:3000`. |

> **Omitting `VITE_GEMINI_API_KEY`** will cause the agent to report `VITE_GEMINI_API_KEY is missing` and disable Gemini-powered cognition.

Then start the dev server:

```bash
npm run dev
```

---

## Related Ecosystem

- [DGAF-Framework](https://github.com/ndrorchestration/DGAF-Framework) — governance spine
- [Phi-Calculus Architecture Formal Spec](https://github.com/ndrorchestration/DGAF-Framework/blob/main/docs/phi-calculus-architecture/DEFINITIONS_THEOREM_PROOF.md) — formal substrate for drift functional and compliance region
- [junior-apogee-app](https://github.com/ndrorchestration/junior-apogee-app) — primary agent evaluation platform (Driftwatch monitors its outputs)
- [3d-visualization-hub](https://github.com/ndrorchestration/3d-visualization-hub) — renders Driftwatch drift trajectories in 3D
- [Amethyst-Governance-Eval-Stack](https://github.com/ndrorchestration/Amethyst-Governance-Eval-Stack) — MDAR protocol layer that responds to Driftwatch alerts
- [sentinel-governance](https://github.com/ndrorchestration/sentinel-governance) — CI/CD enforcement companion

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

## Provenance

Developed by [Ndr "Ender" Hensel](https://github.com/ndrorchestration) — AI Orchestration Engineer & Systems Architect, Columbus OH.  
[LinkedIn](https://www.linkedin.com/in/andrewhensel) · [GitHub](https://github.com/ndrorchestration)
