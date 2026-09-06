# Driftwatch Detector Benchmark v1

## Status

**Candidate detector implemented and unit-tested; synthetic decision-layer benchmark plumbing executed. Real telemetry benchmark and calibration remain open.**

This document records the reproducibility contract and the 2026-09-06 synthetic execution for Driftwatch issue #7. The execution is deliberately not promoted to detector-effectiveness evidence.

## Evidence boundary

A unit test or UI demonstration is not detector-effectiveness evidence. The retained execution used a fixture that is explicitly marked `synthetic-fixture-only` and provides already-computed scalar signals that are intentionally separable around a predeclared threshold. Therefore the result validates benchmark plumbing and decision semantics only.

The multivariate normalized-change statistic implemented in `src/detector/changeDetector.ts` still requires a separately frozen telemetry corpus to evaluate real detector behavior.

## Implemented candidate detector

The candidate baseline follows `docs/DRIFT_SIGNAL_SPEC.md`:

`z_t = (x_t - μ) / max(|σ|, ε)`

`D_t = ||z_t||_2 / sqrt(d)`

The decision layer declares drift only when the score is strictly greater than the configured threshold for the configured number of consecutive observations. Equality with the threshold is not an exceedance.

Detector identity for the executed lane:

- name: `transparent-normalized-change`
- version: `0.1.0`

## Frozen fixture

Canonical fixture: `docs/fixtures/detector-benchmark-v1.json`

SHA-256:

`78d006f891df282eb90c76df1285868994561e6c28bc096ea5e39f21d2d2f543`

The fixture contains 5 labeled baseline cases and 5 labeled drift cases. It remains explicitly synthetic and is not a telemetry dataset.

## Executed synthetic run

- GitHub Actions run: `34026139237`
- executed implementation commit: `8a67defaa69a452ea11448255ac44d3511640686`
- CI artifact ID: `9987108457`
- CI artifact digest: `sha256:ad9f51d762dea886d64fabdf932da6dc84e4e7dbe442354e991be390e86d6520`
- retained result: `artifacts/detector-benchmark-v1-run-34026139237.json`
- retained result file SHA-256: `ce405bb3fe91627b1951693221a119569d84f89d447d50fde5f9267a9b590b23`
- configuration: threshold `0.5`, persistence `1`
- threshold status: **UNCALIBRATED**

Exact-head CI passed on Node 20.x and Node 22.x. Both lanes passed clean install, high/critical dependency audit, TypeScript checking, detector unit tests, and production build. The Node 22 lane additionally generated and uploaded the benchmark artifact.

## Synthetic result

| Measure | Result |
|---|---:|
| Negative cases | 5 |
| Positive cases | 5 |
| False positives | 0 |
| False negatives | 0 |
| False-positive rate | 0 |
| False-negative rate | 0 |

These zero-error values are **not evidence of real detector accuracy**. The fixture was constructed with baseline scalar signals from `0.10` to `0.45` and drift scalar signals from `0.60` to `0.95`, while the predeclared synthetic boundary is `0.5`. It is therefore a plumbing/semantics control rather than a challenging effectiveness benchmark.

## Calibration rule

Calibration requires a separately identified calibration dataset or split. The retained synthetic run reports `uncalibrated`; the threshold must not be described as a Driftwatch production default.

## Evidence progression

Current supportable state:

`SPECIFIED → IMPLEMENTED → UNIT-TESTED → SYNTHETIC-PLUMBING-EXECUTED`

Not yet supportable:

`REAL-TELEMETRY-BENCHMARKED → CALIBRATED → REPLICATED`

## Remaining closure gate

Issue #7 should remain open for detector-effectiveness evidence until all of the following exist:

1. a frozen representative telemetry corpus with provenance;
2. ground-truth perturbation labels produced independently of the detector;
3. a separate calibration procedure/split if a numeric operating threshold is selected;
4. execution of the multivariate score over that corpus;
5. precision, recall, F1, false-positive behavior, detection latency, recovery latency, and perturbation-stratified error analysis;
6. comparison against at least one simpler control under the same corpus and operating conditions;
7. replication or independent rerun evidence before stronger reliability claims.

The 2026-09-06 synthetic execution closes the benchmark **plumbing** gate, not the detector **efficacy** gate.
