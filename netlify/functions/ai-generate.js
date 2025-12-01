const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const action = body.action || 'generateContent';
    if (action === 'generateImages') {
      const { model, prompt, config } = body;
      const response = await ai.models.generateImages({ model, prompt, config });
      return { statusCode: 200, body: JSON.stringify(response) };
    }
    const { model, contents, config } = body;
    const response = await ai.models.generateContent({ model, contents, config });
    return { statusCode: 200, body: JSON.stringify(response) };
  } catch (err) {
    console.error('AI Proxy Error', err);
    return { statusCode: err?.status || 500, body: JSON.stringify({ error: err?.message || 'Unknown' }) };
  }
};
