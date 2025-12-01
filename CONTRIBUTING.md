# Contributing Guidelines

Thanks for contributing to Kanchana Events Hub — your change matters. This document contains minimal, focused workflow and requirements for contributing changes, especially for AI features.

Getting started
- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Lint: `npm run lint`
- Unit tests: `npm run test`

Before creating a PR
1. Make sure code follows the existing coding style and runs lint: `npm run lint`.
2. If you're updating AI behaviors, follow these steps:
   - Update types in `types.ts` if adding new interaction types or response fields.
   - If you change the shape of persisted data, add a migration function in `migrations.ts` and increment `DATA_VERSION`.
   - If adding a new AI endpoint, add or update wrapper helpers in `services/geminiService.ts`.
   - Add logging calls via `onLogAIInteraction` in components calling AI functions.
   - Add tests to cover both unit and integration behaviors (use generated mocks of `@google/genai`).
      - For offline CI, the repo ships a local fallback for `@google/genai` under `vendor/mock-genai`; CI may use that to keep tests deterministic if the package is not available.
3. Add or update docs if the change is user facing: `README.md`, `.github/copilot-instructions.md`, or `CONTRIBUTING.md`.

AI-specific PR checklist
- [ ] Update `types.ts` when adding new AI fields or `AIInteraction` features.
- [ ] Add migrations via `migrations.ts` when the default state or models change.
- [ ] Add `onLogAIInteraction` calls for new features so interactions are auditable.
- [ ] Add unit tests that mock `@google/genai` so coverage is deterministic.

Dev / Local Proxy
- To test against a server-like proxy locally, run:
   - `npm run dev:ai-proxy` to start a local dev proxy at http://localhost:3456
- For e2e CI tests, set `AI_PROXY_URL` in repository secrets and the CI job will run the deployment checks.

Feature Flags
- To force server-side proxy mode in development, add `VITE_AI_PROXY_ENABLED=true` to your `.env` file or toggle it in `Application Settings -> Developer -> Use AI Proxy` in the app UI.
- [ ] Validate `responseMimeType` usage and call `parseJSON()` on structured responses.

PR Description
- Provide a brief summary of what changed and the rationale.
- If related to AI, include expected prompt models and sample prompt+expected output (anonymized).

Thanks again — we appreciate your contributions! If you've changed anything in the AI flows, please ping the maintainers for a high-level design review.

For AI-specific guidance, see `.github/copilot-instructions.md` (includes a Change Example). If you're moving AI behavior server-side, update `docs/AI_BACKEND_DESIGN.md`.
