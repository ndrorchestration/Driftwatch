# Driftwatch Release and Evidence Policy

## Current software version

`0.1.0` — experimental software baseline.

The version identifies repository/software evolution. It is not a detector-accuracy score, calibration status, certification, or production-readiness claim.

## Evidence ladder

`SPECIFIED → IMPLEMENTED → UNIT-TESTED → BENCHMARKED → CALIBRATED → REPLICATED`

The repository may contain multiple capabilities at different evidence states. A project version does not promote all capabilities to the same evidence state.

## Detector claim gate

Driftwatch must not be described as a validated drift detector until a reproducible benchmark reports the metrics specified in `docs/DRIFT_SIGNAL_SPEC.md`, including nominal false-positive behavior, precision, recall, F1, detection latency, recovery latency, perturbation stratification, and dataset/configuration provenance.

A threshold is a parameter until calibration evidence establishes it. A historical benchmark is historical evidence until the experiment is reproducibly rerun under documented conditions.

## Integration rule

Integration with another ndrorchestration repository establishes only the tested interface behavior. It does not transfer that repository's evidence claims into Driftwatch or vice versa.

## Promotion

A future `0.2.x` may be appropriate after the detector implementation and initial benchmark are reproducibly established. A `1.0.0` candidate requires stable interfaces and evidence appropriate to every capability represented as stable.
