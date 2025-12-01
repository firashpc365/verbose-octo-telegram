import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  try {
    // Support both text/structured `generateContent` and `generateImages`.
    const { action = 'generateContent' } = req.body;
    if (action === 'generateImages') {
      const { model, prompt, config } = req.body;
      const response = await ai.models.generateImages({ model, prompt, config });
      return res.status(200).json(response);
    }
    const { model, contents, config } = req.body;
    const response = await ai.models.generateContent({ model, contents, config });
    return res.status(200).json(response);
  } catch (err: any) {
    console.error('AI Proxy Error:', err);
    return res.status(err?.status || 500).json({ error: err?.message || 'Unknown' });
  }
}
