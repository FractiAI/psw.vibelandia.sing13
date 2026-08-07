/**
 * Lattice Collaborate · published whitepaper → ArtifactEvent envelopes.
 * Center = pipe/list only; edge clients ingest into their timeline.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { WHITEPAPER_REGISTRY, whitepaperHref } from './whitepaper-registry.mjs';

const EVENTS_REL = 'data/collaborate-feed-events.json';
const AUDIT_DIR = 'data/synthobs-paper-audits';

function dayMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

function parsePublished(published) {
  if (!published || typeof published !== 'string') return null;
  const t = Date.parse(published.length === 10 ? `${published}T12:00:00.000Z` : published);
  return Number.isFinite(t) ? t : null;
}

function paperToEvent(id, entry, { createdAt, auditStatus } = {}) {
  const published = entry.published || createdAt?.slice(0, 10);
  const created =
    createdAt ||
    (published ? `${published}T16:00:00.000Z` : new Date().toISOString());
  return {
    id: `wp_${id}`,
    type: 'ArtifactEvent',
    platform: 'lattice',
    actor: 'SynthOBS',
    sourceLabel: 'New Whitepaper',
    createdAt: created,
    body: entry.title || id,
    presenceHue: 'gold',
    paperId: id,
    artifact: {
      title: entry.title || id,
      kind: 'whitepaper',
      path: entry.file || `registry:${id}`,
      url: whitepaperHref(id),
      paperId: id,
      docId: entry.docId || null,
      published: published || null,
      featured: Boolean(entry.featured),
      auditStatus: auditStatus || null,
    },
  };
}

async function readEventsFile(cwd) {
  try {
    const raw = await readFile(join(cwd, EVENTS_REL), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data?.events) ? data.events : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function readAuditStatus(cwd, paperId) {
  try {
    const raw = await readFile(join(cwd, AUDIT_DIR, `${paperId}.json`), 'utf8');
    const receipt = JSON.parse(raw);
    return receipt?.convergence?.status || null;
  } catch {
    return null;
  }
}

/**
 * Recent featured (and audit-passed) papers as ArtifactEvent envelopes.
 * @param {{ sinceDays?: number, cwd?: string, limit?: number }} opts
 */
export async function listCollaboratePaperEvents(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const sinceDays = opts.sinceDays ?? 21;
  const limit = opts.limit ?? 40;
  const cutoff = Date.now() - dayMs(sinceDays);
  const byId = new Map();

  for (const [id, entry] of Object.entries(WHITEPAPER_REGISTRY)) {
    if (!entry || entry.redirect) continue;
    if (!entry.featured && !entry.published) continue;
    const t = parsePublished(entry.published);
    if (t == null || t < cutoff) continue;
    if (!entry.featured) continue;
    const auditStatus = await readAuditStatus(cwd, id);
    byId.set(id, paperToEvent(id, entry, { auditStatus }));
  }

  const queued = await readEventsFile(cwd);
  for (const ev of queued) {
    const id = ev.paperId || ev.artifact?.paperId || (ev.id || '').replace(/^wp_/, '');
    if (!id) continue;
    const entry = WHITEPAPER_REGISTRY[id];
    if (!entry) {
      byId.set(id, ev);
      continue;
    }
    const createdAt = ev.createdAt;
    const t = createdAt ? Date.parse(createdAt) : parsePublished(entry.published);
    if (t != null && t < cutoff) continue;
    byId.set(
      id,
      paperToEvent(id, entry, {
        createdAt: ev.createdAt,
        auditStatus: ev.artifact?.auditStatus || (await readAuditStatus(cwd, id)),
      }),
    );
  }

  return [...byId.values()]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);
}

/**
 * Append / upsert a paper event after PRA pass (or explicit publish).
 * @param {string} paperId
 * @param {{ cwd?: string, auditStatus?: string, force?: boolean }} opts
 */
export async function publishCollaboratePaperEvent(paperId, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const entry = WHITEPAPER_REGISTRY[paperId];
  if (!entry) {
    return { ok: false, error: 'unknown_paper', paperId };
  }
  const status = opts.auditStatus || (await readAuditStatus(cwd, paperId));
  const passOk =
    opts.force ||
    status === 'pass' ||
    status === 'soft_pass' ||
    entry.featured === true;
  if (!passOk) {
    return { ok: false, error: 'not_qualified', paperId, status };
  }

  const event = paperToEvent(paperId, entry, {
    createdAt: new Date().toISOString(),
    auditStatus: status,
  });

  await mkdir(join(cwd, 'data'), { recursive: true });
  const existing = await readEventsFile(cwd);
  const next = [
    event,
    ...existing.filter((e) => (e.paperId || e.artifact?.paperId || e.id) !== event.id && e.id !== event.id),
  ].slice(0, 200);

  await writeFile(
    join(cwd, EVENTS_REL),
    JSON.stringify(
      {
        schema: 'lattice-collaborate-feed-events/v1',
        updatedAt: new Date().toISOString(),
        seats: ['Valet Pru', 'Daniel'],
        events: next,
      },
      null,
      2,
    ),
    'utf8',
  );

  return { ok: true, paperId, event, path: EVENTS_REL };
}
