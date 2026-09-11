# Contributing to Driftwatch

## Authority and evidence boundary

Driftwatch is an **independent experimental drift-detection/evaluation repository**. Current authority comes from repository-local source, tests, CI/benchmark artifacts, dated runtime evidence where available, and explicit maintainer decisions.

Historical references to DGAF, PDMAL, Agent Amethyst, COLLEEN, phi-calculus, or harmonic-state terminology describe project lineage, integration context, or research vocabulary. They do not confer autonomous governance, certification, detector effectiveness, mathematical validity, or cross-repository validation.

`DGAF` means **Dynamic Governance Agentic Formation** in this ecosystem. `DGAF-Framework` is a related but separate research track and does not automatically govern or validate Driftwatch by reference.

## What Driftwatch is

Driftwatch explores, where implemented and tested:

- semantic/output drift detection;
- agent-state and workflow monitoring;
- evaluation/scoring experiments;
- telemetry-corpus contract validation;
- synthetic detector benchmarking;
- drift-trajectory visualization and integration hooks.

Project terms such as harmonic state, phi-calculus, or historical threshold values are not general guarantees. A benchmark pass establishes only the tested benchmark conditions.

## Contribution rules

1. Open an issue with a clear problem statement or evidence gap.
2. Create a branch from current `main`.
3. Add or update unit tests for detector behavior changes.
4. Preserve the distinction between synthetic benchmark evidence and real-world detector efficacy.
5. Treat numeric thresholds as parameters unless the contribution includes reproducible calibration evidence.
6. Do not expose shared/production credentials through browser-visible `VITE_` variables.
7. For external-framework or cross-repository references, state whether they are mappings, dependencies, provenance, or actual verified integrations.
8. A DGAF/NDR pattern link is optional context, not an approval requirement or transferred governance predicate.

## External/reference boundaries

- **DGAF — Dynamic Governance Agentic Formation:** separate governance/evaluation research track.
- **NIST AI RMF:** external risk-management framework; references/mappings do not establish NIST endorsement or compliance.
- **OpenTelemetry:** observability technology where actually configured; a version/reference does not prove live telemetry.
- **Phi/harmonic constructs:** project-local research vocabulary unless a narrower mathematical or empirical claim is independently established.

## IP notice

Project-specific constants, tuning tables, or optimization details may be intentionally omitted from public artifacts. Missing proprietary detail must not be replaced by unsupported capability claims.

## Related repositories

- [DGAF-Framework](https://github.com/ndrorchestration/DGAF-Framework) — separate governance/evaluation research track
- [ai-governance-frameworks](https://github.com/ndrorchestration/ai-governance-frameworks) — separate governance-mapping research
- [sentinel-governance](https://github.com/ndrorchestration/sentinel-governance) — separate historical/guardrail track
- [Orbit-Driftwatch](https://github.com/ndrorchestration/Orbit-Driftwatch) — separate portfolio/showcase evidence chain

Cross-repository references do not transfer validation.
