/**
 * E6 live arm — real open-weight LLM via Groq's OpenAI-compatible endpoint.
 * Same model, same system prompt, same per-turn context budget; only context assembly differs.
 * The model's own reply (SOLUTION-* / NEXT:<id> / NONE) drives the protocol — no regex over the context.
 * Skips cleanly when GROQ_API_KEY is absent. The key is read from the environment only and never written to receipts.
 */
import {
  MATCHED_BUDGET,
} from './constants.mjs';
import {
  buildMatchedBudgetScenario,
  serializeHop,
  serializeLinearSilo,
  truncateToBudget,
  estimateTokens,
  mulberry32,
} from './experiments.mjs';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const USER_SUFFIX =
  'Reply with exactly one line: the SOLUTION-* string if present in CONTEXT, else NEXT:<id> if a NEXT link is present, else NONE.';

async function chat({ apiKey, model, context, budgetTokens }) {
  const packed = budgetTokens ? truncateToBudget(`CONTEXT:\n${context}`, budgetTokens) : `CONTEXT:\n${context}`;
  const body = {
    model,
    temperature: 0,
    max_tokens: 300,
    messages: [
      { role: 'system', content: MATCHED_BUDGET.promptTemplate },
      { role: 'user', content: `${packed}\n\n${USER_SUFFIX}` },
    ],
  };
  if (/gpt-oss/.test(model)) body.reasoning_effort = 'low';
  for (let attempt = 0; attempt < 8; attempt++) {
    const t0 = Date.now();
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * (attempt + 1);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const text = (json.choices?.[0]?.message?.content || '').trim();
    return {
      text,
      promptTokens: json.usage?.prompt_tokens ?? estimateTokens(body.messages.map((m) => m.content).join('\n')),
      completionTokens: json.usage?.completion_tokens ?? 0,
      totalTokens: json.usage?.total_tokens ?? 0,
      durationMs: Date.now() - t0,
    };
  }
  throw new Error('Groq retries exhausted');
}

function parseReply(text) {
  const sol = text.match(/SOLUTION-[A-Za-z0-9_-]+/);
  if (sol) return { solution: sol[0], nextId: null };
  const nxt = text.match(/NEXT:\s*([A-Za-z0-9_-]+)/);
  return { solution: null, nextId: nxt ? nxt[1] : null };
}

async function runArm(scenario, cfg, ctx, arm) {
  const byId = Object.fromEntries(scenario.hopsNodes.map((n) => [n.id, n]));
  let message = '';
  let cur = scenario.hopsNodes[0];
  let tokens = 0;
  let rounds = 0;
  let durationMs = 0;
  let found = null;
  for (let r = 0; r < cfg.maxRounds; r++) {
    rounds++;
    let context;
    if (arm === 'shared') {
      context = ['SHARED_WORLD_SLICE', serializeHop(cur), cur.next ? `EDGE_FOLLOW available to ${cur.next}` : 'EDGE_FOLLOW terminal'].join('\n');
    } else {
      const silo = scenario.silos[Math.min(r, scenario.silos.length - 1)];
      context = [serializeLinearSilo(silo), message ? `PRIOR_MESSAGE:\n${message}` : ''].filter(Boolean).join('\n\n');
    }
    const out = await chat({
      apiKey: ctx.apiKey,
      model: ctx.model,
      context,
      budgetTokens: arm === 'linearUnbounded' ? 0 : cfg.contextBudgetTokens,
    });
    tokens += out.promptTokens + out.completionTokens;
    durationMs += out.durationMs;
    const parsed = parseReply(out.text);
    if (parsed.solution) {
      found = parsed.solution;
      break;
    }
    if (arm === 'shared') {
      if (parsed.nextId && byId[parsed.nextId]) cur = byId[parsed.nextId];
      else break;
    } else {
      message = parsed.nextId ? `NEXT:${parsed.nextId}` : `STATUS:no-link-round-${r}`;
    }
  }
  return { solved: found === scenario.solution, solution: found, tokens, rounds, durationMs };
}

function summarize(rows) {
  const n = rows.length;
  const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
  return {
    solutionRate: Number((rows.filter((r) => r.solved).length / n).toFixed(4)),
    meanTokens: Number((sum('tokens') / n).toFixed(1)),
    meanRounds: Number((sum('rounds') / n).toFixed(2)),
    meanLatencyMs: Number((sum('durationMs') / n).toFixed(0)),
  };
}

export async function runE6LiveLlm({
  scenarios = 12,
  model = process.env.E6_LIVE_MODEL || 'openai/gpt-oss-20b',
} = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { attempted: false, reason: 'GROQ_API_KEY not set' };

  const cfg = MATCHED_BUDGET;
  const rand = mulberry32(cfg.seed + 101);
  const arms = { linear: [], shared: [], linearUnbounded: [] };
  for (let s = 0; s < scenarios; s++) {
    const scenario = buildMatchedBudgetScenario(rand, s, cfg.hops, cfg.fillersPerSilo);
    for (const arm of Object.keys(arms)) {
      arms[arm].push(await runArm(scenario, cfg, { apiKey, model }, arm));
    }
  }

  return {
    attempted: true,
    provider: 'Groq (OpenAI-compatible API)',
    model,
    openWeights: true,
    scenarios,
    hops: cfg.hops,
    maxRounds: cfg.maxRounds,
    contextBudgetTokens: cfg.contextBudgetTokens,
    promptTemplate: cfg.promptTemplate,
    linear: summarize(arms.linear),
    sharedWorld: summarize(arms.shared),
    linearUnbounded: summarize(arms.linearUnbounded),
    interpretation:
      'Real LLM, temperature 0, same system prompt. linear = private silos truncated to the per-turn budget; sharedWorld = current hop + edge under the same budget; linearUnbounded = private silos with no truncation (capability control). The model reply, not a regex over context, drives the protocol. Tokens are provider-reported prompt+completion.',
  };
}
