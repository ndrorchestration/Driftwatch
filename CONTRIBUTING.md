# Contributing

> **Governance:** DGAF / Agent Herald — All changes to this repository are subject to Sentinel CI/CD integrity enforcement. Contributions must pass governance checks before merge. See [DGAF-Framework](https://github.com/ndrorchestration/DGAF-Framework) for spine documentation.

## Scope
This repository contains the Driftwatch drift detection dashboard and Agent Herald host interface specification.

## Development
- Keep changes small and reviewable.
- Prefer explicit configuration over hidden defaults.
- Validate with `npm run build` and `npm run lint` before pushing.

## Secrets
- Never commit `.env` or live credentials.
- Use `.env.example` for shareable templates.

## Pull Requests
- Explain the operational impact of the change.
- Note whether the change affects drift detection logic, Herald persona, or dashboard behavior.
