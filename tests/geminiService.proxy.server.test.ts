import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'node:http';

vi.stubEnv('VITE_AI_PROXY_ENABLED', 'true');

describe('generateContent proxy server', () => {
    let server: http.Server;
    let baseUrl = '';

    beforeEach((done) => {
        server = http.createServer((req, res) => {
            if (req.method === 'POST' && req.url === '/api/ai/generate') {
                let body = '';
                req.on('data', (chunk) => (body += chunk));
                req.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ text: 'proxied response' }));
                });
            } else {
                res.writeHead(404);
                res.end();
            }
        });
        server.listen(0, () => {
            const addr: any = server.address();
            baseUrl = `http://127.0.0.1:${addr.port}`;
            // patch global fetch to route '/api/ai/generate' to our local server
            const orig = globalThis.fetch;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).fetch = (url: any, init?: any) => {
                if (typeof url === 'string' && url.startsWith('/api/ai/generate')) {
                    return (globalThis as any).origFetch(`${baseUrl}${url}`, init);
                }
                return (globalThis as any).origFetch(url, init);
            };
            (globalThis as any).origFetch = orig || fetch;
            done();
        });
    });

    afterEach((done) => {
        server.close(() => {
            // restore fetch
            (globalThis as any).fetch = (globalThis as any).origFetch;
            delete (globalThis as any).origFetch;
            done();
        });
    });

    it('shows proxied response when proxy enabled', async () => {
        const { generateContent } = await import('../services/geminiService');
        const res: any = await generateContent({ model: 'gemini-2.5-flash', contents: 'Hello' });
        expect(res.text).toBe('proxied response');
    });
});
