# Driftwatch

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Apache%202.0-01696f?style=flat-square)

> **Epistemic status:** Active experimental engineering. Driftwatch is a drift-detection/evaluation project. References to DGAF, phi-calculus, truth scoring, or governance describe project integrations or research vocabulary; they do not by themselves establish mathematical validity, certification, detector effectiveness, or production performance.

## Purpose

Driftwatch explores detection and monitoring of changes in AI-agent outputs and workflow state. The repository may provide scoring, visualization, and integration components; the actual implementation and current tests are authoritative for capability claims.

## Core areas

- Semantic/output drift detection where implemented
- Agent-state and workflow monitoring
- Evaluation and scoring experiments
- Drift trajectory visualization/integration
- Integration hooks for broader agent-evaluation workflows

## Epistemic boundary

Historical README language described several project-local constructs as formal theorems, certified baselines, or calibrated guarantees. Those descriptions are not promoted here to current facts without reproducible evidence.

In particular:

- A drift functional is a defined or implemented quantity only to the extent demonstrated by the relevant source and tests.
- Numeric thresholds such as `θ = 0.009` are parameters unless a reproducible calibration procedure and dataset establish them.
- Terms such as **Tarski-Governed Phi-Compliance**, **PHDGE**, **Amethyst-Lattice**, and **Gold Star Standards** are project vocabulary unless their claimed external/mathematical equivalence is independently established.
- A historical benchmark or certification statement does not constitute current validation without a reproducible run.
- Cross-repository integration does not mean that one repository validates another.

## Runtime and credential boundary

The current application includes a browser-side Gemini SDK path for Agent Herald. It is **not** presented as a verified server-side model-execution boundary.

A `VITE_`-prefixed API key, if deliberately supplied for local development, is browser-visible by design and must not be treated as a protected deployment secret. Shared or production credentials should not be exposed through the client bundle. A future hosted-model integration should place credentials behind a separately reviewed server/API boundary before it is described as server-side execution.

Build/type-check success establishes source and build integrity for the executed checks. It does not establish detector efficacy, calibrated truth scoring, benchmark performance, or production security.

## Architecture relationship

Driftwatch can integrate with other ndrorchestration projects, including DGAF-Framework and Orbit-Driftwatch. These are separate repositories with their own implementation and evidence boundaries. Cross-repository lineage or integration does not transfer validation.

## Quick Start

```bash
git clone https://github.com/ndrorchestration/Driftwatch.git
cd Driftwatch
npm ci
```

If the repository's current application requires environment variables, use the checked-in example environment file and follow the current application documentation. Never commit API keys or other secrets.

```bash
cp .env.example .env
npm run dev
```

## Status

**Active / experimental.**

Current CI verifies clean dependency installation, TypeScript checking, and application build on the configured Node.js matrix. Before presenting Driftwatch as a certified detector, production control, validated mathematical system, or empirically effective detector, verify the exact implementation, test results, benchmark provenance, calibration data, dependency-security state, and current commit.

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

## Provenance

Developed by Ndr / Ender Hensel (`ndrorchestration`).
