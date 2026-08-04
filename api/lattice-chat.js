/**
 * Lattice Chat V1.618 chat — multi-provider BYOK proxy (Cursor cloud · Claude Messages · Gemini Antigravity).
 *
 * El Gran Sol’s Fractal Constant (EGS fractal constant): scale-invariant geometric ratio
 * balancing harmonic signal flow across downstream systems — the golden key that establishes
 * baseline operational symmetry. Request headers must stay clean through this pipe layer
 * (email + provider key headers only; never persist or log user keys).
 *
 * Access: email allowlist. Creator permanent. Guests one month from grant.
 * All Cursor seats attach FractiAI/psw.vibelandia.sing13 (same product workspace).
 * Guests get full agents with an honor directive (no separate sandbox / no-repo path).
 * Prompt assembly: dynamic-import lib/lattice-prompt.mjs (Vercel compiles this file to CJS —
 * never use a top-level static .mjs import here).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const config = {
  maxDuration: 300,
};

/** Leave headroom under Vercel 300s for create/resume/balances — never sit in collect until hard kill. */
const COLLECT_BUDGET_MS = 180_000;

const DEFAULT_REPO = 'https://github.com/FractiAI/psw.vibelandia.sing13';
const CREATOR_EMAIL = 'valetpru@gmail.com';
/**
 * Everyone attaches SING13 for product context + agents.
 * Guest honor rail is prompt-only — do not treat it as a hard git lock.
 */
const SING13_REPO_HOST_RE = /github\.com[/:]FractiAI\/psw\.vibelandia\.sing13(?:\.git)?(?:\/|$|\?|#)/i;
const GUEST_SING13_HONOR_DIRECTIVE = `## Guest session (SING13 honor rail)
You are helping a paid Lattice Chat guest on FractiAI/psw.vibelandia.sing13.
Full agent tools are allowed for exploration, explanation, planning, and local iteration in the cloud VM.
Do NOT commit, push, force-push, open pull requests, or permanently alter production ship apps unless the guest is explicitly coordinating a creator-approved change.
Prefer answers, plans, and reversible exploration over durable repo writes.`;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const NAIVE_CORPUS_DUMP_TOKENS = 72_000;
const LATTICE_RAG_POINTER_TOKENS = 1_800;
const LATTICE_NEST_OVERHEAD_TOKENS = 420;

/** Populated by loadLatticePromptLib() — dynamic import survives Vercel ESM→CJS compile. */
let HISTORY_WINDOW = 16;
let assembleLatticePrompt;
let assembleResumePrompt;
let buildComplexSeedPack;
let buildComplexWorkProtocol;
let buildNestDirective;
let buildPrompt;
let classifyAsk;
let normalizeNestTopology;

async function loadLatticePromptLib() {
  if (typeof assembleLatticePrompt === 'function') return;
  const m = await import('../lib/lattice-prompt.mjs');
  HISTORY_WINDOW = m.HISTORY_WINDOW;
  assembleLatticePrompt = m.assembleLatticePrompt;
  assembleResumePrompt = m.assembleResumePrompt;
  buildComplexSeedPack = m.buildComplexSeedPack;
  buildComplexWorkProtocol = m.buildComplexWorkProtocol;
  buildNestDirective = m.buildNestDirective;
  buildPrompt = m.buildPrompt;
  classifyAsk = m.classifyAsk;
  normalizeNestTopology = m.normalizeNestTopology;
}

function normalizeReasoningLens(_raw) {
  return 'engine';
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body ?? {}));
}

function wantsStream(req, body) {
  if (body?.stream === true || body?.stream === 1 || body?.stream === '1') return true;
  const accept = String(req.headers?.accept || req.headers?.Accept || '');
  return /text\/event-stream/i.test(accept);
}

function initSse(res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();
}

function sseWrite(res, event, data) {
  if (!res || res.writableEnded) return;
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data ?? {})}\n\n`);
  } catch {
    /* client gone */
  }
}

/** Keep proxies/browsers from stalling during long Agent.create / cloud runs. */
function startSseHeartbeat(res, intervalMs = 12_000) {
  if (!res || res.writableEnded) return () => {};
  const tick = () => {
    if (!res || res.writableEnded) return;
    try {
      res.write(`: keepalive ${Date.now()}\n\n`);
    } catch {
      /* ignore */
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => clearInterval(id);
}

function withTimeout(promise, ms, label = 'operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} timed out after ${Math.round(ms / 1000)}s`);
      err.code = 'timeout';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function cursorAuthHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };
}

/** Cumulative agent token balance from Cloud Agents usage API (actual ledger, not estimate). */
async function fetchAgentTokenBalance(apiKey, agentId) {
  if (!apiKey || !agentId) return null;
  try {
    const res = await withTimeout(
      fetch(`https://api.cursor.com/v1/agents/${encodeURIComponent(agentId)}/usage`, {
        headers: cursorAuthHeaders(apiKey),
      }),
      8_000,
      'token balance fetch',
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const total = data?.totalUsage?.totalTokens;
    return typeof total === 'number' && Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
}

/** Best-effort per-run usage when balance delta is unavailable. */
async function fetchRunTokenUsage(apiKey, agentId, runId) {
  if (!apiKey || !agentId || !runId) return null;
  try {
    const res = await withTimeout(
      fetch(
        `https://api.cursor.com/v1/agents/${encodeURIComponent(agentId)}/usage?runId=${encodeURIComponent(runId)}`,
        { headers: cursorAuthHeaders(apiKey) },
      ),
      8_000,
      'run usage fetch',
    );
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const run = Array.isArray(data?.runs) ? data.runs[0] : null;
    const total = run?.usage?.totalTokens ?? data?.totalUsage?.totalTokens;
    return typeof total === 'number' && Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
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
  const estimatedLatticeTokens = Math.max(
    msgTok + 200,
    Math.round(
      histTok +
        msgTok +
        LATTICE_RAG_POINTER_TOKENS +
        LATTICE_NEST_OVERHEAD_TOKENS +
        replyTok -
        resumeDiscount,
    ),
  );

  const balanceBefore =
    typeof args.balanceBefore === 'number' && Number.isFinite(args.balanceBefore)
      ? args.balanceBefore
      : null;
  const balanceAfter =
    typeof args.balanceAfter === 'number' && Number.isFinite(args.balanceAfter)
      ? args.balanceAfter
      : null;
  const balanceDelta =
    balanceBefore != null && balanceAfter != null
      ? Math.max(0, Math.round(balanceAfter - balanceBefore))
      : null;
  const measuredTokens =
    balanceDelta != null && balanceDelta > 0
      ? balanceDelta
      : typeof args.usageTokens === 'number' && args.usageTokens > 0
        ? Math.round(args.usageTokens)
        : null;

  const latticeTokens = measuredTokens != null ? measuredTokens : null;
  const savedTokens =
    measuredTokens != null ? Math.max(0, naiveTokens - measuredTokens) : 0;
  const savedPercent =
    measuredTokens != null && naiveTokens > 0
      ? Math.round((savedTokens / naiveTokens) * 1000) / 10
      : 0;
  const measured = measuredTokens != null;

  const agents = [
    { id: 'phi-parent', name: 'Φ-Parent', role: 'Meta-optimizer', scale: 'outer', status: 'complete', progress: 100 },
    { id: 'seed-rag', name: 'Seed·RAG', role: 'Corpus pointers', scale: 'seed', status: 'complete', progress: 100 },
    { id: 'squeeze', name: 'Squeeze', role: 'Fold results', scale: 'MCA', status: 'complete', progress: 100 },
  ];

  const balanceLine =
    balanceBefore != null && balanceAfter != null
      ? `Balance ${balanceBefore.toLocaleString()} → ${balanceAfter.toLocaleString()} (used ${(latticeTokens ?? 0).toLocaleString()})`
      : measured
        ? `Used ${latticeTokens.toLocaleString()} tokens`
        : 'Usage pending — no provider balance yet';

  return {
    engine: 'Lattice Chat V1.618 · Nested Agent Lattice',
    mode: args.mode === 'edge' ? 'edge' : 'cloud',
    cycle: 'Metabolize → Crystallize → Animate → Squeeze (MCA)',
    selfTalk: [
      { id: 'm', phase: 'Metabolize', voice: 'Φ-Parent', detail: 'Ingest ask' },
      { id: 'c', phase: 'Crystallize', voice: 'Lattice', detail: 'Spawn nested bands' },
      { id: 'a', phase: 'Animate', voice: 'Pipe', detail: args.resumed ? 'Resume' : 'Fresh' },
      { id: 't', phase: 'Token ledger', voice: 'Engine', detail: balanceLine },
      { id: 's', phase: 'Squeeze', voice: 'Φ-Parent', detail: 'Fold → ∞¹³' },
    ],
    agents,
    tokens: {
      naiveTokens,
      latticeTokens: latticeTokens ?? 0,
      estimatedLatticeTokens,
      measuredTokens,
      balanceBefore,
      balanceAfter,
      balanceDelta,
      savedTokens,
      savedPercent,
      standardLabel: undefined,
      latticeLabel: measured ? 'Tokens used' : undefined,
      method: measured
        ? balanceBefore != null && balanceAfter != null
          ? 'Measured from provider token balances (before → after delta)'
          : 'Measured from provider run usage'
        : 'Provider balance/usage not yet available for this run',
      assumptions: measured
        ? ['Tokens used = actual provider balance/usage delta for this run']
        : ['No estimate shown — waiting on provider balance/usage'],
    },
    organization: ['Edge history', 'RAG pointers', 'Nested scale bands', 'Live stream of thought'],
    closedAt: new Date().toISOString(),
  };
}

function readEmail(req, body) {
  const h = req.headers || {};
  const raw = h['x-lattice-email'] || h['X-Lattice-Email'] || body?.email || '';
  return String(Array.isArray(raw) ? raw[0] : raw).trim();
}

/**
 * Stateless BYOK: read user provider keys from headers only.
 * Never log keys. Do not fall back to process.env (edge key is required).
 */
function resolveCursorApiKey(req) {
  const h = req.headers || {};
  const headerRaw = h['x-cursor-api-key'] || h['X-Cursor-Api-Key'] || '';
  const fromHeader = String(Array.isArray(headerRaw) ? headerRaw[0] : headerRaw).trim();
  if (fromHeader.length >= 8) return { key: fromHeader, source: 'edge' };
  return { key: '', source: 'none' };
}

function resolveHeaderKey(req, names) {
  const h = req.headers || {};
  for (const name of names) {
    const raw = h[name] || h[name.toLowerCase()] || '';
    const v = String(Array.isArray(raw) ? raw[0] : raw).trim();
    if (v.length >= 8) return v;
  }
  return '';
}

function resolveProvider(req, body) {
  const h = req.headers || {};
  const raw =
    body?.provider ||
    h['x-lattice-provider'] ||
    h['X-Lattice-Provider'] ||
    'cursor';
  const p = String(Array.isArray(raw) ? raw[0] : raw)
    .trim()
    .toLowerCase();
  if (p === 'claude' || p === 'anthropic') return 'claude';
  if (p === 'gemini' || p === 'antigravity') return 'gemini';
  return 'cursor';
}

function resolveProviderApiKey(req, provider) {
  if (provider === 'claude') {
    return resolveHeaderKey(req, ['x-anthropic-api-key', 'X-Anthropic-Api-Key']);
  }
  if (provider === 'gemini') {
    return resolveHeaderKey(req, ['x-gemini-api-key', 'X-Gemini-Api-Key']);
  }
  return resolveCursorApiKey(req).key;
}

const MISSING_KEY_ERROR =
  'API key required for the selected provider. Add it in Lattice settings (kept on your device).';

const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5' },
  { id: 'claude-opus-4', displayName: 'Claude Opus 4' },
  { id: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5' },
  { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
  { id: 'claude-3-5-haiku-latest', displayName: 'Claude 3.5 Haiku' },
];

const GEMINI_MODELS = [
  {
    id: 'antigravity-preview-05-2026',
    displayName: 'Antigravity (managed)',
  },
];

function encodeGeminiAgentId(interactionId, environmentId) {
  return `gma:${interactionId || ''}|${environmentId || ''}`;
}

function decodeGeminiAgentId(agentId) {
  const raw = String(agentId || '');
  if (!raw.startsWith('gma:')) return null;
  const rest = raw.slice(4);
  const pipe = rest.indexOf('|');
  if (pipe < 0) return { interactionId: rest, environmentId: '' };
  return {
    interactionId: rest.slice(0, pipe),
    environmentId: rest.slice(pipe + 1),
  };
}

function extractGeminiText(interaction) {
  if (!interaction) return '';
  if (typeof interaction.output_text === 'string' && interaction.output_text.trim()) {
    return interaction.output_text.trim();
  }
  const outputs = Array.isArray(interaction.outputs) ? interaction.outputs : [];
  const chunks = [];
  for (const o of outputs) {
    if (typeof o?.text === 'string') chunks.push(o.text);
    if (typeof o?.content === 'string') chunks.push(o.content);
    if (Array.isArray(o?.content)) {
      for (const c of o.content) {
        if (typeof c?.text === 'string') chunks.push(c.text);
      }
    }
  }
  if (chunks.length) return chunks.join('\n').trim();
  const steps = Array.isArray(interaction.steps) ? interaction.steps : [];
  for (const s of steps) {
    if (s?.type === 'text' && typeof s.text === 'string') chunks.push(s.text);
  }
  return chunks.join('\n').trim();
}

function extractGeminiUsageTokens(interaction) {
  const usage = interaction?.usage || interaction?.usage_metadata || null;
  if (!usage || typeof usage !== 'object') return null;
  if (typeof usage.total_tokens === 'number' && usage.total_tokens > 0) {
    return Math.round(usage.total_tokens);
  }
  const input = usage.total_input_tokens ?? usage.prompt_token_count ?? usage.input_tokens;
  const output = usage.total_output_tokens ?? usage.candidates_token_count ?? usage.output_tokens;
  const thought = usage.total_thought_tokens ?? usage.thoughts_token_count ?? 0;
  if (typeof input === 'number' && typeof output === 'number') {
    return Math.round(input + output + (typeof thought === 'number' ? thought : 0));
  }
  return null;
}

function claudeSupportsThinking(modelId) {
  const id = String(modelId || '');
  if (!id) return true;
  if (/3-5-haiku|3\.5-haiku|claude-3-5-haiku/i.test(id)) return false;
  return true;
}

function claudeThinkingConfig(modelId) {
  if (!claudeSupportsThinking(modelId)) return null;
  const id = String(modelId || '');
  if (/opus-4-8|fable|mythos|opus-4\.8/i.test(id)) {
    return { type: 'adaptive', display: 'summarized' };
  }
  return { type: 'enabled', budget_tokens: 8000 };
}

/** Read an upstream SSE body and invoke onChunk(eventName, dataObj|string). */
async function consumeUpstreamSse(res, onChunk) {
  if (!res.body) {
    const text = await res.text().catch(() => '');
    if (text.trim()) {
      try {
        onChunk('message', JSON.parse(text));
      } catch {
        onChunk('raw', text);
      }
    }
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r\n/g, '\n');
    let sep;
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (!raw.trim() || raw.startsWith(':')) continue;
      let eventName = 'message';
      const dataLines = [];
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;
      const joined = dataLines.join('\n');
      if (joined === '[DONE]') {
        onChunk('done', {});
        continue;
      }
      try {
        onChunk(eventName, JSON.parse(joined));
      } catch {
        onChunk(eventName, joined);
      }
    }
  }
}

function wrapProviderAccess(access) {
  return {
    privilege: access.privilege,
    email: access.email,
    expiresAt: access.expiresAt,
    reason: access.reason,
  };
}

function buildClaudeMessages(message, history) {
  const prior = Array.isArray(history) ? history.slice(-HISTORY_WINDOW) : [];
  const messages = prior
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).trim() }))
    .filter((m) => m.content);
  if (!messages.length || messages[messages.length - 1].content !== String(message || '').trim()) {
    messages.push({ role: 'user', content: String(message || '').trim() });
  }
  return { prior, messages };
}

async function runClaudeTurn({
  apiKey,
  message,
  history,
  modelId,
  agentMode,
  access,
  nestTopology,
  agentRoster,
  reasoningLens,
  stream = false,
  onEvent = null,
}) {
  const { prior, messages } = buildClaudeMessages(message, history);
  const system = assembleLatticePrompt({
    message,
    nestTopology,
    agentRoster,
    mode: 'full',
    omitHistory: true,
    omitUserMessage: true,
    providerNote: `Provider note: You are running via the Anthropic Messages API (BYOK). The public repo is ${DEFAULT_REPO}. Prefer pointers and corpus-faithful answers. Mode: ${agentMode}.`,
  });

  const model = modelId || 'claude-sonnet-4-5';
  const thinking = claudeThinkingConfig(model);
  const maxTokens = thinking ? 16000 : 8192;
  const emit = (item) => {
    if (typeof onEvent === 'function' && item) onEvent(item);
  };

  const requestBody = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    stream: true,
  };
  if (thinking) requestBody.thinking = thinking;

  emit({ type: 'status', status: 'live', message: 'Claude stream of thought opening…' });

  let res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      accept: 'text/event-stream',
    },
    body: JSON.stringify(requestBody),
  });

  // If thinking config is rejected, retry once without thinking (still stream text).
  if (!res.ok && thinking) {
    const errBody = await res.json().catch(() => ({}));
    const msg = String(errBody?.error?.message || errBody?.message || '');
    if (/thinking|budget_tokens|adaptive/i.test(msg) || res.status === 400) {
      emit({
        type: 'status',
        status: 'live',
        message: 'Thinking unsupported on this model — streaming reply text…',
      });
      delete requestBody.thinking;
      requestBody.max_tokens = 8192;
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          accept: 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
      });
    } else {
      const err = new Error(msg || `Anthropic HTTP ${res.status}`);
      err.code = res.status === 401 || res.status === 403 ? 'claude_auth' : 'claude_error';
      err.status = res.status;
      throw err;
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data?.error?.message || data?.message || `Anthropic HTTP ${res.status}`);
    err.code = res.status === 401 || res.status === 403 ? 'claude_auth' : 'claude_error';
    err.status = res.status;
    throw err;
  }

  const transcript = [];
  let reply = '';
  let inputTokens = null;
  let outputTokens = null;
  const contentType = String(res.headers.get('content-type') || '');

  const handleAnthropicEvent = (_eventName, data) => {
    if (!data || typeof data !== 'object') return;
    const type = data.type || _eventName;
    if (type === 'message_start') {
      const usage = data.message?.usage;
      if (typeof usage?.input_tokens === 'number') inputTokens = usage.input_tokens;
      emit({ type: 'status', status: 'live', message: 'Claude is thinking…' });
      return;
    }
    if (type === 'content_block_start') {
      const block = data.content_block || {};
      if (block.type === 'thinking') {
        emit({ type: 'status', status: 'live', message: 'Stream of thought…' });
      } else if (block.type === 'tool_use') {
        const item = {
          type: 'tool_call',
          callId: String(block.id || `tool_${data.index || 0}`),
          name: String(block.name || 'tool'),
          status: 'running',
        };
        pushTranscript(transcript, item);
        emit(item);
      }
      return;
    }
    if (type === 'content_block_delta') {
      const delta = data.delta || {};
      if (delta.type === 'thinking_delta' && typeof delta.thinking === 'string') {
        const item = { type: 'thinking', text: delta.thinking };
        pushTranscript(transcript, item);
        emit(item);
      } else if (delta.type === 'text_delta' && typeof delta.text === 'string') {
        reply += delta.text;
        const item = { type: 'assistant', text: delta.text };
        pushTranscript(transcript, item);
        emit(item);
      } else if (delta.type === 'input_json_delta' && typeof delta.partial_json === 'string') {
        // Tool args stream — keep a short preview on the latest tool_call.
        const last = [...transcript].reverse().find((x) => x.type === 'tool_call');
        if (last) {
          const item = {
            ...last,
            argsPreview: `${last.argsPreview || ''}${delta.partial_json}`.slice(0, 400),
          };
          pushTranscript(transcript, item);
          emit(item);
        }
      }
      return;
    }
    if (type === 'content_block_stop') {
      const last = [...transcript].reverse().find((x) => x.type === 'tool_call' && x.status === 'running');
      if (last) {
        const item = { ...last, status: 'completed' };
        pushTranscript(transcript, item);
        emit(item);
      }
      return;
    }
    if (type === 'message_delta') {
      const usage = data.usage;
      if (typeof usage?.output_tokens === 'number') outputTokens = usage.output_tokens;
      return;
    }
    if (type === 'error') {
      const msg = data.error?.message || data.message || 'Claude stream error';
      const err = new Error(msg);
      err.code = 'claude_error';
      throw err;
    }
  };

  if (/text\/event-stream|stream/i.test(contentType) || stream) {
    await consumeUpstreamSse(res, (eventName, data) => {
      handleAnthropicEvent(eventName, data);
    });
  } else {
    const data = await res.json().catch(() => ({}));
    reply = Array.isArray(data.content)
      ? data.content
          .filter((c) => c?.type === 'text')
          .map((c) => c.text)
          .join('\n')
          .trim()
      : '';
    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block?.type === 'thinking' && typeof block.thinking === 'string') {
          pushTranscript(transcript, { type: 'thinking', text: block.thinking });
          emit({ type: 'thinking', text: block.thinking });
        } else if (block?.type === 'text' && typeof block.text === 'string') {
          pushTranscript(transcript, { type: 'assistant', text: block.text });
          emit({ type: 'assistant', text: block.text });
        }
      }
    }
    if (typeof data?.usage?.input_tokens === 'number') inputTokens = data.usage.input_tokens;
    if (typeof data?.usage?.output_tokens === 'number') outputTokens = data.usage.output_tokens;
  }

  const usageTokens =
    typeof inputTokens === 'number' && typeof outputTokens === 'number'
      ? inputTokens + outputTokens
      : typeof outputTokens === 'number'
        ? outputTokens
        : null;

  const finalReply = reply.trim() || '(No reply text returned.)';
  if (!transcript.some((t) => t.type === 'assistant')) {
    pushTranscript(transcript, { type: 'assistant', text: finalReply });
  }

  const execution = buildLatticeExecution({
    message,
    history,
    mode: 'claude',
    resumed: prior.length > 0,
    reply: finalReply,
    usageTokens,
  });

  return {
    reply: finalReply,
    transcript: transcript.length ? transcript : [{ type: 'assistant', text: finalReply }],
    model,
    mode: agentMode,
    lens: normalizeReasoningLens(reasoningLens),
    agentId: null,
    tokens: execution.tokens,
    execution,
    access: wrapProviderAccess(access),
    provider: 'claude',
  };
}

async function pollGeminiInteraction(apiKey, interactionId, { onStatus, maxPolls = 40 } = {}) {
  let finalInteraction = null;
  let status = '';
  for (let i = 0; i < maxPolls; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const poll = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions/${encodeURIComponent(interactionId)}`,
      { headers: { 'x-goog-api-key': apiKey } },
    );
    finalInteraction = await poll.json().catch(() => ({}));
    status = String(finalInteraction.status || '').toLowerCase();
    if (typeof onStatus === 'function') {
      onStatus({
        type: 'status',
        status: 'live',
        message: `Antigravity ${status || 'running'}… (${i + 1}/${maxPolls})`,
      });
    }
    if (!poll.ok) break;
    if (['completed', 'failed', 'cancelled'].includes(status)) break;
  }
  return finalInteraction;
}

function mapGeminiStreamEvent(data, state, emit, push) {
  if (!data || typeof data !== 'object') return;
  const eventType = String(data.event_type || data.type || data.event || '').toLowerCase();
  const step = data.step || data.delta || data;
  const stepType = String(step?.type || step?.step_type || data.step_type || '').toLowerCase();

  if (eventType.includes('created') || eventType === 'interaction.created') {
    const id = data.interaction?.id || data.id;
    const env = data.interaction?.environment_id || data.environment_id;
    if (id) state.interactionId = id;
    if (env) state.environmentId = env;
    emit({ type: 'status', status: 'live', message: 'Antigravity interaction created…' });
    return;
  }

  if (eventType.includes('status')) {
    const st = data.status || data.interaction?.status || '';
    if (st) emit({ type: 'status', status: 'live', message: `Antigravity ${st}…` });
    return;
  }

  // Thought / stream-of-thought
  if (
    stepType.includes('thought') ||
    eventType.includes('thought') ||
    data.thought_summary ||
    step?.thought_summary
  ) {
    const text =
      step?.delta?.content?.text ||
      step?.content?.text ||
      data.delta?.content?.text ||
      (typeof data.thought_summary === 'string' ? data.thought_summary : '') ||
      (typeof step?.thought_summary === 'string' ? step.thought_summary : '') ||
      (typeof step?.text === 'string' && stepType.includes('thought') ? step.text : '');
    if (text) {
      const item = { type: 'thinking', text };
      push(item);
      emit(item);
    } else if (eventType.includes('start') || stepType.includes('start')) {
      emit({ type: 'status', status: 'live', message: 'Stream of thought…' });
    }
    return;
  }

  // Tool / server function calls
  if (
    stepType.includes('tool') ||
    stepType.includes('function_call') ||
    stepType.includes('google_search') ||
    stepType.includes('code_execution') ||
    eventType.includes('tool')
  ) {
    const callId = String(step?.id || data.step_id || data.id || `gem_tool_${state.toolSeq++}`);
    const name = String(
      step?.name || step?.tool_name || stepType || data.name || 'tool',
    ).replace(/^step\./, '');
    const status =
      eventType.includes('stop') || eventType.includes('complete')
        ? 'completed'
        : eventType.includes('error')
          ? 'error'
          : 'running';
    const argsPreview =
      typeof step?.arguments === 'string'
        ? step.arguments.slice(0, 400)
        : step?.arguments
          ? summarizeUnknown(step.arguments, 400)
          : typeof step?.delta?.arguments === 'string'
            ? step.delta.arguments.slice(0, 400)
            : undefined;
    const item = { type: 'tool_call', callId, name, status, argsPreview };
    push(item);
    emit(item);
    return;
  }

  // Model text output
  if (
    stepType.includes('text') ||
    stepType.includes('model_output') ||
    eventType.includes('content') ||
    typeof data.delta?.content?.text === 'string' ||
    typeof step?.delta?.content?.text === 'string' ||
    typeof step?.text === 'string'
  ) {
    const text =
      data.delta?.content?.text ||
      step?.delta?.content?.text ||
      (typeof step?.text === 'string' && !stepType.includes('thought') ? step.text : '') ||
      (typeof data.text === 'string' ? data.text : '');
    if (text) {
      state.reply += text;
      const item = { type: 'assistant', text };
      push(item);
      emit(item);
    }
    return;
  }

  if (eventType.includes('completed') || eventType.includes('complete')) {
    const interaction = data.interaction || data;
    if (interaction?.id) state.interactionId = interaction.id;
    if (interaction?.environment_id) state.environmentId = interaction.environment_id;
    const usage = extractGeminiUsageTokens(interaction);
    if (usage != null) state.usageTokens = usage;
    const finalText = extractGeminiText(interaction);
    if (finalText && !state.reply.trim()) {
      state.reply = finalText;
      const item = { type: 'assistant', text: finalText };
      push(item);
      emit(item);
    }
    state.completed = true;
    state.finalInteraction = interaction;
  }

  if (eventType === 'error' || data.error) {
    const msg = data.error?.message || data.message || 'Gemini stream error';
    const err = new Error(msg);
    err.code = 'gemini_error';
    throw err;
  }
}

async function runGeminiTurn({
  apiKey,
  message,
  history,
  modelId,
  agentMode,
  access,
  agentId,
  recoverOnly,
  repoUrl,
  nestTopology,
  agentRoster,
  reasoningLens,
  stream = false,
  onEvent = null,
}) {
  const decoded = decodeGeminiAgentId(agentId);
  const agentName = modelId || 'antigravity-preview-05-2026';
  const prompt = decoded?.interactionId
    ? assembleResumePrompt(message, nestTopology, agentRoster)
    : buildPrompt(message, history, nestTopology, agentRoster, reasoningLens);
  const emit = (item) => {
    if (typeof onEvent === 'function' && item) onEvent(item);
  };

  if (recoverOnly && decoded?.interactionId) {
    emit({ type: 'status', status: 'live', message: 'Recovering Antigravity interaction…' });
    const getRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/interactions/${encodeURIComponent(decoded.interactionId)}`,
      { headers: { 'x-goog-api-key': apiKey } },
    );
    const interaction = await getRes.json().catch(() => ({}));
    if (!getRes.ok) {
      const err = new Error(interaction?.error?.message || `Gemini HTTP ${getRes.status}`);
      err.code = getRes.status === 401 || getRes.status === 403 ? 'gemini_auth' : 'gemini_error';
      throw err;
    }
    const status = String(interaction.status || '').toLowerCase();
    if (status && status !== 'completed' && status !== 'failed' && status !== 'cancelled') {
      const wait = new Error('Antigravity interaction still running');
      wait.code = 'agent_busy';
      wait.agentId = encodeGeminiAgentId(interaction.id, interaction.environment_id || decoded.environmentId);
      throw wait;
    }
    const reply = extractGeminiText(interaction) || '(No reply text returned.)';
    const usageTokens = extractGeminiUsageTokens(interaction);
    const execution = buildLatticeExecution({
      message: message || '(recovered run)',
      history,
      mode: 'gemini',
      resumed: true,
      reply,
      usageTokens,
    });
    emit({ type: 'assistant', text: reply });
    return {
      reply,
      transcript: [{ type: 'assistant', text: reply }],
      model: agentName,
      mode: agentMode,
      agentId: encodeGeminiAgentId(interaction.id, interaction.environment_id || decoded.environmentId),
      recovered: true,
      tokens: execution.tokens,
      execution,
      access: wrapProviderAccess(access),
      provider: 'gemini',
    };
  }

  const body = {
    agent: agentName,
    input: prompt,
    stream: true,
  };
  if (decoded?.interactionId && decoded?.environmentId) {
    body.previous_interaction_id = decoded.interactionId;
    body.environment = decoded.environmentId;
  } else {
    body.environment = 'remote';
    body.input = `${prompt}

Working tip: the public Lattice repo is ${repoUrl}. Clone it in the sandbox if you need file context.`;
  }

  emit({ type: 'status', status: 'live', message: 'Antigravity stream of thought opening…' });

  let res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
      accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  });

  // Some deployments reject stream:true — fall back to create + poll.
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = String(errBody?.error?.message || errBody?.message || '');
    if (/stream/i.test(msg) || res.status === 400) {
      emit({
        type: 'status',
        status: 'live',
        message: 'Stream flag unsupported — creating interaction and polling…',
      });
      delete body.stream;
      res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });
    } else {
      const err = new Error(msg || `Gemini HTTP ${res.status}`);
      err.code = res.status === 401 || res.status === 403 ? 'gemini_auth' : 'gemini_error';
      err.status = res.status;
      throw err;
    }
  }

  if (!res.ok) {
    const interaction = await res.json().catch(() => ({}));
    const err = new Error(interaction?.error?.message || interaction?.message || `Gemini HTTP ${res.status}`);
    err.code = res.status === 401 || res.status === 403 ? 'gemini_auth' : 'gemini_error';
    err.status = res.status;
    throw err;
  }

  const transcript = [];
  const state = {
    reply: '',
    interactionId: '',
    environmentId: '',
    usageTokens: null,
    completed: false,
    finalInteraction: null,
    toolSeq: 1,
  };
  const push = (item) => pushTranscript(transcript, item);
  const contentType = String(res.headers.get('content-type') || '');

  if (/text\/event-stream|stream/i.test(contentType) || stream) {
    await consumeUpstreamSse(res, (_eventName, data) => {
      mapGeminiStreamEvent(data, state, emit, push);
    });
  } else {
    const interaction = await res.json().catch(() => ({}));
    state.interactionId = interaction.id || '';
    state.environmentId = interaction.environment_id || '';
    state.finalInteraction = interaction;
    let status = String(interaction.status || '').toLowerCase();
    if (status && !['completed', 'failed', 'cancelled'].includes(status) && interaction.id) {
      state.finalInteraction = await pollGeminiInteraction(apiKey, interaction.id, {
        onStatus: emit,
      });
    }
    state.reply = extractGeminiText(state.finalInteraction) || '';
    state.usageTokens = extractGeminiUsageTokens(state.finalInteraction);
    if (state.reply) {
      push({ type: 'assistant', text: state.reply });
      emit({ type: 'assistant', text: state.reply });
    }
  }

  // If stream ended without completion, poll for the final result.
  if (
    !state.completed &&
    state.interactionId &&
    !(state.reply || '').trim()
  ) {
    emit({ type: 'status', status: 'live', message: 'Antigravity still working — polling for reply…' });
    state.finalInteraction = await pollGeminiInteraction(apiKey, state.interactionId, {
      onStatus: emit,
    });
    const polled = extractGeminiText(state.finalInteraction);
    if (polled) {
      state.reply = polled;
      push({ type: 'assistant', text: polled });
      emit({ type: 'assistant', text: polled });
    }
    const usage = extractGeminiUsageTokens(state.finalInteraction);
    if (usage != null) state.usageTokens = usage;
    if (state.finalInteraction?.environment_id) {
      state.environmentId = state.finalInteraction.environment_id;
    }
  }

  const finalReply = (state.reply || '').trim() || '(No reply text returned.)';
  if (!transcript.some((t) => t.type === 'assistant')) {
    push({ type: 'assistant', text: finalReply });
  }

  const nextAgentId = encodeGeminiAgentId(
    state.finalInteraction?.id || state.interactionId,
    state.finalInteraction?.environment_id || state.environmentId || '',
  );
  const execution = buildLatticeExecution({
    message,
    history,
    mode: 'gemini',
    resumed: Boolean(decoded?.interactionId),
    reply: finalReply,
    usageTokens: state.usageTokens,
  });

  return {
    reply: finalReply,
    transcript: transcript.length ? transcript : [{ type: 'assistant', text: finalReply }],
    model: agentName,
    mode: agentMode,
    lens: normalizeReasoningLens(reasoningLens),
    agentId: nextAgentId,
    tokens: execution.tokens,
    execution,
    access: wrapProviderAccess(access),
    provider: 'gemini',
  };
}


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

/** Stale agent id (often from a different Cursor key / prior session). */
function isAgentNotFoundError(err) {
  const msg = err instanceof Error ? err.message : String(err || '');
  const code = err && typeof err === 'object' ? String(err.code || '') : '';
  return (
    code === 'agent_not_found' ||
    /agent[_\s-]?not[_\s-]?found|\[agent_not_found\]/i.test(msg)
  );
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
    if (isAgentNotFoundError(err)) throw err;
    console.warn('[lattice-chat] listRuns');
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

  const collected = await collectRunTranscript(run, { timeoutMs: COLLECT_BUDGET_MS });
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

async function resolveCursorBalances({ apiKey, agentId, runId, resultUsage, balanceBefore }) {
  let balanceAfter = agentId ? await fetchAgentTokenBalance(apiKey, agentId) : null;
  if (
    balanceBefore != null &&
    balanceAfter != null &&
    balanceAfter <= balanceBefore
  ) {
    await new Promise((r) => setTimeout(r, 900));
    const retry = await fetchAgentTokenBalance(apiKey, agentId);
    if (typeof retry === 'number') balanceAfter = retry;
  }

  let usageTokens =
    typeof resultUsage?.totalTokens === 'number' && resultUsage.totalTokens > 0
      ? resultUsage.totalTokens
      : null;
  if (usageTokens == null && runId) {
    usageTokens = await fetchRunTokenUsage(apiKey, agentId, runId);
  }
  if (
    usageTokens == null &&
    balanceBefore != null &&
    balanceAfter != null &&
    balanceAfter > balanceBefore
  ) {
    usageTokens = balanceAfter - balanceBefore;
  }
  if (balanceBefore == null && typeof balanceAfter === 'number') {
    if (usageTokens != null) {
      return {
        balanceBefore: Math.max(0, balanceAfter - usageTokens),
        balanceAfter,
        usageTokens,
      };
    }
    // Do not invent balanceBefore: 0 — that falsely marks cumulative total as "used".
    return { balanceBefore: null, balanceAfter, usageTokens: null };
  }
  return {
    balanceBefore: balanceBefore ?? null,
    balanceAfter: balanceAfter ?? null,
    usageTokens,
  };
}

function respondLattice(res, stream, payload, status = 200) {
  if (stream) {
    if (status >= 400) {
      sseWrite(res, 'error', { ...payload, status });
      res.end();
      return;
    }
    sseWrite(res, 'done', payload);
    res.end();
    return;
  }
  return json(res, status, payload);
}

async function collectRunTranscript(run, opts = {}) {
  const transcript = [];
  let text = '';
  const onEvent = typeof opts.onEvent === 'function' ? opts.onEvent : null;
  const timeoutMs =
    typeof opts.timeoutMs === 'number' && opts.timeoutMs > 0
      ? opts.timeoutMs
      : COLLECT_BUDGET_MS;
  const deadline = Date.now() + timeoutMs;
  let timedOut = false;
  const emit = (item) => {
    if (!item) return;
    pushTranscript(transcript, item);
    if (onEvent) onEvent(item);
  };
  const budgetLeft = () => deadline - Date.now();
  const hitBudget = () => {
    if (Date.now() < deadline) return false;
    timedOut = true;
    return true;
  };

  if (run && typeof run.supports === 'function' && run.supports('stream') && typeof run.stream === 'function') {
    try {
      const iterator = run.stream()[Symbol.asyncIterator]();
      while (!hitBudget()) {
        const left = budgetLeft();
        const nextPromise = iterator.next();
        const raced = await Promise.race([
          nextPromise.then((v) => ({ kind: 'val', v })),
          new Promise((resolve) => {
            setTimeout(() => resolve({ kind: 'tick' }), Math.min(Math.max(left, 1), 12_000));
          }),
        ]);
        if (raced.kind === 'tick') {
          if (hitBudget()) break;
          continue;
        }
        const { done, value: event } = raced.v;
        if (done) break;
        if (!event || typeof event.type !== 'string') continue;
        if (event.type === 'assistant' && Array.isArray(event.message?.content)) {
          for (const block of event.message.content) {
            if (block?.type === 'text' && typeof block.text === 'string') {
              text += block.text;
              emit({ type: 'assistant', text: block.text });
            }
          }
        } else if (event.type === 'thinking' && typeof event.text === 'string') {
          emit({
            type: 'thinking',
            text: event.text,
            durationMs:
              typeof event.thinking_duration_ms === 'number' ? event.thinking_duration_ms : undefined,
          });
        } else if (event.type === 'tool_call') {
          emit({
            type: 'tool_call',
            callId: String(event.call_id || ''),
            name: String(event.name || 'tool'),
            status: String(event.status || 'running'),
            argsPreview: summarizeUnknown(event.args),
            resultPreview: summarizeUnknown(event.result),
          });
        } else if (event.type === 'status') {
          emit({
            type: 'status',
            status: String(event.status || ''),
            message: typeof event.message === 'string' ? event.message : undefined,
          });
        } else if (event.type === 'task') {
          emit({
            type: 'task',
            status: typeof event.status === 'string' ? event.status : undefined,
            text: typeof event.text === 'string' ? event.text : undefined,
          });
        } else if (event.type === 'usage' && event.usage) {
          emit({
            type: 'status',
            status: 'usage',
            message: `Turn usage · ${Number(event.usage.totalTokens || 0).toLocaleString()} tokens`,
          });
        }
      }
      try {
        if (typeof iterator.return === 'function') await iterator.return();
      } catch {
        /* ignore iterator cleanup */
      }
    } catch (err) {
      console.warn('[lattice-chat] stream read', err);
    }
  }

  let result = null;
  if (!timedOut && run && typeof run.wait === 'function') {
    const waitMs = Math.max(5_000, budgetLeft());
    try {
      result = await withTimeout(run.wait(), waitMs, 'run.wait');
    } catch (err) {
      if (err && err.code === 'timeout') {
        timedOut = true;
        console.warn('[lattice-chat] run.wait budget hit', `${Math.round(waitMs / 1000)}s`);
      } else {
        throw err;
      }
    }
  }

  if (!text.trim()) text = extractAssistantText(result);
  if (text.trim() && !transcript.some((i) => i.type === 'assistant' && String(i.text || '').trim())) {
    emit({ type: 'assistant', text: text.trim() });
  }

  if (timedOut) {
    console.warn(
      '[lattice-chat] collectRunTranscript budget hit',
      `${Math.round(timeoutMs / 1000)}s`,
      'partialChars=',
      text.length,
    );
  }

  return {
    text: text.trim(),
    transcript,
    result,
    runId: result?.id ?? run?.id ?? null,
    timedOut,
  };
}

function normalizeAgentMode(raw) {
  const m = String(raw || '')
    .trim()
    .toLowerCase();
  return m === 'plan' ? 'plan' : 'agent';
}

/** Auto-pick plan mode for complex map/architect asks (agent mode tool-tours burn tokens). */
function resolveAgentMode(rawMode, message) {
  const explicit = normalizeAgentMode(rawMode);
  if (explicit === 'plan') return 'plan';
  const m = String(message || '').toLowerCase();
  const wantsImplement = /implement|edit|fix|patch|commit|pr\b|pull request|write code|apply/.test(m);
  if (wantsImplement) return 'agent';
  const intent = classifyAsk(message);
  const wantsPlan =
    intent.complex &&
    /plan|map|outline|architect|design|how (should|would|do)|nested|multi-?band|strategy/.test(m);
  return wantsPlan ? 'plan' : explicit;
}

function isSing13RepoUrl(url) {
  return SING13_REPO_HOST_RE.test(String(url || '').trim());
}

/**
 * All seats attach SING13 (same working product workspace).
 * Guests: full agent + honor prompt. Creators: full agent.
 */
function resolveCursorCloudAttach(access, creatorRepoUrl, startingRef) {
  const isGuest = access?.privilege !== 'creator';
  return {
    repos: [{ url: creatorRepoUrl, startingRef }],
    guestSession: isGuest,
    noRepo: false,
    forcePlan: false,
    workspace: creatorRepoUrl,
    allowAgentMode: true,
    sing13Write: true,
  };
}

function withGuestHonorGuard(prompt, guestSession) {
  if (!guestSession) return prompt;
  return `${GUEST_SING13_HONOR_DIRECTIVE}\n\n${prompt}`;
}

function isBranchVerifyError(err) {
  const msg = err instanceof Error ? err.message : String(err || '');
  return /verify existence of branch|default branch|repository access|GitHub App|cursor github|not in cursor|failed to (clone|access).*repo/i.test(
    msg,
  );
}

/** Cloud create opts — SING13 repos for everyone (no empty-VM guest fork). */
function buildCursorCloudOpts(cloudAttach, cursorRepos) {
  if (cloudAttach?.noRepo) {
    return { env: { type: 'cloud' } };
  }
  return { repos: cursorRepos };
}

async function createCursorCloudAgent(
  Agent,
  { apiKey, modelSelection, agentMode, cloudAttach, cursorRepos, timeoutMs },
) {
  const cloud = buildCursorCloudOpts(cloudAttach, cursorRepos);
  try {
    return await withTimeout(
      Agent.create({
        apiKey,
        model: modelSelection,
        mode: agentMode,
        cloud,
      }),
      timeoutMs,
      'Agent.create',
    );
  } catch (err) {
    if (cloudAttach?.noRepo || !isBranchVerifyError(err)) throw err;
    const first = cursorRepos?.[0];
    if (!first?.url || !first?.startingRef) throw err;
    const alt =
      first.startingRef === 'main'
        ? 'master'
        : first.startingRef === 'master'
          ? 'main'
          : null;
    if (!alt) throw err;
    return await withTimeout(
      Agent.create({
        apiKey,
        model: modelSelection,
        mode: agentMode,
        cloud: { repos: [{ url: first.url, startingRef: alt }] },
      }),
      timeoutMs,
      'Agent.create',
    );
  }
}

/** Soft probe — SING13 is shared; honor rail is prompt-side for guests. */
function assertCursorMayWriteSing13(access, repoUrl) {
  if (!isSing13RepoUrl(repoUrl)) return { ok: true };
  if (access?.ok) return { ok: true };
  return {
    ok: false,
    code: 'sing13_write_locked',
    error: 'Lattice access required before attaching SING13.',
  };
}

function normalizeModelId(raw) {
  const id = String(raw || '')
    .trim();
  return id || (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim() || 'composer-2.5';
}

/** Catalog when Cursor.models.list is empty/unavailable. */
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

/** Live Cursor list wins on overlap; fallback fills gaps. */
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
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-lattice-email, x-cursor-api-key');
      return json(res, 204, {});
    }

    try {
      await loadLatticePromptLib();
    } catch (libErr) {
      console.error('[lattice-chat] prompt lib load failed', libErr);
      return json(res, 503, {
        error: 'Lattice prompt engine failed to load on the server. Redeploy or check lib/lattice-prompt.mjs.',
        code: 'prompt_lib_load_failed',
        detail: libErr instanceof Error ? libErr.message : String(libErr),
      });
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
        const writeGate = assertCursorMayWriteSing13(access, DEFAULT_REPO);
        if (!writeGate.ok) {
          return json(res, 200, {
            ok: false,
            chatAllowed: false,
            writeAllowed: false,
            error: writeGate.error,
            code: writeGate.code,
            privilege: access.privilege,
            targetRepo: DEFAULT_REPO,
            note: 'All seats attach SING13 once access is granted.',
          });
        }
        const { key: apiKey, source: keySource } = resolveCursorApiKey(req);
        if (!apiKey) {
          return json(res, 401, {
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
            sample: urls.slice(0, 12),
            note:
              matched.length > 0
                ? 'Your Cursor API key can see this repo via Cursor GitHub integration.'
                : 'Your Cursor API key works, but this repo is not in Cursor.repositories.list. Connect GitHub for that Cursor account and grant FractiAI/psw.vibelandia.sing13.',
          });
        } catch (err) {
          console.warn('[lattice-chat] repositories.list failed');
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
        const provider = resolveProvider(req, {
          provider: url?.searchParams.get('provider') || req.query?.provider,
        });
        if (provider === 'claude') {
          return json(res, 200, { models: CLAUDE_MODELS, source: 'claude-catalog', provider });
        }
        if (provider === 'gemini') {
          return json(res, 200, { models: GEMINI_MODELS, source: 'gemini-catalog', provider });
        }
        const { key: apiKey } = resolveCursorApiKey(req);
        if (!apiKey) {
          return json(res, 401, {
            error: MISSING_KEY_ERROR,
            code: 'missing_cursor_api_key',
            models: FALLBACK_MODELS,
          });
        }
        try {
          const { Cursor } = await import('@cursor/sdk');
          const listed = await Cursor.models.list({ apiKey });
          const live = asModelList(listed).map(mapCursorModel).filter(Boolean);
          return json(res, 200, {
            models: mergeModelCatalog(live),
            source: live.length ? 'cursor+catalog' : 'fallback',
            liveCount: live.length,
            provider: 'cursor',
          });
        } catch {
          console.warn('[lattice-chat] models.list failed');
          return json(res, 200, { models: FALLBACK_MODELS, source: 'fallback', provider: 'cursor' });
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

    const provider = resolveProvider(req, body);
    const apiKey = resolveProviderApiKey(req, provider);
    if (!apiKey) {
      return json(res, 401, {
        error: MISSING_KEY_ERROR,
        code: 'missing_provider_api_key',
        provider,
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
    const startingRefEarly = (process.env.LATTICE_STARTING_REF || 'main').trim() || 'main';
    const cloudAttach =
      provider === 'cursor'
        ? resolveCursorCloudAttach(access, repoUrl, startingRefEarly)
        : null;
    if (cloudAttach?.workspace) {
      repoUrl = cloudAttach.workspace;
    }
    const modelId =
      provider === 'cursor'
        ? normalizeModelId(body.model || body.modelId)
        : String(body.model || body.modelId || '').trim() ||
          (provider === 'claude' ? 'claude-sonnet-4-5' : 'antigravity-preview-05-2026');
    let agentMode = resolveAgentMode(body.mode || body.agentMode, message);
    if (cloudAttach?.forcePlan) {
      agentMode = 'plan';
    }
    const nestTopology = normalizeNestTopology(body.nestTopology || body.nest);
    const reasoningLens = normalizeReasoningLens(body.reasoningLens || body.lens);
    const agentRoster = typeof body.agentRoster === 'string' ? body.agentRoster : '';
    let agentId =
      typeof body.agentId === 'string' && body.agentId.trim() ? body.agentId.trim() : null;

    if (provider === 'claude') {
      const stream = wantsStream(req, body);
      if (stream) initSse(res);
      const stopHeartbeat = stream ? startSseHeartbeat(res) : () => {};
      try {
        if (recoverOnly && !message) {
          return respondLattice(
            res,
            stream,
            {
              error: 'Claude (Messages API) has no cloud run to recover — resend the prompt.',
              code: 'nothing_to_recover',
              provider,
            },
            409,
          );
        }
        if (stream) {
          sseWrite(res, 'status', { message: 'Starting Claude stream of thought…' });
        }
        const out = await runClaudeTurn({
          apiKey,
          message,
          history: body.history,
          modelId,
          agentMode,
          access,
          nestTopology,
          reasoningLens,
          agentRoster,
          stream,
          onEvent: stream
            ? (item) => {
                sseWrite(res, 'transcript', item);
              }
            : null,
        });
        return respondLattice(res, stream, out);
      } catch (err) {
        const code = err?.code || 'claude_error';
        const status = code === 'claude_auth' ? 401 : 502;
        return respondLattice(
          res,
          stream,
          {
            error: err instanceof Error ? err.message : String(err),
            code,
            provider,
          },
          status,
        );
      } finally {
        stopHeartbeat();
      }
    }

    if (provider === 'gemini') {
      const stream = wantsStream(req, body);
      if (stream) initSse(res);
      const stopHeartbeat = stream ? startSseHeartbeat(res) : () => {};
      try {
        if (stream) {
          sseWrite(res, 'status', { message: 'Starting Antigravity stream of thought…' });
        }
        const out = await runGeminiTurn({
          apiKey,
          message,
          history: body.history,
          modelId,
          agentMode,
          access,
          agentId,
          recoverOnly,
          repoUrl,
          nestTopology,
          reasoningLens,
          agentRoster,
          stream,
          onEvent: stream
            ? (item) => {
                sseWrite(res, 'transcript', item);
                if (item?.type === 'status' && /created|interaction/i.test(item.message || '')) {
                  /* agent id arrives in final payload */
                }
              }
            : null,
        });
        if (stream && out.agentId) {
          sseWrite(res, 'agent', { agentId: out.agentId });
        }
        return respondLattice(res, stream, out);
      } catch (err) {
        if (err?.code === 'agent_busy') {
          return respondLattice(
            res,
            stream,
            {
              error: err.message || 'Antigravity still running',
              code: 'agent_busy',
              agentId: err.agentId || agentId,
              provider,
            },
            409,
          );
        }
        const code = err?.code || 'gemini_error';
        const status = code === 'gemini_auth' ? 401 : 502;
        return respondLattice(
          res,
          stream,
          {
            error: err instanceof Error ? err.message : String(err),
            code,
            provider,
          },
          status,
        );
      } finally {
        stopHeartbeat();
      }
    }

    // --- Cursor cloud path (default) ---
    const startingRef =
      cloudAttach?.repos?.[0]?.startingRef ||
      (process.env.LATTICE_STARTING_REF || 'main').trim() ||
      'main';
    const cursorRepos = cloudAttach?.repos?.length
      ? cloudAttach.repos
      : [{ url: repoUrl, startingRef }];
    const guestSession = Boolean(cloudAttach?.guestSession);
    const stream = wantsStream(req, body);
    if (stream) initSse(res);
    const stopHeartbeat = stream ? startSseHeartbeat(res) : () => {};

    let agent;
    let completedOk = false;
    try {
      if (stream) {
        sseWrite(res, 'status', {
          message: recoverOnly
            ? 'Attaching to your cloud run…'
            : 'Opening Lattice pipe — loading Cursor SDK…',
        });
      }

      let Agent;
      try {
        ({ Agent } = await import('@cursor/sdk'));
      } catch (sdkErr) {
        console.error('[lattice-chat] SDK import failed', sdkErr);
        return respondLattice(
          res,
          stream,
          {
            error:
              'Cursor SDK failed to load on the server. Confirm Node 22+ and @cursor/sdk are installed, then redeploy.',
            code: 'sdk_import_failed',
            detail: sdkErr instanceof Error ? sdkErr.message : String(sdkErr),
          },
          503,
        );
      }

      let resumedOk = false;
      if (agentId && !String(agentId).startsWith('gma:')) {
        try {
          if (stream) {
            sseWrite(res, 'status', { message: 'Resuming your cloud agent…' });
          }
          agent = await withTimeout(
            Agent.resume(agentId, { apiKey }),
            15_000,
            'Agent.resume',
          );
          resumedOk = Boolean(agent);
        } catch (resumeErr) {
          console.warn(
            '[lattice-chat] resume failed/timed out, creating new agent',
            resumeErr?.code || resumeErr?.message || resumeErr,
          );
          agentId = null;
          agent = null;
          resumedOk = false;
          if (stream) {
            sseWrite(res, 'status', {
              message: 'Prior agent unavailable — starting a fresh cloud agent…',
            });
          }
        }
      } else if (agentId && String(agentId).startsWith('gma:')) {
        agentId = null;
      }

      const modelSelection = { id: modelId };
      const onStreamItem = (item) => {
        if (stream) sseWrite(res, 'transcript', item);
      };

      // Tab-blur / reconnect: attach to the in-flight or latest cloud run and return it.
      if (recoverOnly && agent) {
        try {
          if (stream) {
            sseWrite(res, 'status', { message: 'Recovering active cloud run…', agentId: agent.agentId ?? agentId });
          }
          const recovered = await recoverCloudRun(Agent, agent.agentId ?? agentId, apiKey);
          if (recovered?.timedOut) {
            if (stream && Array.isArray(recovered.transcript)) {
              for (const item of recovered.transcript) onStreamItem(item);
            }
            if (stream) {
              sseWrite(res, 'status', {
                message: 'Cloud run still working past the pipe budget — attaching again shortly…',
              });
            }
            return respondLattice(
              res,
              stream,
              {
                error:
                  'Cloud agent still running — keep this tab open. Lattice will attach again automatically.',
                code: 'still_running',
                agentId: agent.agentId ?? agentId,
                runId: recovered.runId ?? null,
                transcript: recovered.transcript || [],
                reply: recovered.text || '',
              },
              409,
            );
          }
          if (recovered && (recovered.text?.trim() || recovered.transcript?.length)) {
            const reply = recovered.text || extractAssistantText(recovered.result) || '';
            if (stream && Array.isArray(recovered.transcript)) {
              for (const item of recovered.transcript) onStreamItem(item);
            }
            const clientBalanceBefore =
              typeof body.balanceBefore === 'number' && Number.isFinite(body.balanceBefore)
                ? body.balanceBefore
                : null;
            const balances = await resolveCursorBalances({
              apiKey,
              agentId: agent.agentId ?? agentId,
              runId: recovered.runId,
              resultUsage: recovered.result?.usage,
              balanceBefore: clientBalanceBefore,
            });
            const execution = buildLatticeExecution({
              message: message || '(recovered run)',
              history: body.history,
              mode: 'cloud',
              resumed: true,
              reply,
              runId: recovered.runId,
              agentId: agent.agentId ?? agentId,
              usageTokens: balances.usageTokens,
              balanceBefore: balances.balanceBefore,
              balanceAfter: balances.balanceAfter,
            });
            completedOk = true;
            return respondLattice(res, stream, {
              reply,
              transcript: recovered.transcript || [],
              model: modelId,
              mode: agentMode,
              lens: reasoningLens,
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
        } catch (recoverErr) {
          if (isAgentNotFoundError(recoverErr)) {
            return respondLattice(
              res,
              stream,
              {
                error:
                  'That cloud agent is gone (often after switching Cursor API keys). Start a new message — Lattice will create a fresh agent.',
                code: 'agent_not_found',
                clearAgent: true,
                agentId: null,
              },
              422,
            );
          }
          throw recoverErr;
        }
        if (!message) {
          return respondLattice(
            res,
            stream,
            {
              error: 'No active or finished run to recover yet. Wait a moment and retry.',
              code: 'nothing_to_recover',
              agentId: agent.agentId ?? agentId,
            },
            409,
          );
        }
      }

      if (!agent) {
        // Everyone: SING13 cloud agent. Guests get honor prompt; creators full write.
        const createTimeoutMs = 120_000;
        if (stream) {
          sseWrite(res, 'status', {
            message: 'Creating Lattice cloud agent (repo spin-up can take a minute)…',
          });
        }
        try {
          agent = await createCursorCloudAgent(Agent, {
            apiKey,
            modelSelection,
            agentMode,
            cloudAttach,
            cursorRepos,
            timeoutMs: createTimeoutMs,
          });
        } catch (createErr) {
          if (createErr?.code === 'timeout') {
            return respondLattice(
              res,
              stream,
              {
                error:
                  'Cloud agent creation timed out after 120s. Check Cursor GitHub access for FractiAI/psw.vibelandia.sing13, then send again — or switch to Claude / Gemini.',
                code: 'agent_create_timeout',
                repoUrl: repoUrl || null,
                startingRef: startingRef || null,
                clearAgent: true,
              },
              504,
            );
          }
          if (isBranchVerifyError(createErr)) {
            return respondLattice(
              res,
              stream,
              {
                error: `${createErr instanceof Error ? createErr.message : String(createErr)} Lattice uses ${repoUrl} @ ${startingRef}. Connect GitHub for this Cursor API key and ensure FractiAI/psw.vibelandia.sing13 is visible, or switch to Claude / Gemini.`,
                code: 'cursor_github_access',
                repoUrl: repoUrl || null,
                startingRef: startingRef || null,
                clearAgent: true,
                guestSession,
              },
              422,
            );
          }
          throw createErr;
        }
        agentId = agent.agentId ?? null;
        resumedOk = false;
      }

      if (stream && (agent.agentId || agentId)) {
        sseWrite(res, 'agent', { agentId: agent.agentId ?? agentId });
      }

      const balanceBefore = await fetchAgentTokenBalance(apiKey, agent.agentId ?? agentId);
      if (stream && balanceBefore != null) {
        sseWrite(res, 'balance', { balanceBefore, phase: 'before' });
      }
      if (stream) {
        sseWrite(res, 'status', {
          message: 'Stream of thought live — follow tools and reasoning below…',
          balanceBefore,
        });
      }

      const prompt = withGuestHonorGuard(
        resumedOk && message
          ? assembleResumePrompt(message, nestTopology, agentRoster)
          : buildPrompt(message, body.history, nestTopology, agentRoster, reasoningLens),
        guestSession,
      );
      const sendOpts = {
        model: modelSelection,
        mode: agentMode,
      };

      let run;
      let recovered;
      try {
        ({ run, recovered } = await sendPromptHandlingBusy(
          Agent,
          agent,
          prompt,
          sendOpts,
          apiKey,
        ));
      } catch (sendErr) {
        // BYOK: stale agent ids / old Hello-World branch locks must not 500-loop the client.
        if (isAgentNotFoundError(sendErr) || isBranchVerifyError(sendErr)) {
          console.warn(
            '[lattice-chat] stale/branch-locked agent — recreating under current edge key',
            sendErr instanceof Error ? sendErr.message : sendErr,
          );
          agentId = null;
          try {
            await disposeAgent(agent);
          } catch {
            /* ignore */
          }
          agent = await createCursorCloudAgent(Agent, {
            apiKey,
            modelSelection,
            agentMode,
            cloudAttach,
            cursorRepos,
            timeoutMs: 120_000,
          });
          agentId = agent.agentId ?? null;
          resumedOk = false;
          if (stream) sseWrite(res, 'agent', { agentId });
          ({ run, recovered } = await sendPromptHandlingBusy(
            Agent,
            agent,
            withGuestHonorGuard(
              buildPrompt(message, body.history, nestTopology, agentRoster, reasoningLens),
              guestSession,
            ),
            sendOpts,
            apiKey,
          ));
        } else {
          throw sendErr;
        }
      }

      const packed = recovered
        ? recovered
        : await collectRunTranscript(run, {
            onEvent: onStreamItem,
            timeoutMs: COLLECT_BUDGET_MS,
          });
      if (recovered && stream && Array.isArray(recovered.transcript)) {
        for (const item of recovered.transcript) onStreamItem(item);
      }
      if (packed?.timedOut) {
        if (stream) {
          sseWrite(res, 'status', {
            message: 'Cloud run still working past the pipe budget — attaching again shortly…',
          });
        }
        return respondLattice(
          res,
          stream,
          {
            error:
              'Cloud agent still running — keep this tab open. Lattice will attach again automatically.',
            code: 'still_running',
            agentId: agent.agentId ?? agentId,
            runId: packed.runId ?? null,
            transcript: packed.transcript || [],
            reply: packed.text || '',
            model: modelId,
            mode: agentMode,
            lens: reasoningLens,
          },
          409,
        );
      }
      const { text, transcript, result, runId } = packed;

      if (result?.status === 'error') {
        return respondLattice(
          res,
          stream,
          {
            error: result?.error?.message || 'Agent run failed',
            runId,
            agentId: agent.agentId ?? agentId,
            transcript,
            model: modelId,
            mode: agentMode,
            lens: reasoningLens,
          },
          502,
        );
      }

      const reply = text || extractAssistantText(result);
      if (!reply && !(transcript && transcript.length)) {
        return respondLattice(
          res,
          stream,
          {
            error: 'Agent finished without reply text',
            runId,
            agentId: agent.agentId ?? agentId,
            transcript,
            model: modelId,
            mode: agentMode,
            lens: reasoningLens,
          },
          502,
        );
      }

      const balances = await resolveCursorBalances({
        apiKey,
        agentId: agent.agentId ?? agentId,
        runId,
        resultUsage: result?.usage,
        balanceBefore,
      });
      if (stream && balances.balanceAfter != null) {
        sseWrite(res, 'balance', {
          balanceBefore: balances.balanceBefore,
          balanceAfter: balances.balanceAfter,
          phase: 'after',
        });
      }

      const execution = buildLatticeExecution({
        message: message || '(recovered run)',
        history: body.history,
        mode: 'cloud',
        resumed: Boolean(resumedOk),
        reply: reply || '',
        runId,
        agentId: agent.agentId ?? agentId,
        usageTokens: balances.usageTokens,
        balanceBefore: balances.balanceBefore,
        balanceAfter: balances.balanceAfter,
      });

      completedOk = true;
      return respondLattice(res, stream, {
        reply: reply || '',
        transcript,
        model: modelId,
        mode: agentMode,
        lens: reasoningLens,
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
          guestSession,
          allowAgentMode: Boolean(cloudAttach?.allowAgentMode ?? true),
          workspace: repoUrl,
        },
      });
    } catch (err) {
      console.error('[lattice-chat]', err);
      const msg = err instanceof Error ? err.message : 'Lattice agent failed';
      if (isBusyError(err)) {
        return respondLattice(
          res,
          stream,
          {
            error:
              'Agent still has an active run. Lattice will recover it — wait a few seconds and retry, or stay on this tab until Working finishes.',
            code: 'agent_busy',
            agentId: agent?.agentId ?? agentId,
          },
          409,
        );
      }

      // Expected config/access failures — do not count as 500s (clients must stop retry storms).
      if (/unauthorized|invalid.?api.?key|api key.*(invalid|missing)|401\b/i.test(msg)) {
        return respondLattice(
          res,
          stream,
          {
            error: msg,
            code: 'cursor_auth',
            agentId: agent?.agentId ?? agentId,
          },
          401,
        );
      }
      const branchFail =
        /default branch|verify existence of branch|repository access|GitHub App|cursor github|not in cursor|failed to (clone|access).*repo|repositories?/i.test(
          msg,
        );
      if (branchFail) {
        return respondLattice(
          res,
          stream,
          {
            error: `${msg} Lattice uses ${repoUrl} @ ${startingRef}. Connect GitHub for this Cursor API key and ensure FractiAI/psw.vibelandia.sing13 is visible (cursor.com/dashboard/integrations), or switch to Claude / Gemini.`,
            code: 'cursor_github_access',
            repoUrl: repoUrl || null,
            startingRef: startingRef || null,
            agentId: agent?.agentId ?? agentId,
            guestSession,
            clearAgent: true,
          },
          422,
        );
      }
      if (/unknown model|invalid model|model .+ not (found|available)|unsupported model/i.test(msg)) {
        return respondLattice(
          res,
          stream,
          {
            error: msg,
            code: 'invalid_model',
            model: modelId,
            agentId: agent?.agentId ?? agentId,
          },
          422,
        );
      }
      if (isAgentNotFoundError(err)) {
        return respondLattice(
          res,
          stream,
          {
            error:
              'That cloud agent is gone (often after switching Cursor API keys). Send again — Lattice will start a fresh agent.',
            code: 'agent_not_found',
            clearAgent: true,
            agentId: null,
          },
          422,
        );
      }

      return respondLattice(
        res,
        stream,
        {
          error: msg,
          code: 'agent_error',
          agentId: agent?.agentId ?? agentId,
        },
        500,
      );
    } finally {
      stopHeartbeat();
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
