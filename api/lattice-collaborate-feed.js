/**
 * Lattice Collaborate · unified feed webhook sanitizer (stateless).
 * POST JSON payload → sanitized UnifiedFeed-shaped item (or batch).
 * GET → schema + example envelopes.
 *
 * Honesty: does not store events server-side; edge client owns the timeline.
 */

function dropKeys(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(dropKeys);
  const DROP = new Set([
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
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (DROP.has(k)) continue;
    if (k.startsWith('_') && k !== '_id') continue;
    out[k] = dropKeys(v);
  }
  return out;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      product: 'Lattice Collaborate',
      honesty:
        'Stateless sanitizer only — client owns the timeline. No demo feed. Guests enable integrations; current seats: Valet Pru + Daniel.',
      accept: [
        'SocialPost',
        'MessagingEvent',
        'GitEvent',
        'ArtifactEvent',
        'chat',
      ],
      examples: {
        git: {
          type: 'GitEvent',
          platform: 'github',
          repository: { full_name: 'Project Phoenix' },
          commits: [{}, {}, {}],
          pusher: { name: 'Alex' },
          compare: 'https://github.com/example/compare',
        },
        whatsapp: {
          type: 'MessagingEvent',
          platform: 'whatsapp',
          from: 'Alex',
          message: 'Check the new merge in the UI folder.',
        },
        facebook: {
          type: 'SocialPost',
          platform: 'facebook',
          author: 'Machote Moderno',
          title: 'New Issue Alert',
          body: 'Brutalist architecture issue drop',
        },
      },
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const cleaned = dropKeys(body);
    const batch = Array.isArray(cleaned) ? cleaned : [cleaned];
    res.status(200).json({
      ok: true,
      sanitized: batch,
      note: 'Pass each item to the Lattice Collaborate client ingestPayload parser.',
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      error: 'invalid_json',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
