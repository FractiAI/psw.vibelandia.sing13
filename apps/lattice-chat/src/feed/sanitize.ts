/**
 * Strip redundant UI / webhook metadata before agent or feed context.
 * Keeps intentional fields only — no raw provider chrome.
 */

const DROP_KEYS = new Set([
  'ui',
  'uiMeta',
  'ui_metadata',
  'renderHints',
  'render_hints',
  'tracking',
  'analytics',
  'pixel',
  'client_mutation_id',
  'clientMutationId',
  '__typename',
  'rawHtml',
  'raw_html',
  'style',
  'className',
  'css',
]);

export function sanitizePayload<T = unknown>(input: unknown): T {
  return scrub(input) as T;
}

function scrub(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(scrub);
  if (typeof value !== 'object') {
    if (typeof value === 'string') return value.slice(0, 8000);
    return value;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (DROP_KEYS.has(k)) continue;
    if (k.startsWith('_') && k !== '_id') continue;
    out[k] = scrub(v);
  }
  return out;
}

/** Build a short agent-safe context string from a unified item. */
export function feedItemToAgentContext(item: {
  kind: string;
  platform: string;
  actor: string;
  body?: string;
  git?: { summary?: string; repo?: string; action?: string };
  social?: { title?: string; body?: string };
  messaging?: { body?: string; from?: string };
  artifact?: { title?: string; kind?: string; path?: string };
}): string {
  const lines = [`[${item.platform}/${item.kind}] ${item.actor}`];
  if (item.body) lines.push(item.body);
  if (item.git) {
    lines.push(`Git ${item.git.action || 'event'} · ${item.git.repo || ''}: ${item.git.summary || ''}`);
  }
  if (item.social) {
    lines.push(`${item.social.title || ''}${item.social.body ? ` — ${item.social.body}` : ''}`);
  }
  if (item.messaging) {
    lines.push(`From ${item.messaging.from || item.actor}: ${item.messaging.body || ''}`);
  }
  if (item.artifact) {
    lines.push(`Artifact (${item.artifact.kind}): ${item.artifact.title}${item.artifact.path ? ` @ ${item.artifact.path}` : ''}`);
  }
  return lines.filter(Boolean).join('\n').slice(0, 4000);
}
