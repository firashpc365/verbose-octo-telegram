#!/usr/bin/env node
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenAI } = (() => {
  try { return require('@google/genai'); } catch (e) { return require('../vendor/mock-genai'); }
})();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const app = express();
const PORT = process.env.PORT || 3456;

app.use(bodyParser.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/ai/generate', async (req, res) => {
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
