/**
 * Lattice Collaborate · unified feed pipe.
 * GET → schema + recent published whitepaper ArtifactEvents for seat clients.
 * POST → sanitize webhook payload (client still owns timeline ingest).
 *
 * Honesty: does not store per-user timelines server-side; papers list is a shared pipe.
 */
import { listCollaboratePaperEvents } from '../lib/lattice-collaborate-papers.mjs';

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
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      const sinceDays = Math.min(
        90,
        Math.max(1, Number(url.searchParams.get('sinceDays') || 21) || 21),
      );
      const events = await listCollaboratePaperEvents({ sinceDays, limit: 40 });
      res.status(200).json({
        ok: true,
        product: 'Lattice Collaborate',
        honesty:
          'Shared paper pipe + webhook sanitizer. Edge clients ingest into their timeline. Seats: Valet Pru + Daniel. New featured / PRA-passed whitepapers appear here automatically.',
        accept: ['SocialPost', 'MessagingEvent', 'GitEvent', 'ArtifactEvent', 'chat'],
        seats: ['Valet Pru', 'Daniel'],
        events,
        examples: {
          artifact: {
            type: 'ArtifactEvent',
            platform: 'lattice',
            actor: 'SynthOBS',
            artifact: {
              title: 'Example paper',
              kind: 'whitepaper',
              path: 'docs/EXAMPLE.md',
              url: '/whitepaper/example',
            },
          },
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
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'papers_list_failed',
        message: err instanceof Error ? err.message : String(err),
      });
    }
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
