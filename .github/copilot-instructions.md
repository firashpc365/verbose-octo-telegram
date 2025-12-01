## Kanchana Events Hub — AI assistant instructions

Welcome! These instructions make it easier for AI coding agents (and reviewers) to be productive working in this repository.

### TL;DR (start here)
- Dev: `npm install && npm run dev`
- Build: `npm run build` (this runs `tsc` then `vite build`)
- Linting: `npm run lint` (eslint)
- The app injects `API_KEY` via `vite.config.ts` with `process.env.API_KEY`.

### Where to make AI-related changes
- Core AI logic and wrappers live in `services/geminiService.ts`. This file contains `safeGenerateContent`, `parseJSON`, `fileToBase64`, and all exported helpers used by UI components (ex: `createEventFromInput`, `generateImageForPrompt`). Start here for new AI endpoints or changes to existing behaviors.
- UI features that call the service are under `components/` and `components/features/`. `IntelligentCreator`, `ImageGenerator`, `ServiceEditor`, and `ProposalGenerator` are good example consumers.
- Global types, including `AIInteraction` enum and `DataSource` are defined in `types.ts`. Update types when adding new AI features.

### Important repository conventions & patterns
- Central service wrapper: Always call `safeGenerateContent` from `services/geminiService.ts`. It implements 429 handling and throws `QuotaExceededError` so the UI can fallback cleanly.
- `responseMimeType` is used to request structured output (e.g., JSON). Always call `parseJSON()` on results requested as JSON to handle noisy text and markdown artifacts.
- Logging: UI components use `onLogAIInteraction` to record AI usage. Follow the `AIInteraction` type keys and include `feature`, `promptSummary`, `fullPrompt`, `response`, `model`, and (optional) `parameters`.
- DataSource: When the AI populates data fields, set `*_source` fields to `'ai'`. Do not overwrite fields where `description_locked` is true unless user confirms.
- Deep extraction: Use `gemini-2.5-pro` for extraction tasks (e.g., `createEventFromInput`, `createServicesFromInput`) with `config.thinkingConfig` for heavy reasoning.
- Image generation: Use `ai.models.generateImages()` helpers in `geminiService.ts`. Returned bytes are base64; store as `data:image/jpeg;base64,<bytes>` in `imageUrl` or `generatedImage` fields.

### Error handling & fallback
- Quota handling: `safeGenerateContent` throws `QuotaExceededError` with retry details — if caught, set `onAIFallback(true)` (UI pattern) and surface a non-blocking banner (`QuotaErrorModal`). Prefer mock fallback when `settings.aiFallback.enableGeminiQuotaFallback` is enabled.
- General errors: throw or surface errors to calling components; many components call `setError(e)` that triggers an `ErrorBanner` UI component.

### Migration & persistent state notes
- App state is persisted via `hooks/usePersistentState.ts` which merges user data with `DEFAULT_APP_STATE` using a three-way merge. When changing the saved state shape, increment `DATA_VERSION` in `migrations.ts` and add an entry to `migrations`.

### Models & configs
- Typical models used:
  - `gemini-2.5-flash` for short generation tasks (descriptions, features, quick suggestions)
  - `gemini-2.5-pro` for extraction & complex reasoning (document parsing)
  - `imagen-4.0-generate-001` for images
- When requesting JSON responses, set `config.responseMimeType = 'application/json'` and always be defensive with `parseJSON()`.

### Example snippets (follow these patterns)
- Safe call + logging:
```ts
try {
  const { result, fullPrompt } = await getAIServiceAssistance('description', service, settings, categories);
  onLogAIInteraction({ feature: 'service_description', promptSummary: `Generate description`, fullPrompt, response: JSON.stringify(result) });
  // store the result and mark source:
  handleFieldChange('description', result, 'ai');
} catch (e) {
  if (e instanceof QuotaExceededError) onAIFallback(true);
  else setError(e);
}
```

- JSON / Extraction example (use `gemini-2.5-pro` + `thinkingConfig`):
```ts
const { eventData } = await createEventFromInput({ text, files }, services, true);
// eventData is JSON but still pass through parseJSON and validate fields.
```

### Test mocks example (Vitest)
When writing unit tests for AI integration, mock `@google/genai` and return deterministic responses.
```ts
vi.mock('@google/genai', () => {
  const genMock = { generateContent: vi.fn(), generateImages: vi.fn() };
  return { GoogleGenAI: class { models = genMock }, __genaiMock: genMock };
});

// Then in tests, set up:
__genaiMock.generateContent.mockResolvedValue({ text: JSON.stringify({ name: 'Test Event' }) });
```

### Where to look for changes & tests
- Running app uses `src/App.tsx` and `components` (root) — check `vite.config.ts` if you change how env is provided.
- `types.ts` contains important domain types — update them and migrations when adding fields.
- Lint: `npm run lint`. There are no formal unit tests in the repo currently — PRs should include tests where possible; otherwise include manual reproduction steps.
 - Tests: `npm run test` (vitest) — unit tests live under `tests/` and mock `@google/genai` for deterministic behavior.

### How to add a new AI feature (Change Example)
1. Add the helper in `services/geminiService.ts`:
  - Create a function that constructs the prompt, chooses model (`gemini-2.5-flash` vs `gemini-2.5-pro`) and `responseMimeType`, then calls `safeGenerateContent()`.
  - Return parsed or raw results with `{ result, fullPrompt, source }`.
2. Add types in `types.ts` if needed (e.g., `AIInteraction` feature strings or response types).
3. Add a UI hook in components (e.g., `ServiceEditor`, `EventDetail`, or `IntelligentCreator`) that calls the new helper, wraps results in `onLogAIInteraction`, and updates state using `handleFieldChange(field, value, 'ai')`.
4. Add tests under `tests/` which mock `@google/genai` to return expected strings/JSON and verify parsing logic (see `tests/geminiService.eventExtraction.test.ts`).
5. If the change needs persisted shape updates, update `migrations.ts` and bump `DATA_VERSION`.
6. Ensure QA: run the dev server, lint, and tests: `npm run dev && npm run lint && npm run test`.

### Security & deployment notes
- The key is injected client-side using `process.env.API_KEY` — for production use move `services/geminiService.ts` API calls to a serverless or backend endpoint to keep your key secret.
- The key is injected client-side using `process.env.API_KEY` — for production use move `services/geminiService.ts` API calls to a serverless or backend endpoint to keep your key secret.
 - Feature flag (dev/testing): set `VITE_AI_PROXY_ENABLED=true` in your `.env` to route AI calls to the `/api/ai/generate` proxy on the server.
 - Runtime toggle: The app includes a runtime AI proxy toggle in `Application Settings -> Developer -> Use AI Proxy` (maps to `settings.aiProxyEnabled`). This updates a runtime override via `setAiProxyEnabled` inside `services/geminiService.ts` so you can switch without redeploying.
- For Vercel/Netlify check the `README.md` instructions. The `vercel.json` and `netlify.toml` files are included to help with SPAs.
 - Server-side design: See `docs/AI_BACKEND_DESIGN.md` for a minimal serverless proxy pattern that keeps API keys out of the browser and shows a sample Vercel/Netlify function.
 - Dev proxy: For local testing, run `npm run dev:ai-proxy` to start a local Express server that provides `/api/ai/generate` and `/api/ai/health` endpoints. This mirrors the serverless proxy so you can test client behavior for both content and image generation.
 - E2E CI test: Add `AI_PROXY_URL` to repository secrets to run e2e tests in CI that hit the deployed `/api/ai/health` and `/api/ai/generate` endpoints.

### Quick reference: key files & directories
- `services/geminiService.ts` — core AI wrappers & helpers
- `components/*` and `components/features/*` — UI features and consumers
- `hooks/usePersistentState.ts` — local state persistence + migrations
- `migrations.ts` — data migration rules, `DATA_VERSION`
- `types.ts` — domain & AI types (notably `AIInteraction` & `DataSource`)

If anything is unclear or you want me to expand on one of these sections (prompts, feature list, or a small PR with patterns enforced), say which and I’ll iterate. ✅
