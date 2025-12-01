# Server-side AI Proxy Design

This project currently calls Google GenAI from the client, which exposes API keys in builds. To protect keys and gain better control over prompts, we recommend a small serverless proxy that handles AI interactions.

Goals
- Keep API keys server-side.
- Centralize prompt templates and rate-limit or queue requests.
- Allow logging and tracing of AI interactions (e.g., for billing or audits).

Design outline
1. Create a serverless endpoint at `/api/ai/generate` (Vercel/Netlify/Azure Function) that accepts a JSON payload describing the target model and prompt content. Optionally, pass `action` in the JSON body to indicate an image request: `{ action: 'generateImages', model, prompt, config }`.
2. Validate requests on the server (allowlist origins, implement API key per-deployment). Optionally validate prompt size, user identity, and throttle rates.
3. Use `@google/genai` server-side with API_KEY from environment variables. For image generation, call `ai.models.generateImages()`; for content generation call `ai.models.generateContent()`.
4. Return the AI response through the serverless function to the client; client uses the same `services/geminiService.ts` wrappers but calls `fetch('/api/ai/generate', {method: 'POST', body: JSON.stringify({ model, contents }) })` instead of `ai.models.generateContent`.

Sample Vercel handler (TypeScript)
```ts
// serverless/aiProxy.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { model, contents, config } = req.body;
  try {
    const response = await ai.models.generateContent({ model, contents, config });
    return res.json(response);
  } catch (err: any) {
    console.error('AI proxy error', err);
    return res.status(err?.status || 500).json({ error: err?.message || 'Unknown' });
  }
}
```

How to migrate client calls
1. Add a `fetch` wrapper in `services/geminiService.ts` that calls the serverless endpoint. Use `{ action: 'generateImages' }` in the payload for image generation.
2. Provide a feature flag or environment-based switch during rollout (keep both client/in-browser and server-side modes). Update `vite.config.ts` to include a feature flag `VITE_AI_PROXY_ENABLED`.

Security
- Use environment variables in serverless deployment to store API keys.
- Optionally add auth on serverless endpoint (e.g., validate session tokens) to ensure only authenticated users can call it.

Notes
- This change also removes the need to set `process.env.API_KEY` in Vite client builds (which currently exposes it). Migrate carefully and test both paths.
