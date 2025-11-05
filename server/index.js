// Minimal proxy server to call Google Gemini securely.
// Run with: npm run server:start

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ESM and load env specifically from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: '*', methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type'] }));

const PORT = process.env.PORT || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[server] Missing GEMINI_API_KEY in environment. Requests will fail.');
}

app.post('/ai/generate', async (req, res) => {
  try {
    const { model = 'gemini-2.5-flash', systemInstruction, messages } = req.body || {};

    // Build body for Gemini generateContent
    // We merge messages into a single user prompt keeping server-side safety.
    const userMessage = messages?.filter(m => m.role === 'user').pop()?.content || '';

    const payload = {
      contents: [{ role: 'user', parts: [{ text: userMessage }]}],
      systemInstruction: systemInstruction ? { role: 'user', parts: [{ text: systemInstruction }]} : undefined
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const r = await fetch(url + `?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: 'gemini_error', status: r.status, detail: errText });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ text });
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'proxy_failure' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});


