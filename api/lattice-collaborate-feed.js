/**
 * Lattice Collaborate · unified feed pipe.
 * GET (default) → schema + recent published whitepaper ArtifactEvents.
 * GET ?dms=1 → shared seat DMs (allowlisted email header).
 * POST ?dms=1 → append DM (x-lattice-email → seat map).
 * POST (default) → sanitize webhook payload (client still owns timeline ingest).
 *
 * Honesty: paper list + DM log are shared pipes. Edge clients rewrite actor labels.
 */
import { listCollaboratePaperEvents } from '../lib/lattice-collaborate-papers.mjs';
import {
  appendCollaborateDm,
  listCollaborateDms,
  resolveCollabPeerId,
} from '../lib/lattice-collaborate-dms.mjs';
import { checkLatticeEmailAccess, normalizeEmail } from '../lib/lattice-access.mjs';

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
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, x-lattice-email, X-Lattice-Email',
  );
}

function requestUrl(req) {
  return new URL(req.url || '/', 'http://localhost');
}

function emailFromReq(req, body) {
  const header =
    req.headers?.['x-lattice-email'] ||
    req.headers?.['X-Lattice-Email'] ||
    '';
  const fromBody = body && typeof body.email === 'string' ? body.email : '';
  return normalizeEmail(header || fromBody);
}

function newDmId() {
  return `dm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function handleDmsGet(req, res) {
  const email = emailFromReq(req, null);
  const access = checkLatticeEmailAccess(email);
  if (!access.ok) {
    res.status(401).json({ ok: false, error: 'email_required', message: access.reason });
    return;
  }
  const myPeerId = resolveCollabPeerId(email);
  if (!myPeerId) {
    res.status(403).json({
      ok: false,
      error: 'no_collab_seat',
      message: 'This email is allowlisted but has no Collaborate DM seat yet.',
    });
    return;
  }
  const url = requestUrl(req);
  const since = url.searchParams.get('since');
  const all = await listCollaborateDms({ since });
  const dms = all.filter((e) => e.fromPeerId === myPeerId || e.threadPeerId === myPeerId);
  res.status(200).json({
    ok: true,
    product: 'Lattice Collaborate',
    myPeerId,
    honesty:
      'Shared DM pipe for Valet Pru ↔ Daniel seats. Clients rewrite actor to You vs peer name. Requires BLOB_READ_WRITE_TOKEN for multi-instance durability.',
    dms,
  });
}

async function handleDmsPost(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const email = emailFromReq(req, body);
  const access = checkLatticeEmailAccess(email);
  if (!access.ok) {
    res.status(401).json({ ok: false, error: 'email_required', message: access.reason });
    return;
  }
  const fromPeerId = resolveCollabPeerId(email);
  if (!fromPeerId) {
    res.status(403).json({
      ok: false,
      error: 'no_collab_seat',
      message: 'This email is allowlisted but has no Collaborate DM seat yet.',
    });
    return;
  }
  const threadPeerId =
    typeof body.threadPeerId === 'string' ? body.threadPeerId.trim() : '';
  const text = String(body.text ?? body.body ?? '').trim();
  if (!threadPeerId || !text) {
    res.status(400).json({
      ok: false,
      error: 'invalid_dm',
      message: 'threadPeerId and text/body are required.',
    });
    return;
  }
  if (threadPeerId === fromPeerId) {
    res.status(400).json({ ok: false, error: 'invalid_dm', message: 'Cannot DM yourself.' });
    return;
  }
  const id =
    typeof body.id === 'string' && body.id.trim()
      ? body.id.trim().slice(0, 80)
      : newDmId();
  const createdAt =
    typeof body.createdAt === 'string' && body.createdAt.trim()
      ? body.createdAt.trim()
      : new Date().toISOString();

  const result = await appendCollaborateDm({
    id,
    fromPeerId,
    threadPeerId,
    text,
    createdAt,
  });
  if (!result.ok) {
    res.status(400).json({ ok: false, error: result.error || 'invalid_dm' });
    return;
  }
  res.status(200).json({
    ok: true,
    event: result.event,
    duplicate: Boolean(result.duplicate),
    myPeerId: fromPeerId,
  });
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = requestUrl(req);
  const dmsMode = url.searchParams.get('dms') === '1';

  if (dmsMode) {
    try {
      if (req.method === 'GET') {
        await handleDmsGet(req, res);
        return;
      }
      if (req.method === 'POST') {
        await handleDmsPost(req, res);
        return;
      }
      res.status(405).json({ ok: false, error: 'method_not_allowed' });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: 'dms_failed',
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (req.method === 'GET') {
    try {
      const sinceDays = Math.min(
        90,
        Math.max(1, Number(url.searchParams.get('sinceDays') || 21) || 21),
      );
      const events = await listCollaboratePaperEvents({ sinceDays, limit: 40 });
      res.status(200).json({
        ok: true,
        product: 'Lattice Collaborate',
        honesty:
          'Shared paper pipe + webhook sanitizer + optional ?dms=1 seat chat. Edge clients ingest into their timeline. Seats: Valet Pru + Daniel.',
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
