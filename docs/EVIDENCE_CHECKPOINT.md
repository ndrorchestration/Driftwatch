# Driftwatch Evidence Checkpoint

**Date:** 2026-08-15
**Repository:** `ndrorchestration/Driftwatch`
**Checkpoint commit:** `dd130b64ca818a2cbb49c2a724cf81e3951b1e9f`

## Capability classification

### Implemented

- React/Three.js visualization surface.
- Agent Herald interaction surface.
- In-memory working, episodic, and semantic memory layers.
- Trace/observability integration.
- Audio engine integration where invoked by the application.
- TypeScript compilation and Vite production build checks.

### Not established by the current source

- A general-purpose semantic drift detector with validated accuracy.
- A calibrated drift threshold such as `theta = 0.009`.
- Production-grade drift classification.
- Mathematical certification of project-local phi/governance constructs.
- Any historical benchmark or certification claim unless reproduced from a current, traceable dataset and procedure.

## Source-level observation

The primary application currently models consensus, spread, truth, information, latency, worker state, dissonance, visualization, and agent interaction. These variables drive the simulation and presentation. The inspected source does not establish a separately validated drift-detection algorithm or benchmarked detector.

The memory layer records `drift_detected` as a supported episodic event type, but an event type is not itself evidence that a detector exists or is accurate.

## CI boundary

The previous CI workflow had an ESLint job marked `continue-on-error: true`, while ESLint was not declared in the package dependencies. That was not an authoritative lint gate. The workflow has been corrected to make the repository's actual TypeScript check (`npm run lint`) and production build authoritative.

CI success will establish source/build integrity only. It will not establish drift-detection effectiveness.

## Current evidence state

**IMPLEMENTED SIMULATION/UI → CI TYPECHECK/BUILD → DETECTION VALIDATION PENDING**

## Required experiment before stronger detector claims

1. Define the drift signal mathematically or operationally.
2. Define positive/negative ground truth.
3. Specify a reproducible dataset or synthetic generator.
4. Establish baseline and comparison methods.
5. Measure precision, recall, false-positive rate, false-negative rate, latency, and calibration.
6. Report thresholds only with the calibration procedure and dataset that produced them.
7. Preserve reproducible artifacts with the benchmark result.
