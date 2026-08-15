# Driftwatch — Repository Quality Baseline

**Audit date:** 2026-08-15  
**Scope:** engineering quality, evidence, reproducibility, CI, security/provenance  
**Epistemic status:** audit record; not a validation claim

## Current disposition

Driftwatch remains **Active / experimental**. Its current README correctly separates implementation from detector effectiveness and historical claims.

## Verified observations

- `README.md` explicitly bounds mathematical, certification, and production-performance claims.
- `GOVERNANCE.md` exists and identifies the DGAF governance relationship.
- `.github/workflows/ci.yml` performs TypeScript checking and a production build on pushes and pull requests to `main`.
- `package.json` exposes `build` and `lint` scripts; `lint` currently maps to `tsc --noEmit`.
- `package-lock.json` is present and its root package identity has been normalized to `driftwatch` / `0.1.0`, matching `package.json`.
- CI uses `npm ci`, so lockfile consistency is operationally relevant.
- Repository search did not identify a current Vitest/Jest-style automated test suite or test script; this remains an evidence gap, not a claim that no test-like code exists elsewhere.

## Gaps

### P0 — detector evidence
No current repository artifact was accepted as proof of detector effectiveness. The benchmark/calibration gate is tracked in Driftwatch issue #7.

Required before promotion:

1. frozen baseline/traces;
2. representative drift cases;
3. predeclared detector signal and threshold procedure;
4. exact implementation commit;
5. false-positive/false-negative analysis;
6. reproducible calibration artifact.

### P1 — test-depth evidence
Current CI demonstrates type-check/build integrity but does not establish detector behavior or effectiveness. A dedicated automated test/benchmark job should be added when the detector benchmark is implemented.

The absence of a discovered test framework means Driftwatch should not currently be represented as having a conventional automated unit-test gate.

### P1 — governance freshness
`GOVERNANCE.md` contains historical protocol references and a 2026-07-03 filing date. It should remain explicitly historical where appropriate and should not be interpreted as evidence that the listed protocols are currently implemented or validated.

### P2 — dependency/provenance hygiene
The package metadata/lockfile identity defect identified during this audit has been corrected in commits `be2354dd` and `ef3276c`. A full `npm ci` plus type-check/build run remains required before dependency reproducibility can be marked verified.

## Security boundary

No secret is required for the repository-level quality baseline. Environment-variable guidance in the README is appropriate. No claim of secret-scanning completeness is made from this audit.

## Promotion rule

A passing CI build is evidence of build/type integrity only. It is not evidence of detector accuracy, calibration, mathematical validity, or production readiness.

## Next action

Implement the benchmark/calibration artifact tracked by issue #7, then add it as a deterministic CI job. Separately, establish a small conventional automated test boundary for core deterministic logic before treating test-depth as complete. Re-run this baseline after that evidence exists.
