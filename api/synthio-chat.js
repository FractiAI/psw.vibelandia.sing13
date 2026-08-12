/**
 * Synthio chat — Lattice allowlisted BYOK proxy (Claude / Gemini / OpenRouter).
 * Captures Lattice edge session; guests do not need a second allowlist.
 */
export const config = { maxDuration: 120 };

const MISSING_KEY = 'Provide your provider API key (BYOK — your key is your password).';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body ?? {}));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function header(req, names) {
  const h = req.headers || {};
  for (const n of names) {
    const v = h[n] || h[n.toLowerCase()];
    if (v) return String(Array.isArray(v) ? v[0] : v).trim();
  }
  return '';
}

function resolveProvider(req, body) {
  const p = String(body?.provider || header(req, ['x-synthio-provider']) || 'claude')
    .trim()
    .toLowerCase();
  if (p === 'claude' || p === 'anthropic') return 'claude';
  if (p === 'gemini' || p === 'antigravity') return 'gemini';
  if (p === 'openrouter') return 'openrouter';
  if (p === 'cursor') return 'cursor';
  return 'claude';
}

function resolveApiKey(req, provider) {
  if (provider === 'claude') {
    return header(req, ['x-anthropic-api-key', 'X-Anthropic-Api-Key']);
  }
  if (provider === 'gemini') {
    return header(req, ['x-gemini-api-key', 'X-Gemini-Api-Key']);
  }
  if (provider === 'cursor') {
    return header(req, ['x-cursor-api-key', 'X-Cursor-Api-Key']);
  }
  return header(req, ['x-openrouter-api-key', 'X-OpenRouter-Api-Key']);
}

async function callClaude(apiKey, messages, model) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const chat = messages.filter((m) => m.role !== 'system');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-5',
      max_tokens: 4096,
      system,
      messages: chat.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Claude HTTP ${res.status}`);
    err.status = res.status === 401 || res.status === 403 ? 401 : 502;
    throw err;
  }
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
  return { text, provider: 'claude', model: data.model || model };
}

async function callGemini(apiKey, messages, model) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const chat = messages.filter((m) => m.role !== 'system');
  const contents = chat.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const modelId = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
    err.status = res.status === 401 || res.status === 403 ? 401 : 502;
    throw err;
  }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('\n').trim();
  return { text, provider: 'gemini', model: modelId };
}

async function callOpenRouter(apiKey, messages, model) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://www.ssvibelandiaquestfest24x365.com/synthio',
      'X-Title': 'Synthio · Syntheverse Sandbox',
    },
    body: JSON.stringify({
      model: model || 'deepseek/deepseek-chat',
      messages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `OpenRouter HTTP ${res.status}`);
    err.status = res.status === 401 || res.status === 403 ? 401 : 502;
    throw err;
  }
  const text = data.choices?.[0]?.message?.content || '';
  return { text, provider: 'openrouter', model: data.model || model };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, x-anthropic-api-key, x-openrouter-api-key, x-gemini-api-key, x-cursor-api-key, x-synthio-provider',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const { checkSynthioAccess } = await import('../lib/synthio-access.mjs');
  const { buildSynthioMessages, SYNTHIO_SYSTEM_PROMPT } = await import('../lib/synthio-prompt.mjs');

  if (req.method === 'GET') {
    const email = header(req, ['x-lattice-email', 'X-Lattice-Email']) || String(req.query?.email || '');
    const access = checkSynthioAccess(email);
    return json(res, access.ok ? 200 : 403, {
      ...access,
      agent: 'Synthio',
      shortFor: 'Syntheverse Sandbox',
      engineStack: 'excluded',
      acceptsProviders: ['claude', 'gemini', 'openrouter'],
      latticeSessionReusable: true,
      systemPromptPreview: SYNTHIO_SYSTEM_PROMPT.slice(0, 240) + '…',
    });
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  const email = header(req, ['x-lattice-email', 'X-Lattice-Email']) || body.email || '';
  const access = checkSynthioAccess(email);
  if (!access.ok) {
    return json(res, 403, {
      error: access.reason,
      privilege: access.privilege,
      agent: 'Synthio',
    });
  }

  let provider = resolveProvider(req, body);
  if (provider === 'cursor') {
    return json(res, 400, {
      error:
        'Synthio chat uses Claude, Gemini, or OpenRouter. Your Cursor key stays on-device for Lattice Chat — pick Claude/Gemini if you already unlocked those in Lattice.',
      code: 'synthio_provider_use_lattice_key',
      privilege: access.privilege,
    });
  }

  const apiKey = resolveApiKey(req, provider);
  if (!apiKey) {
    return json(res, 401, { error: MISSING_KEY, code: 'missing_provider_api_key', provider });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return json(res, 400, { error: 'message is required' });
  }

  const messages = buildSynthioMessages(message, { history: body.history });
  const model = typeof body.model === 'string' ? body.model.trim() : '';

  try {
    let out;
    if (provider === 'claude') out = await callClaude(apiKey, messages, model);
    else if (provider === 'gemini') out = await callGemini(apiKey, messages, model);
    else out = await callOpenRouter(apiKey, messages, model);
    return json(res, 200, {
      ok: true,
      agent: 'Synthio',
      shortFor: 'Syntheverse Sandbox',
      privilege: access.privilege,
      provider: out.provider,
      model: out.model,
      reply: out.text,
    });
  } catch (err) {
    return json(res, err.status || 502, {
      error: err.message || 'Synthio provider error',
      provider,
    });
  }
}
