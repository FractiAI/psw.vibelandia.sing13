/**
 * Lattice V1.618 chat — Cursor SDK cloud agent (server-side CURSOR_API_KEY).
 * POST { threadId?, message, history?, agentId?, email? }
 * Access: old-school email allowlist (header x-lattice-email or body.email).
 * Creator valetpru@gmail.com = permanent. Guests = one month from grant. No passwords.
 */
import { buildLatticeExecution } from '../lib/lattice-engine.mjs';
import { checkLatticeEmailAccess, CREATOR_EMAIL } from '../lib/lattice-access.mjs';

export const config = {
  maxDuration: 300,
};

const DEFAULT_REPO = 'https://github.com/FractiAI/psw.vibelandia.sing13';
const CONTACT_EMAIL = CREATOR_EMAIL;

const PREAMBLE = `You are Lattice V1.618 by FractiAI — the Nested Agent Lattice chat surface over SING13.
Ground answers in docs/, protocols/, research/, and nested-agent / NSPFRNP rules when relevant.
Prefer precise, corpus-faithful replies. Do not invent repo paths or protocols.
Organize your reply with brief self-talk (Metabolize → Crystallize → Animate → Squeeze) so the lattice engine is tangible, then the user-facing answer.
Mention that Lattice saves tokens by RAG pointers + nested scale bands instead of dumping the corpus.
Close substantive answers with → ∞¹³.
You are answering a chat user; return a clear text reply (not a PR or code edit unless asked).`;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readEmail(req, body) {
  const h = req.headers || {};
  const raw = h['x-lattice-email'] || h['X-Lattice-Email'] || body?.email || '';
  return String(Array.isArray(raw) ? raw[0] : raw).trim();
}

function readBody(req) {
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
  const prior = Array.isArray(history) ? history.slice(-16) : [];
  const lines = prior
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content).trim()}`)
    .filter((line) => line.length > 8);

  const transcript = lines.length
    ? `Conversation so far:\n${lines.join('\n\n')}\n\n`
    : '';

  return `${PREAMBLE}

${transcript}Latest user message:
${String(message || '').trim()}

Respond as Lattice with a helpful chat reply.`;
}

function extractAssistantText(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (typeof result.result === 'string') return result.result;
  if (result.result && typeof result.result === 'object') {
    const r = result.result;
    if (typeof r.text === 'string') return r.text;
    if (typeof r.message === 'string') return r.message;
    if (Array.isArray(r.content)) {
      return r.content
        .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text)
        .join('');
    }
  }
  if (typeof result.text === 'string') return result.text;
  return '';
}

async function disposeAgent(agent) {
  if (!agent) return;
  try {
    if (typeof agent[Symbol.asyncDispose] === 'function') {
      await agent[Symbol.asyncDispose]();
    } else if (typeof agent.close === 'function') {
      await agent.close();
    }
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
            if (block?.type === 'text' && typeof block.text === 'string') {
              text += block.text;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[lattice-chat] stream read', err);
    }
  }
  const result = run && typeof run.wait === 'function' ? await run.wait() : null;
  if (!text.trim()) {
    text = (typeof result?.result === 'string' ? result.result : '') || extractAssistantText(result);
  }
  return { text: text.trim(), result, runId: result?.id ?? run?.id };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, x-lattice-email',
    );
    return json(res, 204, {});
  }

  // Lightweight access probe: GET /api/lattice-chat?email=
  if (req.method === 'GET') {
    const q = typeof req.query?.email === 'string' ? req.query.email : '';
    const urlEmail =
      q ||
      (() => {
        try {
          return new URL(req.url || '', 'http://localhost').searchParams.get('email') || '';
        } catch {
          return '';
        }
      })();
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
      email: CONTACT_EMAIL,
      privilege: access.privilege,
      expiresAt: access.expiresAt,
    });
  }

  const apiKey = (process.env.CURSOR_API_KEY || '').trim();
  if (!apiKey) {
    return json(res, 503, {
      error: `Cloud agent not configured yet. Email ${CONTACT_EMAIL} for access and pricing.`,
      email: CONTACT_EMAIL,
    });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return json(res, 400, { error: 'message is required' });
  }

  const repoUrl = (process.env.LATTICE_REPO_URL || DEFAULT_REPO).trim();
  const modelId = (process.env.LATTICE_MODEL_ID || 'composer-2.5').trim();
  let agentId = typeof body.agentId === 'string' && body.agentId.trim()
    ? body.agentId.trim()
    : null;

  let agent;
  try {
    const { Agent } = await import('@cursor/sdk');

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
          repos: [{ url: repoUrl }],
        },
      });
    }

    const prompt = agentId ? message : buildPrompt(message, body.history);
    const run = await agent.send(prompt);
    const { text, result, runId } = await collectRunText(run);

    if (result?.status === 'error') {
      return json(res, 502, {
        error: 'Agent run failed',
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
        : typeof result?.usage?.inputTokens === 'number' &&
            typeof result?.usage?.outputTokens === 'number'
          ? result.usage.inputTokens + result.usage.outputTokens
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
    return json(res, 500, { error: msg });
  } finally {
    await disposeAgent(agent);
  }
}
