/**
 * Synthio chat — Lattice allowlisted BYOK proxy (Cursor / Claude / Gemini / OpenRouter).
 * Reuses Lattice edge session + on-device keys; Cursor key alone is enough.
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

function extractAssistantText(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (typeof result.result === 'string') return result.result;
  if (typeof result.text === 'string') return result.text;
  if (Array.isArray(result.content)) {
    return result.content
      .filter((b) => b && (b.type === 'text' || typeof b.text === 'string'))
      .map((b) => b.text || '')
      .join('\n')
      .trim();
  }
  return '';
}

function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error(`${label || 'operation'} timed out after ${ms}ms`);
        err.code = 'timeout';
        err.status = 504;
        reject(err);
      }, ms);
    }),
  ]).finally(() => clearTimeout(timer));
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

/**
 * Cursor BYOK via @cursor/sdk cloud agent (same key as Lattice Chat).
 * Keep Synthio turns short: cloud agent + single send/wait.
 */
async function callCursor(apiKey, messages, model) {
  let Agent;
  try {
    ({ Agent } = await import('@cursor/sdk'));
  } catch (sdkErr) {
    const err = new Error(
      'Cursor SDK failed to load. Confirm Node 22+ and @cursor/sdk, then redeploy.',
    );
    err.status = 503;
    err.detail = sdkErr instanceof Error ? sdkErr.message : String(sdkErr);
    throw err;
  }

  const modelId =
    String(model || process.env.SYNTHIO_CURSOR_MODEL || process.env.LATTICE_MODEL_ID || 'composer-2.5')
      .trim() || 'composer-2.5';
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const chat = messages.filter((m) => m.role !== 'system');
  const transcript = chat
    .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
    .join('\n\n');
  const prompt = [
    system ? `System (Synthio · Syntheverse Sandbox):\n${system}` : '',
    transcript ? `Conversation so far:\n${transcript}` : '',
    'Reply as Synthio. Stay inside Syntheverse Sandbox honesty bounds. Keep the answer concise and useful.',
  ]
    .filter(Boolean)
    .join('\n\n');

  let agent;
  try {
    agent = await withTimeout(
      Agent.create({
        apiKey,
        model: { id: modelId },
        cloud: { type: 'cloud' },
      }),
      45_000,
      'Synthio Agent.create',
    );

    const run = await withTimeout(agent.send(prompt), 30_000, 'Synthio agent.send');
    let text = '';
    let result = null;
    if (run && typeof run.wait === 'function') {
      result = await withTimeout(run.wait(), 90_000, 'Synthio run.wait');
      text = extractAssistantText(result);
    }
    if (!text.trim() && typeof run?.result !== 'undefined') {
      text = extractAssistantText(run.result);
    }
    if (!text.trim()) {
      const err = new Error('Cursor agent returned an empty Synthio reply.');
      err.status = 502;
      throw err;
    }
    return { text: text.trim(), provider: 'cursor', model: modelId };
  } catch (err) {
    if (err && (err.status === 401 || err.status === 403)) throw err;
    const msg = String(err?.message || err || 'Cursor provider error');
    if (/unauthorized|invalid api key|401|403/i.test(msg)) {
      const e = new Error(msg);
      e.status = 401;
      throw e;
    }
    if (err?.code === 'timeout' || /timed out/i.test(msg)) {
      const e = new Error(msg);
      e.status = 504;
      throw e;
    }
    const e = new Error(msg);
    e.status = err?.status || 502;
    throw e;
  } finally {
    try {
      if (agent && typeof agent[Symbol.asyncDispose] === 'function') await agent[Symbol.asyncDispose]();
      else if (agent && typeof agent.close === 'function') await agent.close();
    } catch {
      /* ignore */
    }
  }
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
      acceptsProviders: ['cursor', 'claude', 'gemini', 'openrouter'],
      latticeSessionReusable: true,
      cursorKeySufficient: true,
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

  const provider = resolveProvider(req, body);
  const apiKey = resolveApiKey(req, provider);
  if (!apiKey) {
    return json(res, 401, {
      error:
        provider === 'cursor'
          ? 'Cursor key missing. Unlock Lattice Chat with your Cursor key on this device — Synthio reuses it.'
          : MISSING_KEY,
      code: 'missing_provider_api_key',
      provider,
    });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return json(res, 400, { error: 'message is required' });
  }

  const messages = buildSynthioMessages(message, { history: body.history });
  const model = typeof body.model === 'string' ? body.model.trim() : '';

  try {
    let out;
    if (provider === 'cursor') out = await callCursor(apiKey, messages, model);
    else if (provider === 'claude') out = await callClaude(apiKey, messages, model);
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
      detail: err.detail || undefined,
    });
  }
}
