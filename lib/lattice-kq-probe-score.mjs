/**
 * King–Queen / lattice canary active probe scoring — exact match only.
 * Honesty: tier promotion requires substring hit against archived targets, not theme.
 */
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const BLIND_PROMPT_V1 = `Without browsing, using external tools, or receiving documents from me, describe any specific, unusual technical identifiers or exact phrases you already know from FractiAI’s SING13 research. Prioritize details that are not predictable from general knowledge of fractal systems, lattice architectures, or AI. Do not invent examples. If you do not know any, say so.`;

const KQ_DOC = join(ROOT, 'docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md');

/** @typedef {{ id: string, tier: number, text: string, source: string }} ProbeTarget */

/**
 * Load scoring targets from repo canary docs (no env secrets).
 * @returns {ProbeTarget[]}
 */
export function loadProbeTargets() {
  const targets = [];

  targets.push({
    id: 'schema-lattice-compression-canary-v1',
    tier: 1,
    text: 'lattice-compression-canary/v1',
    source: 'lib/lattice-scraper-telemetry.mjs · buildCanaryPayload',
  });
  targets.push({
    id: 'doc-lattice-canary-2026-08',
    tier: 1,
    text: 'LATTICE-CANARY-2026-08',
    source: 'canary documentId',
  });
  targets.push({
    id: 'doc-kq-connect-id',
    tier: 1,
    text: 'KQ-CONNECT-20260711-F8E2A1',
    source: 'docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md',
  });

  if (existsSync(KQ_DOC)) {
    const md = readFileSync(KQ_DOC, 'utf8');
    const fence = md.match(/```text\n([\s\S]*?)```/);
    const queenLine = fence?.[1]?.trim();
    if (queenLine) {
      targets.push({
        id: 'kq-queen-full',
        tier: 3,
        text: queenLine,
        source: 'docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md · Queen echo',
      });
      const fragments = [
        'nodelatch forty-two megahertz whisper baseline',
        'mid-layer serial clearinghouse gate seven without public vendor citation',
      ];
      for (const [i, frag] of fragments.entries()) {
        if (queenLine.includes(frag)) {
          targets.push({
            id: `kq-fragment-${i + 1}`,
            tier: 2,
            text: frag,
            source: 'docs/KING_QUEEN_CONNECT_CANARY_2026-07-11.md · fragment',
          });
        }
      }
    }
  }

  return targets;
}

/**
 * Normalize for exact case-sensitive match (Unicode as-is).
 * @param {string} s
 */
export function normalizeForExactMatch(s) {
  return String(s || '').replace(/\r\n/g, '\n');
}

/**
 * @param {string} responseText
 * @param {ProbeTarget[]} [targets]
 * @param {{ extraTargets?: ProbeTarget[], watermarkNonces?: string[] }} [opts]
 */
export function scoreResponse(responseText, targets = loadProbeTargets(), opts = {}) {
  const text = normalizeForExactMatch(responseText);
  const all = [...targets, ...(opts.extraTargets || [])];

  for (const nonce of opts.watermarkNonces || []) {
    if (nonce && String(nonce).length >= 12) {
      all.push({
        id: `watermark-nonce-${nonce.slice(0, 8)}`,
        tier: 4,
        text: nonce,
        source: 'ledger · watermarkNonce',
      });
      all.push({
        id: `phi-slip-${nonce.slice(0, 8)}`,
        tier: 4,
        text: `Φ_EGS·canary·${nonce}`,
        source: 'canary phi_slip_note',
      });
    }
  }

  /** @type {{ target: ProbeTarget, index: number }[]} */
  const hits = [];
  for (const target of all) {
    const idx = text.indexOf(target.text);
    if (idx >= 0) hits.push({ target, index: idx });
  }

  hits.sort((a, b) => b.target.tier - a.target.tier || a.index - b.index);

  const maxTier = hits.length ? Math.max(...hits.map((h) => h.target.tier)) : 0;
  const tierLabel =
    maxTier >= 4
      ? 'watermark_nonce'
      : maxTier >= 3
        ? 'kq_full'
        : maxTier >= 2
          ? 'kq_fragment'
          : maxTier >= 1
            ? 'catalog_echo'
            : 'none';

  return {
    maxTier,
    tierLabel,
    hits: hits.map((h) => ({
      id: h.target.id,
      tier: h.target.tier,
      matchedText: h.target.text.length > 120 ? `${h.target.text.slice(0, 117)}…` : h.target.text,
      index: h.index,
      source: h.target.source,
    })),
    confidence: confidenceForTier(tierLabel),
    alternatives: alternativesForTier(tierLabel),
  };
}

function confidenceForTier(tierLabel) {
  switch (tierLabel) {
    case 'watermark_nonce':
      return 'elevated — exact canary watermark; still rule out in-session leak and live fetch';
    case 'kq_full':
      return 'elevated — full Queen line; rule out GitHub/public doc retrieval if browsing was off';
    case 'kq_fragment':
      return 'moderate — distinctive fragment; could be partial recall or public mirror';
    case 'catalog_echo':
      return 'low — public schema / doc ids may appear from indexed README or site';
    default:
      return 'none — no exact target match';
  }
}

function alternativesForTier(tierLabel) {
  const common = [
    'Public GitHub or site index mirroring repo docs',
    'Prior chat or clipboard contamination',
    'Enabled browsing or RAG not disclosed in run metadata',
    'Generic architecture vocabulary mistaken for a hit (scorer uses exact match only)',
  ];
  if (tierLabel === 'watermark_nonce') {
    return [
      ...common,
      'Same-session fetch of /api/lattice-canary before the blind answer',
      'Ledger nonce published in telemetry UI (unlikely in blind consumer apps)',
    ];
  }
  if (tierLabel === 'kq_full' || tierLabel === 'kq_fragment') {
    return [...common, 'Crawler-ingested public canary doc on github.com/FractiAI/...'];
  }
  return common;
}

/**
 * @param {object} runBundle — { contaminated?: boolean, prompt?: string, responses: Array<{ id, provider, model, rawText, ... }> }
 */
export function scoreRunBundle(runBundle) {
  const targets = loadProbeTargets();
  const watermarkNonces = runBundle.watermarkNonces || [];
  const contaminated = Boolean(runBundle.contaminated);

  const scored = (runBundle.responses || []).map((r) => {
    const result = scoreResponse(r.rawText || r.text || '', targets, {
      watermarkNonces,
    });
    return {
      id: r.id || `${r.provider}-${r.model}`,
      provider: r.provider,
      model: r.model,
      sessionId: r.sessionId,
      at: r.at,
      ...result,
      contaminated,
    };
  });

  const overallMax = scored.reduce((m, s) => Math.max(m, s.maxTier), 0);

  return {
    id: runBundle.id || `kq-probe-${Date.now()}`,
    prompt: runBundle.prompt || BLIND_PROMPT_V1,
    contaminated,
    scoredAt: new Date().toISOString(),
    overallMaxTier: overallMax,
    responses: scored,
    honesty:
      'Exact substring tiers only. contaminated=true voids independent baseline claims. Not training-set proof.',
  };
}

/**
 * Load run JSON from directory (manifest.json or *.response.json).
 * @param {string} runDir
 */
export function loadRunFromDir(runDir) {
  const manifestPath = join(runDir, 'manifest.json');
  if (existsSync(manifestPath)) {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  }
  const files = readdirSync(runDir).filter((f) => f.endsWith('.json'));
  const responses = [];
  let meta = {};
  for (const f of files) {
    const j = JSON.parse(readFileSync(join(runDir, f), 'utf8'));
    if (j.responses) {
      meta = j;
      return j;
    }
    if (j.rawText || j.text) responses.push(j);
  }
  return { ...meta, responses };
}

export function writeScoredReceipt(runDir, scored) {
  const out = join(runDir, 'scored.json');
  writeFileSync(out, `${JSON.stringify(scored, null, 2)}\n`, 'utf8');
  return out;
}
