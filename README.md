# Driftwatch

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Apache%202.0-01696f?style=flat-square)

> **Epistemic status:** Active experimental engineering. Driftwatch is a drift-detection/evaluation project. References to DGAF, phi-calculus, truth scoring, or governance describe project integrations or research vocabulary; they do not by themselves establish mathematical validity, certification, or production performance.

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

## Architecture relationship

Driftwatch can integrate with other ndrorchestration projects, including DGAF-Framework, 3d-visualization-hub, junior-apogee-app, Amethyst-Governance-Eval-Stack, and sentinel-governance. These are separate repositories with their own implementation and evidence boundaries.

## Acronyms

- **DGAF** — Dynamic Governance Agentic Formation.
- **MDAR** — use the canonical acronym registry for the current expansion; do not infer an expansion from this README.
- **PHDGE** — project-local terminology; expansion and evidentiary status are controlled by the canonical vocabulary documentation.

## Quick Start

```bash
git clone https://github.com/ndrorchestration/Driftwatch.git
cd Driftwatch
npm install
```

If the repository's current application requires environment variables, use the checked-in example environment file and follow the current application documentation. Never commit API keys or other secrets.

```bash
cp .env.example .env
npm run dev
```

## Status

**Active / experimental.**

Before presenting Driftwatch as a certified detector, production control, or validated mathematical system, verify the exact implementation, test results, benchmark provenance, calibration data, and current commit.

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

## Provenance

Developed by Ndr / Ender Hensel (`ndrorchestration`).
