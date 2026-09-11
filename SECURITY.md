# Security Policy

## Reporting a vulnerability

Do **not** open a public GitHub issue for suspected vulnerabilities, exposed credentials, or exploit details.

Prefer GitHub's private vulnerability-reporting path for this repository when it is enabled. If that private path is unavailable, contact the maintainer through a private channel linked from the GitHub profile and include only the minimum information needed to reproduce the issue. Never place secrets in a public issue, pull request, discussion, screenshot, or log excerpt.

No response-time SLA is promised by this document.

## Current credential boundary

Driftwatch currently includes a browser-side Gemini path for Agent Herald. The local-development variable is `VITE_GEMINI_API_KEY`.

Vite exposes `VITE_`-prefixed variables to browser code, so this value is **browser-visible by design** and must not be treated as a protected deployment secret. It is suitable only for a deliberately scoped development credential. Shared or production model credentials require a separately reviewed server/API boundary before they can be described as server-side or secret-protected execution.

The repository must not contain real provider credentials. `.env.example` contains variable names and guidance only.

## Evidence boundary

Repository tests and CI can establish that specific checks passed on a bound revision. They do not independently establish production security, absence of vulnerabilities, secure deployment configuration, provider-side controls, or security certification.

Security claims must remain scoped to the exact implementation and deployment evidence being evaluated.
