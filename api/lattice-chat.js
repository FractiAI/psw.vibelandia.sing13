/**
 * Lattice V1.618 chat — Cursor SDK cloud agent.
 * All runs use server CURSOR_API_KEY (FractiAI pipe). Guests sign in with email only.
 * Access: email allowlist. Creator permanent. Guests one month from grant.
 * Note: keep this file self-contained for Vercel (avoid top-level .mjs imports).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const config = {
  maxDuration: 300,
};

const DEFAULT_REPO = 'https://github.com/FractiAI/psw.vibelandia.sing13';
const CREATOR_EMAIL = 'valetpru@gmail.com';
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const HISTORY_WINDOW = 16;
const NAIVE_CORPUS_DUMP_TOKENS = 72_000;
const LATTICE_RAG_POINTER_TOKENS = 1_800;
const LATTICE_NEST_OVERHEAD_TOKENS = 420;

const PREAMBLE = `You are Lattice V1.618 by FractiAI — the Nested Agent Lattice chat surface over SING13.
Ground answers in docs/, protocols/, research/, and nested-agent / NSPFRNP rules when relevant.
Prefer precise, corpus-faithful replies. Do not invent repo paths or protocols.
Keep self-talk brief. Close substantive answers with → ∞¹³.
Return a clear text reply (not a PR or code edit unless asked).`;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body ?? {}));
}

function normalizeEmail(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function isValidEmailShape(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadAccessDoc() {
  const candidates = [
    join(process.cwd(), 'data', 'lattice-access.json'),
    join(process.cwd(), '..', 'data', 'lattice-access.json'),
  ];
  for (const p of candidates) {
    try {
      if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
    } catch {
      /* try next */
    }
  }
  return { creatorEmail: CREATOR_EMAIL, grants: [] };
}

function checkLatticeEmailAccess(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmailShape(email)) {
    return {
      ok: false,
      reason: 'Enter a valid email address to continue.',
      privilege: 'none',
      email,
      expiresAt: null,
    };
  }

  const doc = loadAccessDoc();
  const creator = normalizeEmail(doc.creatorEmail || CREATOR_EMAIL) || CREATOR_EMAIL;
  if (email === creator) {
    return {
      ok: true,
      reason: 'Permanent access.',
      privilege: 'creator',
      email,
      expiresAt: null,
    };
  }

  const grants = Array.isArray(doc.grants) ? doc.grants : [];
  const hit = grants.find((g) => normalizeEmail(g?.email) === email);
  if (!hit) {
    return {
      ok: false,
      reason: 'No Lattice access for this email yet. Use Request access, then Sign in after you’re granted.',
      privilege: 'none',
      email,
      expiresAt: null,
    };
  }

  const grantedAt = hit.grantedAt ? new Date(hit.grantedAt).getTime() : NaN;
  const expiresAtMs = hit.expiresAt
    ? new Date(hit.expiresAt).getTime()
    : Number.isFinite(grantedAt)
      ? grantedAt + MONTH_MS
      : NaN;

  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    return {
      ok: false,
      reason: 'Access expired (one-month guest window). Request access again to renew.',
      privilege: 'none',
      email,
      expiresAt: Number.isFinite(expiresAtMs) ? new Date(expiresAtMs).toISOString() : null,
    };
  }

  return {
    ok: true,
    reason: 'Guest access — one month from grant.',
    privilege: 'guest',
    email,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function buildLatticeExecution(args) {
  const history = Array.isArray(args.history) ? args.history.slice(-HISTORY_WINDOW) : [];
  const historyText = history.map((m) => `${m.role || ''}: ${m.content || ''}`).join('\n');
  const msgTok = estimateTokens(args.message);
  const histTok = estimateTokens(historyText);
  const replyTok = args.reply ? estimateTokens(args.reply) : 0;
  const naiveHistory = Array.isArray(args.history)
    ? estimateTokens(args.history.map((m) => `${m.role}: ${m.content}`).join('\n'))
    : histTok;
  const naiveTokens = naiveHistory + NAIVE_CORPUS_DUMP_TOKENS + msgTok + Math.max(replyTok, 400);
  const resumeDiscount = args.resumed ? Math.floor(histTok * 0.55) : 0;
  let latticeTokens =
    histTok + msgTok + LATTICE_RAG_POINTER_TOKENS + LATTICE_NEST_OVERHEAD_TOKENS + replyTok - resumeDiscount;
  if (typeof args.usageTokens === 'number' && args.usageTokens > 0) {
    latticeTokens = Math.min(latticeTokens, args.usageTokens);
  }
  latticeTokens = Math.max(msgTok + 200, Math.round(latticeTokens));
  const savedTokens = Math.max(0, naiveTokens - latticeTokens);
  const savedPercent = naiveTokens > 0 ? Math.round((savedTokens / naiveTokens) * 1000) / 10 : 0;

  const agents = [
    { id: 'phi-parent', name: 'Φ-Parent', role: 'Meta-optimizer', scale: 'outer', status: 'complete', progress: 100 },
    { id: 'seed-rag', name: 'Seed·RAG', role: 'Corpus pointers', scale: 'seed', status: 'complete', progress: 100 },
    { id: 'squeeze', name: 'Squeeze', role: 'Fold results', scale: 'MCA', status: 'complete', progress: 100 },
  ];

  return {
    engine: 'Lattice V1.618 · Nested Agent Lattice',
    mode: args.mode === 'edge' ? 'edge' : 'cloud',
    cycle: 'Metabolize → Crystallize → Animate → Squeeze (MCA)',
    selfTalk: [
      { id: 'm', phase: 'Metabolize', voice: 'Φ-Parent', detail: 'Ingest ask' },
      { id: 'c', phase: 'Crystallize', voice: 'Lattice', detail: 'Spawn nested bands' },
      { id: 'a', phase: 'Animate', voice: 'Pipe', detail: args.resumed ? 'Resume' : 'Fresh' },
      { id: 't', phase: 'Token ledger', voice: 'Engine', detail: `Saved ~${savedTokens}` },
      { id: 's', phase: 'Squeeze', voice: 'Φ-Parent', detail: 'Fold → ∞¹³' },
    ],
    agents,
    tokens: {
      naiveTokens,
      latticeTokens,
      savedTokens,
      savedPercent,
      standardLabel: 'Standard agentic (est.)',
      latticeLabel: 'Lattice (est.)',
      method:
        'Estimate chars÷4 · standard ≈ full corpus dump + history + reply; Lattice ≈ RAG pointers + nest overhead + reply',
      assumptions: ['Heuristic meter — not vendor billing'],
    },
    organization: ['Edge history', 'RAG pointers', 'Nested scale bands'],
    closedAt: new Date().toISOString(),
  };
}

function readEmail(req, body) {
  const h = req.headers || {};
  const raw = h['x-lattice-email'] || h['X-Lattice-Email'] || body?.email || '';
  return String(Array.isArray(raw) ? raw[0] : raw).trim();
}

/**
 * Server Cursor API key only — guests do not supply keys.
 * Never logs the key.
 */
function resolveCursorApiKey() {
  const fromEnv = (process.env.CURSOR_API_KEY || '').trim();
  if (fromEnv) return { key: fromEnv, source: 'server' };
  return { key: '', source: 'none' };
}

const MISSING_KEY_ERROR =
  'Lattice cloud is not configured (CURSOR_API_KEY missing on the server). Operator must set it in Vercel env.';

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body || '{}'));
    } catch {
      return Promise.reject(new Error('Invalid JSON body'));
    }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function buildPrompt(message, history) {
  const prior = Array.isArray(history) ? history.slice(-HISTORY_WINDOW) : [];
  const lines = prior
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content).trim()}`)
    .filter((line) => line.length > 8);
  const transcript = lines.length ? `Conversation so far:\n${lines.join('\n\n')}\n\n` : '';
  return `${PREAMBLE}

${transcript}Latest user message:
${String(message || '').trim()}

Respond as Lattice with a helpful chat reply.`;
}

function extractAssistantText(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (typeof result.result === 'string') return result.result;
  if (typeof result.text === 'string') return result.text;
  return '';
}

async function disposeAgent(agent) {
  if (!agent) return;
  try {
    if (typeof agent[Symbol.asyncDispose] === 'function') await agent[Symbol.asyncDispose]();
    else if (typeof agent.close === 'function') await agent.close();
  } catch (err) {
    console.warn('[lattice-chat] agent dispose', err);
  }
}

function isBusyError(err) {
  if (!err) return false;
  const name = err.name || err.constructor?.name || '';
  const code = err.code || '';
  const msg = String(err.message || err);
  return (
    name === 'AgentBusyError' ||
    code === 'agent_busy' ||
    /agent[_\s-]?busy|already has an active run|active run/i.test(msg)
  );
}

function isAbortLikeError(err) {
  const msg = String(err?.message || err || '');
  return /aborted|abort|disconnect|socket hang up|canceled|cancelled|client closed/i.test(msg);
}

function normalizeRunStatus(status) {
  return String(status || '')
    .trim()
    .toLowerCase();
}

function isActiveRunStatus(status) {
  const s = normalizeRunStatus(status);
  return s === 'running' || s === 'creating' || s === 'queued' || s === 'pending';
}

function runIdOf(run) {
  return run?.id || run?.runId || run?.run_id || null;
}

async function listCloudRuns(Agent, agentId, apiKey, limit = 8) {
  if (!Agent?.listRuns || !agentId) return [];
  try {
    const listed = await Agent.listRuns(agentId, {
      apiKey,
      runtime: 'cloud',
      limit,
    });
    if (Array.isArray(listed)) return listed;
    if (Array.isArray(listed?.items)) return listed.items;
    return [];
  } catch (err) {
    console.warn('[lattice-chat] listRuns', err);
    return [];
  }
}

async function resolveCloudRun(Agent, agentId, runLike, apiKey) {
  if (!runLike) return null;
  if (typeof runLike.wait === 'function' || typeof runLike.stream === 'function') {
    return runLike;
  }
  const id = runIdOf(runLike);
  if (!id || !Agent?.getRun) return null;
  try {
    return await Agent.getRun(id, { apiKey, runtime: 'cloud', agentId });
  } catch (err) {
    console.warn('[lattice-chat] getRun', err);
    return null;
  }
}

/** Wait for an in-flight cloud run (or return latest finished). Used after tab-blur / agent_busy. */
async function recoverCloudRun(Agent, agentId, apiKey) {
  const items = await listCloudRuns(Agent, agentId, apiKey, 8);
  if (!items.length) return null;

  const activeMeta =
    items.find((r) => isActiveRunStatus(r.status)) ||
    items.find((r) => isActiveRunStatus(r?.result?.status));
  const targetMeta = activeMeta || items[0];
  const run = await resolveCloudRun(Agent, agentId, targetMeta, apiKey);
  if (!run) return null;

  const collected = await collectRunTranscript(run);
  return {
    ...collected,
    agentId,
    recovered: true,
  };
}

async function cancelActiveCloudRuns(Agent, agentId, apiKey) {
  const items = await listCloudRuns(Agent, agentId, apiKey, 5);
  for (const item of items) {
    if (!isActiveRunStatus(item.status) && !isActiveRunStatus(item?.result?.status)) continue;
    try {
      const run = await resolveCloudRun(Agent, agentId, item, apiKey);
      if (run && typeof run.cancel === 'function' && (!run.supports || run.supports('cancel'))) {
        await run.cancel();
      } else if (Agent.cancelRun && runIdOf(item)) {
        await Agent.cancelRun(runIdOf(item), { apiKey, runtime: 'cloud', agentId });
      }
    } catch (err) {
      console.warn('[lattice-chat] cancel active run', err);
    }
  }
}

/** Send follow-up; if agent is busy, wait out / recover the active run, then retry once. */
async function sendPromptHandlingBusy(Agent, agent, prompt, sendOpts, apiKey) {
  try {
    return { run: await agent.send(prompt, sendOpts), recovered: null };
  } catch (err) {
    if (!isBusyError(err)) throw err;
    const id = agent.agentId;
    console.warn('[lattice-chat] agent busy — recovering active run', id);
    const recovered = await recoverCloudRun(Agent, id, apiKey);
    if (recovered && (recovered.text?.trim() || recovered.transcript?.length)) {
      return { run: null, recovered };
    }
    await cancelActiveCloudRuns(Agent, id, apiKey);
    return { run: await agent.send(prompt, sendOpts), recovered: null };
  }
}

/** Normalize SDK stream events into Cursor-chat-style transcript items. */
function pushTranscript(items, item) {
  if (!item) return;
  if (item.type === 'assistant' && items.length) {
    const last = items[items.length - 1];
    if (last.type === 'assistant') {
      last.text = `${last.text || ''}${item.text || ''}`;
      return;
    }
  }
  if (item.type === 'thinking' && items.length) {
    const last = items[items.length - 1];
    if (last.type === 'thinking' && item.durationMs == null) {
      last.text = `${last.text || ''}${item.text || ''}`;
      return;
    }
  }
  if (item.type === 'tool_call' && item.callId) {
    const idx = items.findIndex((x) => x.type === 'tool_call' && x.callId === item.callId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...item };
      return;
    }
  }
  items.push(item);
}

function summarizeUnknown(value, max = 400) {
  if (value == null) return undefined;
  try {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    if (s.length <= max) return s;
    return `${s.slice(0, max)}…`;
  } catch {
    return undefined;
  }
}

async function collectRunTranscript(run) {
  const transcript = [];
  let text = '';
  if (run && typeof run.supports === 'function' && run.supports('stream') && typeof run.stream === 'function') {
    try {
      for await (const event of run.stream()) {
        if (!event || typeof event.type !== 'string') continue;
        if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
          for (const block of event.message.content) {
            if (block?.type === 'text' && typeof block.text === 'string') {
              text += block.text;
              pushTranscript(transcript, { type: 'assistant', text: block.text });
            }
          }
        } else if (event.type === 'thinking' && typeof event.text === 'string') {
          pushTranscript(transcript, {
            type: 'thinking',
            text: event.text,
            durationMs:
              typeof event.thinking_duration_ms === 'number' ? event.thinking_duration_ms : undefined,
          });
        } else if (event.type === 'tool_call') {
          pushTranscript(transcript, {
            type: 'tool_call',
            callId: String(event.call_id || ''),
            name: String(event.name || 'tool'),
            status: String(event.status || 'running'),
            argsPreview: summarizeUnknown(event.args),
            resultPreview: summarizeUnknown(event.result),
          });
        } else if (event.type === 'status') {
          pushTranscript(transcript, {
            type: 'status',
            status: String(event.status || ''),
            message: typeof event.message === 'string' ? event.message : undefined,
          });
        } else if (event.type === 'task') {
          pushTranscript(transcript, {
            type: 'task',
            status: typeof event.status === 'string' ? event.status : undefined,
            text: typeof event.text === 'string' ? event.text : undefined,
          });
        }
      }
    } catch (err) {
      console.warn('[lattice-chat] stream read', err);
    }
  }
  const result = run && typeof run.wait === 'function' ? await run.wait() : null;
  if (!text.trim()) text = extractAssistantText(result);
  if (text.trim() && !transcript.some((i) => i.type === 'assistant' && String(i.text || '').trim())) {
    pushTranscript(transcript, { type: 'assistant', text: text.trim() });
  }
  return { text: text.trim(), transcript, result, runId: result?.id ?? run?.id };
}

function normalizeAgentMode(raw) {
  const m = String(raw || '')
    .trim()
    .toLowerCase();
  return m === 'plan' ? 'plan' : 'agent';
}

function normalizeModelId(raw) {
  const id = String(raw || '')
    .trim();
  return id || (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim() || 'composer-2.5';
}

/** Catalog shown when Cursor.models.list is empty/unavailable — keep broad for the picker. */
const FALLBACK_MODELS = [
  { id: 'auto', displayName: 'Auto' },
  { id: 'composer-2.5', displayName: 'Composer 2.5' },
  { id: 'composer-2', displayName: 'Composer 2' },
  { id: 'composer-2.5-fast', displayName: 'Composer 2.5 Fast' },
  { id: 'gpt-5.6-sol-medium', displayName: 'GPT-5.6 Sol' },
  { id: 'gpt-5.6-terra-medium', displayName: 'GPT-5.6 Terra' },
  { id: 'gpt-5.5', displayName: 'GPT-5.5' },
  { id: 'gpt-5.2', displayName: 'GPT-5.2' },
  { id: 'claude-opus-4-8-thinking-high', displayName: 'Claude Opus 4.8 Thinking' },
  { id: 'claude-sonnet-5-thinking-high', displayName: 'Claude Sonnet 5 Thinking' },
  { id: 'claude-fable-5-thinking-high', displayName: 'Claude Fable 5 Thinking' },
  { id: 'claude-4.6-sonnet-thinking', displayName: 'Claude 4.6 Sonnet Thinking' },
  { id: 'claude-4.5-sonnet', displayName: 'Claude 4.5 Sonnet' },
  { id: 'claude-opus-4-7', displayName: 'Claude Opus 4.7' },
  { id: 'cursor-grok-4.5-high-fast', displayName: 'Grok 4.5 Fast' },
];

function asModelList(listed) {
  if (Array.isArray(listed)) return listed;
  if (listed && Array.isArray(listed.items)) return listed.items;
  if (listed && Array.isArray(listed.models)) return listed.models;
  return [];
}

function mapCursorModel(m) {
  const id = String(m?.id || '').trim();
  if (!id) return null;
  return {
    id,
    displayName: String(m?.displayName || m?.name || id).trim(),
    description: typeof m?.description === 'string' ? m.description : undefined,
    variants: Array.isArray(m?.variants)
      ? m.variants.map((v) => ({
          displayName: String(v?.displayName || '').trim(),
          isDefault: Boolean(v?.isDefault),
          params: Array.isArray(v?.params) ? v.params : [],
        }))
      : undefined,
  };
}

/** Live Cursor list wins on overlap; fallback fills gaps so the picker stays full. */
function mergeModelCatalog(live) {
  const byId = new Map();
  for (const m of FALLBACK_MODELS) byId.set(m.id, { ...m });
  for (const m of live) {
    if (!m?.id) continue;
    const prev = byId.get(m.id);
    byId.set(m.id, {
      id: m.id,
      displayName: m.displayName || prev?.displayName || m.id,
      description: m.description || prev?.description,
      variants: m.variants?.length ? m.variants : prev?.variants,
    });
  }
  return [...byId.values()];
}

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-lattice-email');
      return json(res, 204, {});
    }

    if (req.method === 'GET') {
      let url;
      try {
        url = new URL(req.url || '', 'http://localhost');
      } catch {
        url = null;
      }
      const qEmail =
        (typeof req.query?.email === 'string' ? req.query.email : '') ||
        url?.searchParams.get('email') ||
        '';
      const wantModels =
        req.query?.models === '1' ||
        req.query?.models === 'true' ||
        url?.searchParams.get('models') === '1' ||
        url?.searchParams.get('models') === 'true';
      const wantRepos =
        req.query?.repos === '1' ||
        req.query?.repos === 'true' ||
        url?.searchParams.get('repos') === '1' ||
        url?.searchParams.get('repos') === 'true';

      if (wantRepos) {
        const access = checkLatticeEmailAccess(qEmail || readEmail(req, {}));
        if (!access.ok) {
          return json(res, 401, { error: access.reason, ok: false });
        }
        const { key: apiKey, source: keySource } = resolveCursorApiKey();
        if (!apiKey) {
          return json(res, 503, {
            ok: false,
            code: 'missing_cursor_api_key',
            error: MISSING_KEY_ERROR,
            targetRepo: DEFAULT_REPO,
          });
        }
        const targetNeedle = 'fractiai/psw.vibelandia.sing13';
        try {
          const { Cursor } = await import('@cursor/sdk');
          const listed = await Cursor.repositories.list({ apiKey });
          const urls = (Array.isArray(listed) ? listed : [])
            .map((r) => String(r?.url || '').trim())
            .filter(Boolean);
          const matched = urls.filter((u) => u.toLowerCase().includes(targetNeedle));
          return json(res, 200, {
            ok: matched.length > 0,
            code: matched.length ? 'repo_connected' : 'repo_not_in_cursor_github',
            targetRepo: DEFAULT_REPO,
            matched,
            connectedCount: urls.length,
            keySource,
            // Sample only — avoid dumping full org lists to clients.
            sample: urls.slice(0, 12),
            note:
              matched.length > 0
                ? 'Server CURSOR_API_KEY can see this repo via Cursor GitHub integration.'
                : 'Server CURSOR_API_KEY works for Cursor API, but this repo is not in Cursor.repositories.list for that key. Connect GitHub for the FractiAI Cursor account (cursor.com → Integrations → GitHub) and grant FractiAI/psw.vibelandia.sing13.',
          });
        } catch (err) {
          console.warn('[lattice-chat] repositories.list', err);
          return json(res, 502, {
            ok: false,
            code: 'repos_list_failed',
            targetRepo: DEFAULT_REPO,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      if (wantModels) {
        const access = checkLatticeEmailAccess(qEmail || readEmail(req, {}));
        if (!access.ok) {
          return json(res, 401, { error: access.reason, models: FALLBACK_MODELS });
        }
        const { key: apiKey } = resolveCursorApiKey();
        if (!apiKey) {
          return json(res, 200, { models: FALLBACK_MODELS, source: 'fallback' });
        }
        try {
          const { Cursor } = await import('@cursor/sdk');
          const listed = await Cursor.models.list({ apiKey });
          const live = asModelList(listed).map(mapCursorModel).filter(Boolean);
          const models = mergeModelCatalog(live);
          return json(res, 200, {
            models,
            source: live.length ? 'cursor+catalog' : 'fallback',
            liveCount: live.length,
          });
        } catch (err) {
          console.warn('[lattice-chat] models.list', err);
          return json(res, 200, {
            models: FALLBACK_MODELS,
            source: 'fallback',
            detail: err instanceof Error ? err.message : String(err),
          });
        }
      }

      const access = checkLatticeEmailAccess(qEmail);
      return json(res, access.ok ? 200 : 401, access);
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

    const access = checkLatticeEmailAccess(readEmail(req, body));
    if (!access.ok) {
      return json(res, 401, {
        error: access.reason,
        privilege: access.privilege,
        expiresAt: access.expiresAt,
      });
    }

    const { key: apiKey } = resolveCursorApiKey();
    if (!apiKey) {
      return json(res, 503, {
        error: MISSING_KEY_ERROR,
        code: 'missing_cursor_api_key',
      });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const recoverOnly = Boolean(body.recover);
    if (!message && !recoverOnly) {
      return json(res, 400, { error: 'message is required' });
    }

    // Guard common typo (cing13) and empty overrides from Vercel env.
    let repoUrl = (process.env.LATTICE_REPO_URL || DEFAULT_REPO).trim() || DEFAULT_REPO;
    if (/psw\.vibelandia\.cing13/i.test(repoUrl)) {
      console.warn('[lattice-chat] correcting LATTICE_REPO_URL typo cing13 → sing13');
      repoUrl = repoUrl.replace(/psw\.vibelandia\.cing13/gi, 'psw.vibelandia.sing13');
    }
    const modelId = normalizeModelId(body.model || body.modelId);
    const agentMode = normalizeAgentMode(body.mode || body.agentMode);
    const startingRef = (process.env.LATTICE_STARTING_REF || 'main').trim() || 'main';
    let agentId =
      typeof body.agentId === 'string' && body.agentId.trim() ? body.agentId.trim() : null;

    let agent;
    let completedOk = false;
    try {
      let Agent;
      try {
        ({ Agent } = await import('@cursor/sdk'));
      } catch (sdkErr) {
        console.error('[lattice-chat] SDK import failed', sdkErr);
        return json(res, 503, {
          error:
            'Cursor SDK failed to load on the server. Confirm Node 22+ and @cursor/sdk are installed, then redeploy.',
          code: 'sdk_import_failed',
          detail: sdkErr instanceof Error ? sdkErr.message : String(sdkErr),
        });
      }

      if (agentId) {
        try {
          agent = await Agent.resume(agentId, { apiKey });
        } catch (resumeErr) {
          console.warn('[lattice-chat] resume failed, creating new agent', resumeErr);
          agentId = null;
        }
      }

      const modelSelection = { id: modelId };

      // Tab-blur / reconnect: attach to the in-flight or latest cloud run and return it.
      if (recoverOnly && agent) {
        const recovered = await recoverCloudRun(Agent, agent.agentId ?? agentId, apiKey);
        if (recovered && (recovered.text?.trim() || recovered.transcript?.length)) {
          const reply = recovered.text || extractAssistantText(recovered.result) || '';
          const execution = buildLatticeExecution({
            message: message || '(recovered run)',
            history: body.history,
            mode: 'cloud',
            resumed: true,
            reply,
            runId: recovered.runId,
            agentId: agent.agentId ?? agentId,
            usageTokens:
              typeof recovered.result?.usage?.totalTokens === 'number'
                ? recovered.result.usage.totalTokens
                : null,
          });
          completedOk = true;
          return json(res, 200, {
            reply,
            transcript: recovered.transcript || [],
            model: modelId,
            mode: agentMode,
            runId: recovered.runId,
            agentId: agent.agentId ?? agentId,
            threadId: body.threadId ?? null,
            recovered: true,
            tokens: execution.tokens,
            execution,
            access: {
              privilege: access.privilege,
              email: access.email,
              expiresAt: access.expiresAt,
              reason: access.reason,
            },
          });
        }
        if (!message) {
          return json(res, 409, {
            error: 'No active or finished run to recover yet. Wait a moment and retry.',
            code: 'nothing_to_recover',
            agentId: agent.agentId ?? agentId,
          });
        }
      }

      if (!agent) {
        agent = await Agent.create({
          apiKey,
          model: modelSelection,
          mode: agentMode,
          cloud: {
            repos: [{ url: repoUrl, startingRef }],
          },
        });
      }

      const prompt = agent && agentId ? message : buildPrompt(message, body.history);
      const sendOpts = {
        model: modelSelection,
        mode: agentMode,
      };

      const { run, recovered } = await sendPromptHandlingBusy(
        Agent,
        agent,
        prompt,
        sendOpts,
        apiKey,
      );

      const packed = recovered
        ? recovered
        : await collectRunTranscript(run);
      const { text, transcript, result, runId } = packed;

      if (result?.status === 'error') {
        return json(res, 502, {
          error: result?.error?.message || 'Agent run failed',
          runId,
          agentId: agent.agentId ?? agentId,
          transcript,
          model: modelId,
          mode: agentMode,
        });
      }

      const reply = text || extractAssistantText(result);
      if (!reply && !(transcript && transcript.length)) {
        return json(res, 502, {
          error: 'Agent finished without reply text',
          runId,
          agentId: agent.agentId ?? agentId,
          transcript,
          model: modelId,
          mode: agentMode,
        });
      }

      const usageTokens =
        typeof result?.usage?.totalTokens === 'number'
          ? result.usage.totalTokens
          : null;

      const execution = buildLatticeExecution({
        message: message || '(recovered run)',
        history: body.history,
        mode: 'cloud',
        resumed: Boolean(agentId),
        reply: reply || '',
        runId,
        agentId: agent.agentId ?? agentId,
        usageTokens,
      });

      completedOk = true;
      return json(res, 200, {
        reply: reply || '',
        transcript,
        model: modelId,
        mode: agentMode,
        runId,
        agentId: agent.agentId ?? agentId,
        threadId: body.threadId ?? null,
        recovered: Boolean(recovered || recoverOnly),
        tokens: execution.tokens,
        execution,
        access: {
          privilege: access.privilege,
          email: access.email,
          expiresAt: access.expiresAt,
          reason: access.reason,
        },
      });
    } catch (err) {
      console.error('[lattice-chat]', err);
      const msg = err instanceof Error ? err.message : 'Lattice agent failed';
      if (isBusyError(err)) {
        return json(res, 409, {
          error:
            'Agent still has an active run. Lattice will recover it — wait a few seconds and retry, or stay on this tab until Working finishes.',
          code: 'agent_busy',
          agentId: agent?.agentId ?? agentId,
        });
      }

      // Expected config/access failures — do not count as 500s (clients must stop retry storms).
      if (/unauthorized|invalid.?api.?key|api key.*(invalid|missing)|401\b/i.test(msg)) {
        return json(res, 401, {
          error: msg,
          code: 'cursor_auth',
          agentId: agent?.agentId ?? agentId,
        });
      }
      const branchFail =
        /default branch|verify existence of branch|repository access|GitHub App|cursor github|not in cursor|failed to (clone|access).*repo|repositories?/i.test(
          msg,
        );
      if (branchFail) {
        return json(res, 422, {
          error:
            msg +
            ` Lattice uses ${repoUrl} @ ${startingRef}. Connect GitHub for the Cursor account that owns this API key (cursor.com/dashboard/integrations) and ensure FractiAI/psw.vibelandia.sing13 is visible — public clone ≠ Cursor cloud access.`,
          code: 'cursor_github_access',
          repoUrl,
          startingRef,
          agentId: agent?.agentId ?? agentId,
        });
      }
      if (/unknown model|invalid model|model .+ not (found|available)|unsupported model/i.test(msg)) {
        return json(res, 422, {
          error: msg,
          code: 'invalid_model',
          model: modelId,
          agentId: agent?.agentId ?? agentId,
        });
      }

      return json(res, 500, {
        error: msg,
        code: 'agent_error',
        agentId: agent?.agentId ?? agentId,
      });
    } finally {
      // Do not dispose on client abort / mid-flight errors — cloud run must stay recoverable.
      if (completedOk) await disposeAgent(agent);
    }
  } catch (outer) {
    console.error('[lattice-chat] outer', outer);
    return json(res, 500, {
      error: outer instanceof Error ? outer.message : 'Lattice API failed',
      code: 'outer_error',
    });
  }
}
