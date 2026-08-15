# Repository Audit — 2026-08-15

## Review state

**Classification:** Evaluation / monitoring research
**Evidence state:** SPECIFIED → IMPLEMENTATION PARTIAL → BENCHMARK PENDING

## Source-level findings

Driftwatch is materially more implemented than ACP. The repository contains a Vite/React application, source modules, environment handling, memory and trace infrastructure, package metadata, and project governance/security documentation.

However, `docs/DRIFT_SIGNAL_SPEC.md` explicitly defines the detector as implementation-pending and states that the repository does not yet establish a validated detector. The specification itself requires a frozen baseline, labeled perturbations, a transparent candidate statistic, controls, robustness cases, and reproducible precision/recall/F1/false-positive/detection-latency reporting.

The current `src/lib/memory.ts` demonstrates substantial agent-memory and tracing infrastructure, but this is supporting infrastructure rather than evidence that the specified drift detector has been implemented or benchmarked.

## Expert review

### Systems architecture
The separation between UI, memory, tracing, agent/audio areas, and the drift specification is promising. The detector should be isolated as a testable domain module rather than embedded primarily in presentation code.

### Evaluation science
The strongest next artifact is a deterministic benchmark harness that generates labeled nominal, gradual, abrupt, recovery, and near-threshold cases. Include at least one simple control detector.

### Statistics
Freeze feature normalization, baseline construction, threshold selection, persistence, random seeds, and evaluation splits. Report confidence intervals where sample size permits.

### Software engineering
Add a detector module with pure functions, unit tests for edge cases, and integration tests connecting generated observations to detections. Avoid coupling benchmark logic to the React UI.

### Reliability
Test missing observations, outliers, correlated changes, reversals, threshold boundaries, and repeated runs. Record detector latency and recovery latency.

### Security
The repository already contains `.env.example` and security documentation. Keep API credentials server-side and ensure benchmark fixtures cannot cause secret leakage through telemetry or generated reports.

### Epistemic audit
Do not promote thresholds such as `0.009`, project-local mathematical terminology, or historical benchmark claims to validated detector properties without a dated reproducible run.

### Portfolio
The strongest public story is currently: **an evidence-gated drift-monitoring research platform with an explicit detector specification and reproducible benchmark plan**. Do not market it as a validated detector until the benchmark exists.

## Recommended implementation sequence

1. Implement the candidate score from `DRIFT_SIGNAL_SPEC.md` as a pure module.
2. Implement frozen baseline and configuration objects.
3. Implement labeled perturbation generator with deterministic seeds.
4. Implement detector persistence rule.
5. Implement simple control detector.
6. Add unit tests for score, baseline, threshold, persistence, and edge cases.
7. Add benchmark runner producing machine-readable results.
8. Add benchmark report artifact with precision, recall, F1, FPR, detection latency, recovery latency, and perturbation-stratified results.
9. Add robustness/adversarial benchmark suite.
10. Promote evidence state only after reproducible execution.

## Promotion gate

`SPECIFIED → IMPLEMENTED → UNIT-TESTED → BENCHMARKED → CALIBRATED → REPLICATED`

The current repository should remain at **SPECIFIED / IMPLEMENTATION PARTIAL / BENCHMARK PENDING** until these gates are actually satisfied.
