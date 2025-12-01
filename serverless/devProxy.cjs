#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
let GoogleGenAI;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  GoogleGenAI = require('../vendor/mock-genai').GoogleGenAI;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
console.log('[dev-proxy] Using AI backend:', ai.constructor && ai.constructor.name);
const app = express();
const PORT = process.env.PORT || 3456;

app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  console.log('[dev-proxy] GET /api/health');
  res.json({ status: 'ok' });
});

app.post('/api/ai/generate', async (req, res) => {
  console.log('[dev-proxy] POST /api/ai/generate', { action: req.body.action, model: req.body.model });
  try {
    const { action = 'generateContent' } = req.body;
    if (action === 'generateImages') {
      const { model, prompt, config } = req.body;
      const response = await ai.models.generateImages({ model, prompt, config });
      return res.json(response);
    }
    const { model, contents, config } = req.body;
    const response = await ai.models.generateContent({ model, contents, config });
    return res.json(response);
  } catch (err) {
    console.error('Dev Proxy Error:', err);
    return res.status(err?.status || 500).json({ error: err?.message || 'Unknown' });
  }
});

app.listen(PORT, () => console.log(`AI dev proxy listening at http://localhost:${PORT}`));
