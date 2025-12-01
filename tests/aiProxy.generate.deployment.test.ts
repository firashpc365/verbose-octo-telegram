import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

describe('AI Proxy deployment generate endpoint', () => {
    it('returns valid JSON when POSTed to /api/ai/generate', async () => {
        const url = process.env.AI_PROXY_URL; // e.g., https://your-deployment.vercel.app
        if (!url) {
            console.warn('Skipping deployment generate test: AI_PROXY_URL not set');
            return;
        }

        const res = await fetch(`${url}/api/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gemini-2.5-flash', contents: 'Hello' }),
        });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toBeTruthy();
    });
});
