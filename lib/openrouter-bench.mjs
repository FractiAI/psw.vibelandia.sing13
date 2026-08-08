/** Shared OpenRouter benchmark helpers. Keys are read at runtime and never returned. */
import { existsSync, readFileSync } from 'node:fs';

export function loadEnvFiles(root) {
  for (const name of ['.env.vercel.local', '.env.local', '.env']) {
    const path = `${root}/${name}`;
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

export function extractUnifiedDiff(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:diff|patch)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf('diff --git ');
  if (start >= 0) return candidate.slice(start).trim();
  const begin = candidate.indexOf('*** Begin Patch');
  if (begin >= 0) return candidate.slice(begin).trim();
  return '';
}

export function usageFromResponse(data) {
  const usage = data?.usage;
  if (!usage || typeof usage !== 'object') return null;
  const prompt = usage.prompt_tokens ?? usage.input_tokens;
  const completion = usage.completion_tokens ?? usage.output_tokens;
  const total = usage.total_tokens ?? (typeof prompt === 'number' && typeof completion === 'number' ? prompt + completion : null);
  return {
    promptTokens: typeof prompt === 'number' ? prompt : null,
    completionTokens: typeof completion === 'number' ? completion : null,
    totalTokens: typeof total === 'number' ? total : null,
    cost: typeof usage.cost === 'number' ? usage.cost : null,
  };
}

export async function callOpenRouter({ apiKey, model, messages, temperature = 0, maxTokens = 4000 }) {
  const startedAt = Date.now();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      'http-referer': 'https://www.ssvibelandiaquestfest24x365.com',
      'x-title': 'SING13 Lattice vs standard benchmark',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(300_000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.error || `OpenRouter HTTP ${response.status}`;
    const error = new Error(String(message));
    error.status = response.status;
    throw error;
  }
  const text = String(data?.choices?.[0]?.message?.content || '').trim();
  return {
    text,
    usage: usageFromResponse(data),
    durationMs: Date.now() - startedAt,
    finishReason: data?.choices?.[0]?.finish_reason || null,
    model: data?.model || model,
  };
}

export function scoreResponse({ text, diff, testResult }) {
  const body = String(text || '');
  const criteria = {
    hasActionablePlan: /\b(step|change|implement|modify|add|fix)\b/i.test(body),
    citesRepoLocations: /(?:^|[\s`(])(?:api|lib|apps|tests|scripts|docs|data)\/[\w./-]+/m.test(body),
    includesVerification: /\b(test|vitest|npm test|verify|validation|assert)\b/i.test(body),
    producedPatch: Boolean(diff),
    patchApplied: testResult?.applied === true,
    testsPassed: testResult?.passed === true,
  };
  const weights = { hasActionablePlan: 1, citesRepoLocations: 1, includesVerification: 1, producedPatch: 2, patchApplied: 2, testsPassed: 3 };
  const earned = Object.entries(criteria).reduce((sum, [key, value]) => sum + (value ? weights[key] : 0), 0);
  const possible = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return { criteria, score: earned, maxScore: possible, scorePct: Math.round((earned / possible) * 1000) / 10 };
}
