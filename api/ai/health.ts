import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        console.log('[ai-proxy] GET /api/ai/health');
        return res.status(200).json({ status: 'ok' });
    }
    return res.status(405).send('Method Not Allowed');
}
