/**
 * Lattice V1.618 chat — Cursor SDK cloud agent (server-side CURSOR_API_KEY).
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
      method: 'Estimate chars÷4 · Lattice vs naive corpus dump',
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

async function collectRunText(run) {
  let text = '';
  if (run && typeof run.supports === 'function' && run.supports('stream') && typeof run.stream === 'function') {
    try {
      for await (const event of run.stream()) {
        if (event?.type === 'assistant' && Array.isArray(event.message?.content)) {
          for (const block of event.message.content) {
            if (block?.type === 'text' && typeof block.text === 'string') text += block.text;
          }
        }
      }
    } catch (err) {
      console.warn('[lattice-chat] stream read', err);
    }
  }
  const result = run && typeof run.wait === 'function' ? await run.wait() : null;
  if (!text.trim()) text = extractAssistantText(result);
  return { text: text.trim(), result, runId: result?.id ?? run?.id };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-lattice-email');
      return json(res, 204, {});
    }

    if (req.method === 'GET') {
      const q = typeof req.query?.email === 'string' ? req.query.email : '';
      let urlEmail = q;
      if (!urlEmail) {
        try {
          urlEmail = new URL(req.url || '', 'http://localhost').searchParams.get('email') || '';
        } catch {
          urlEmail = '';
        }
      }
      const access = checkLatticeEmailAccess(urlEmail);
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

    const apiKey = (process.env.CURSOR_API_KEY || '').trim();
    if (!apiKey) {
      return json(res, 503, {
        error:
          'CURSOR_API_KEY is not set on the server. Add it in Vercel → Settings → Environment Variables, then redeploy.',
        code: 'missing_cursor_api_key',
      });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return json(res, 400, { error: 'message is required' });
    }

    // Guard common typo (cing13) and empty overrides from Vercel env.
    let repoUrl = (process.env.LATTICE_REPO_URL || DEFAULT_REPO).trim() || DEFAULT_REPO;
    if (/psw\.vibelandia\.cing13/i.test(repoUrl)) {
      console.warn('[lattice-chat] correcting LATTICE_REPO_URL typo cing13 → sing13');
      repoUrl = repoUrl.replace(/psw\.vibelandia\.cing13/gi, 'psw.vibelandia.sing13');
    }
    const modelId = (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim();
    const startingRef = (process.env.LATTICE_STARTING_REF || 'main').trim() || 'main';
    let agentId =
      typeof body.agentId === 'string' && body.agentId.trim() ? body.agentId.trim() : null;

    let agent;
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

      if (!agent) {
        agent = await Agent.create({
          apiKey,
          model: { id: modelId },
          cloud: {
            repos: [{ url: repoUrl, startingRef }],
          },
        });
      }

      const prompt = agentId ? message : buildPrompt(message, body.history);
      const run = await agent.send(prompt);
      const { text, result, runId } = await collectRunText(run);

      if (result?.status === 'error') {
        return json(res, 502, {
          error: result?.error?.message || 'Agent run failed',
          runId,
          agentId: agent.agentId ?? agentId,
        });
      }

      const reply = text || extractAssistantText(result);
      if (!reply) {
        return json(res, 502, {
          error: 'Agent finished without reply text',
          runId,
          agentId: agent.agentId ?? agentId,
        });
      }

      const usageTokens =
        typeof result?.usage?.totalTokens === 'number'
          ? result.usage.totalTokens
          : null;

      const execution = buildLatticeExecution({
        message,
        history: body.history,
        mode: 'cloud',
        resumed: Boolean(agentId),
        reply,
        runId,
        agentId: agent.agentId ?? agentId,
        usageTokens,
      });

      return json(res, 200, {
        reply,
        runId,
        agentId: agent.agentId ?? agentId,
        threadId: body.threadId ?? null,
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
      const branchFail = /default branch|verify existence of branch|repository/i.test(msg);
      const hint = branchFail
        ? ` Lattice uses ${repoUrl} @ ${startingRef}. Branch main exists on GitHub; this usually means the Cursor account for CURSOR_API_KEY lacks GitHub App access to FractiAI/psw.vibelandia.sing13 (cursor.com → Integrations → GitHub → grant the FractiAI org/repo), or a transient Cursor/GitHub token glitch — retry after reconnecting GitHub.`
        : '';
      return json(res, 500, {
        error: msg + hint,
        code: 'agent_error',
        repoUrl: branchFail ? repoUrl : undefined,
        startingRef: branchFail ? startingRef : undefined,
      });
    } finally {
      await disposeAgent(agent);
    }
  } catch (outer) {
    console.error('[lattice-chat] outer', outer);
    return json(res, 500, {
      error: outer instanceof Error ? outer.message : 'Lattice API failed',
      code: 'outer_error',
    });
  }
}
