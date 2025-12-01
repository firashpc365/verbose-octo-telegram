#!/usr/bin/env node
/*
 * Quick smoke test for AI proxy health & generate endpoints.
 * Usage: 
 *  AI_PROXY_URL=http://localhost:3456 node scripts/smoke-proxy.js
 */
const url = process.env.AI_PROXY_URL || 'http://localhost:3456';

const healthCheck = async () => {
  const res = await fetch(`${url}/api/health`);
  console.log('health', res.status, await res.text());
  return res.ok;
};

const generateCheck = async () => {
  const res = await fetch(`${url}/api/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gemini-2.5-flash', contents: 'smoke' })
  });
  console.log('generate', res.status, await res.text());
  return res.ok;
};

(async () => {
  try {
    const h = await healthCheck();
    const g = await generateCheck();
    if (h && g) {
      console.log('ok');
      process.exit(0);
    }
    console.error('failure');
    process.exit(2);
  } catch (e) {
    console.error('error', e.message);
    process.exit(1);
  }
})();
