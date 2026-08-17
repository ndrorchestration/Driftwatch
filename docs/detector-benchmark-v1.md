# Driftwatch Detector Benchmark v1

## Status

**Protocol defined; benchmark results pending detector binding and execution.**

This document establishes the reproducibility contract for Driftwatch issue #7. It does not claim detector effectiveness and does not contain benchmark results.

## Evidence boundary

A unit test or UI demonstration is not detector-effectiveness evidence. A benchmark result is valid only when the exact implementation commit, frozen fixture, detector configuration, and machine-readable output are retained together.

## Frozen fixture

The canonical fixture is `docs/fixtures/detector-benchmark-v1.json`.

The fixture contains labeled `baseline` and `drift` cases. Labels are fixed before execution and must not be changed to improve results.

## Required run metadata

Every benchmark execution must record:

- implementation commit SHA;
- fixture filename and SHA-256;
- detector name/version;
- detector signal definition;
- threshold(s) and whether they were configured before execution;
- execution timestamp;
- runtime/version information;
- per-case prediction;
- false positives and false negatives;
- aggregate counts and rates;
- failure/error analysis.

## Decision rule

The benchmark must report raw counts before rates. Rates are:

- false-positive rate = false positives / negative cases;
- false-negative rate = false negatives / positive cases.

No acceptance threshold is defined by this protocol until the detector's signal semantics and intended operating point are documented. This prevents calibration from being selected after observing the benchmark outcomes.

## Calibration rule

If a numeric threshold is required, calibration must use a separately identified calibration split. The benchmark fixture must remain untouched during threshold selection.

If no separate calibration dataset exists, the run must explicitly report **threshold uncalibrated** rather than silently fitting the threshold to the benchmark.

## Required artifact

A completed run should produce `benchmark-result.json` with this minimum structure:

```json
{
  "protocol": "detector-benchmark-v1",
  "implementation_commit": "<sha>",
  "fixture_sha256": "<sha256>",
  "detector": {"name": "<name>", "version": "<version>"},
  "configuration": {"signal": "<definition>", "threshold": null},
  "cases": [],
  "summary": {
    "negative_cases": 0,
    "positive_cases": 0,
    "false_positives": 0,
    "false_negatives": 0,
    "false_positive_rate": null,
    "false_negative_rate": null
  },
  "calibration": {"status": "uncalibrated", "dataset": null},
  "limitations": []
}
```

## Closure gate

Issue #7 remains open until the repository contains an executed result generated from this fixture (or a documented replacement fixture with provenance), plus detector binding, threshold provenance, and error analysis.
