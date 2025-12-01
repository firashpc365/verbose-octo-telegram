import { describe, it, expect } from 'vitest';
import fetch from 'node-fetch';

describe('AI Proxy deployment health check', () => {
    it('returns 200 OK when AI_PROXY_URL is set', async () => {
        const url = process.env.AI_PROXY_URL; // e.g., https://your-deployment.vercel.app
        if (!url) {
            console.warn('Skipping deployment health check: AI_PROXY_URL not set');
            return;
        }
        const res = await fetch(`${url}/api/ai/health`);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('ok');
    });
});
