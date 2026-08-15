# Release and Evidence Policy

## Current posture

Driftwatch is an experimental drift/evaluation system. Application infrastructure and supporting subsystems may be implemented while the core drift detector remains benchmark-pending.

## Versioning

Use `0.x.y` while detector semantics, benchmark protocol, and interfaces remain subject to change. A major version requires a stable detector contract and documented compatibility policy; it must not be triggered solely by conceptual changes.

## Evidence rule

A release may document implementation status, but a version number is not a validation claim.

Detector claims require dated benchmark artifacts with:

- frozen test inputs;
- baseline comparison;
- threshold provenance;
- precision/recall or other justified metrics;
- false-positive/false-negative analysis;
- reproducible execution instructions.

Until those artifacts exist, describe detector capability as experimental or benchmark-pending.
