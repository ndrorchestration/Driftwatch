# Real Telemetry Corpus Contract

## Purpose

This contract defines the minimum structure required before Driftwatch can promote detector work beyond synthetic decision-layer plumbing.

It does **not** provide representative telemetry and does not close detector-efficacy issue #7 by itself.

## Required evidence classes

A corpus intended for detector calibration/evaluation must provide:

1. **Provenance** — source description, collection time, collector identity/process, and an immutable SHA-256 digest once frozen.
2. **Telemetry dimensions** — the exact multivariate features consumed by the detector.
3. **Detector-independent labels** — baseline/drift labels must be established without using Driftwatch's own score or decision threshold.
4. **Separate calibration and evaluation cases** — threshold selection must not use the held-out evaluation split.
5. **Both classes in both splits** — baseline and drift examples are required in calibration and held-out evaluation.
6. **Perturbation metadata** — drift cases should identify the perturbation family where known so errors can be stratified rather than averaged away.
7. **Frozen identity** — a corpus promoted to `representative-frozen` must include `sha256:<64 hex>` provenance identity.

## Manifest schema

Schema identifier:

`driftwatch.real-telemetry-corpus.v1`

A non-evidentiary structural example is checked in at:

`docs/fixtures/real-telemetry-corpus-manifest.example.json`

Its status is deliberately `schema-example-only`. It must never be cited as detector-effectiveness evidence.

## Validation

Run:

```bash
npm run validate:telemetry-corpus
```

For a real corpus manifest, run the validator directly with the manifest path:

```bash
npx tsx scripts/validate-telemetry-corpus.ts path/to/manifest.json
```

The validator rejects duplicate IDs, missing provenance, non-independent labels, missing calibration/evaluation splits, class-imbalanced empty splits, and a supposedly frozen representative corpus without a SHA-256 identity.

Passing manifest validation establishes **contract completeness only**. It does not establish dataset representativeness, label correctness, detector calibration quality, or efficacy.

## Promotion sequence

The intended evidence progression is:

`SCHEMA-VALID → CORPUS-FROZEN → CALIBRATION-EXECUTED → HELD-OUT-EVALUATION-EXECUTED → ERROR-ANALYZED → REPLICATED`

The current repository state remains before `CORPUS-FROZEN` until an actual representative corpus with independent labels is supplied and reviewed.

## Required benchmark outputs

When a real corpus exists, the evaluation lane should report at minimum:

- precision;
- recall;
- F1;
- false-positive rate;
- false-negative rate;
- detection latency;
- recovery latency where applicable;
- error analysis stratified by perturbation type;
- comparison against at least one simpler control;
- exact detector commit, corpus digest, threshold/calibration procedure, and execution identity.

No single aggregate score should be treated as sufficient evidence of production readiness.
