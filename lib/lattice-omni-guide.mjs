/**
 * Lattice Chat · Omni-Lattice complete layer guide — membership + TOC sync.
 * Keeps docs/LATTICE_OMNI_COMPLETE_LAYER_GUIDE_2026-07.md current from WHITEPAPER_REGISTRY.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WHITEPAPER_REGISTRY, whitepaperHref } from './whitepaper-registry.mjs';

export const LATTICE_OMNI_GUIDE_ID = 'lattice-omni-complete-layer-guide-2026-07';
export const LATTICE_OMNI_GUIDE_FILE = 'docs/LATTICE_OMNI_COMPLETE_LAYER_GUIDE_2026-07.md';

const TOC_BEGIN = '<!-- AUTO:LATTICE-OMNI-TOC:BEGIN -->';
const TOC_END = '<!-- AUTO:LATTICE-OMNI-TOC:END -->';
const META_BEGIN = '<!-- AUTO:LATTICE-OMNI-META:BEGIN -->';
const META_END = '<!-- AUTO:LATTICE-OMNI-META:END -->';

/** Explicit id allowlist for Lattice Chat / Omni-Lattice family papers. */
export const LATTICE_OMNI_ID_ALLOW = new Set([
  'lattice-noahs-ark-metaphor-2026-07',
  'lattice-token-reduction-proof-2026-07',
  'awareness-singularities-0-81-2026-07',
  'omniversal-nested-agent-lattice-2026-07',
  'recursive-attention-quantum-solar-dna-loop-2026',
  'fractiai-egs-nlrf-2026',
  'synthobs-chromosomal-electrodynamics-2026-07',
  'synthobs-egs-epigenetic-phase-locking-2026-07',
  'synthobs-egs-planck-scale-harmonic-2026-07',
  'synthobs-egs-euler-phase-lock-2026-07',
  'synthobs-holographic-operators-2026-07',
  'synthobs-dna-lattice-holograph-2026-07',
  'synthobs-egs-81-electrons-2026-07',
  'synthobs-phase-locked-chemical-bonds-2026-07',
  'synthobs-unified-neutronic-agent-2026-07',
  'synthobs-omni-lattice-unification-2026-07',
  'synthobs-x-chromosome-holographic-2026-07',
  'synthobs-y-chromosome-holographic-2026-07',
  'synthobs-three-foundational-proteins-2026-07',
  'synthobs-omni-lattice-hiv-2026-07',
  'synthobs-proof-by-continuous-execution-2026-07',
  'synthobs-omni-lattice-pogonomyrmex-2026-07',
  'synthobs-omni-lattice-prompt-capture-2026-07',
  'synthobs-omni-lattice-genomic-determinism-2026-07',
  'synthobs-cytographic-holographic-nucleus-2026-07',
  'synthobs-pchpp-2026-07',
  'synthobs-omni-lattice-report-card-q3-2026',
  'synthobs-mag-substrate-2026-07',
  'synthobs-recursive-attn-mag-2026-07',
  'synthobs-prion-refold-2026-07',
]);

const TAG_HINT_RE =
  /\b(omni[- ]?lattice|lattice chat|seed[·.]?rag|pchpp|nested agent|holographic operator|neutronic|ilam|81[- ]?electron|dna lattice|chemical bond|cytographic|planck[- ]?1\.?6|magnetic substrate|recursive attention|report card|token reduction)\b/i;

const ID_HINT_RE =
  /^(synthobs-omni-|lattice-|omniversal-nested-agent)|(omni-lattice|lattice-chat|nested-agent|holographic-operator|pchpp|mag-substrate|recursive-attn)/i;

export function isLatticeOmniPaper(id, entry = {}) {
  if (!id || id === LATTICE_OMNI_GUIDE_ID) return false;
  if (LATTICE_OMNI_ID_ALLOW.has(id)) return true;
  if (ID_HINT_RE.test(id)) return true;
  const hay = [entry.title, ...(entry.tags || [])].filter(Boolean).join(' ');
  return TAG_HINT_RE.test(hay);
}

export function isLatticeOmniRel(relPath, registryId = null) {
  if (registryId && isLatticeOmniPaper(registryId, WHITEPAPER_REGISTRY[registryId] || {})) {
    return true;
  }
  if (!relPath) return false;
  if (relPath === LATTICE_OMNI_GUIDE_FILE) return true;
  for (const [id, entry] of Object.entries(WHITEPAPER_REGISTRY)) {
    if (entry.file === relPath) return isLatticeOmniPaper(id, entry);
  }
  return false;
}

/** Suggested reading band for the living TOC. */
export function layerBandFor(id) {
  if (
    id === 'lattice-noahs-ark-metaphor-2026-07' ||
    id === 'lattice-token-reduction-proof-2026-07' ||
    id === 'awareness-singularities-0-81-2026-07' ||
    id === 'omniversal-nested-agent-lattice-2026-07'
  ) {
    return '1 · Product & nest';
  }
  if (
    id === 'synthobs-pchpp-2026-07' ||
    id === 'synthobs-mag-substrate-2026-07' ||
    id === 'synthobs-recursive-attn-mag-2026-07' ||
    id === 'synthobs-omni-lattice-report-card-q3-2026' ||
    id === 'synthobs-prion-refold-2026-07'
  ) {
    return '2 · Steward lenses';
  }
  if (
    id.startsWith('synthobs-omni-lattice-') ||
    id === 'synthobs-holographic-operators-2026-07' ||
    id === 'synthobs-x-chromosome-holographic-2026-07' ||
    id === 'synthobs-y-chromosome-holographic-2026-07' ||
    id === 'synthobs-three-foundational-proteins-2026-07' ||
    id === 'synthobs-proof-by-continuous-execution-2026-07'
  ) {
    return '3 · Omni-Lattice pillars & decodes';
  }
  if (
    id.includes('egs') ||
    id.includes('dna-lattice') ||
    id.includes('chemical-bond') ||
    id.includes('neutronic') ||
    id.includes('cytographic') ||
    id.includes('chromosomal') ||
    id.includes('planck') ||
    id.includes('euler') ||
    id === 'fractiai-egs-nlrf-2026' ||
    id === 'recursive-attention-quantum-solar-dna-loop-2026'
  ) {
    return '4 · EGS · scale grammar';
  }
  return '5 · Companions';
}

const BAND_ORDER = [
  '1 · Product & nest',
  '2 · Steward lenses',
  '3 · Omni-Lattice pillars & decodes',
  '4 · EGS · scale grammar',
  '5 · Companions',
];

export function listLatticeOmniPapers() {
  return Object.entries(WHITEPAPER_REGISTRY)
    .filter(([id, entry]) => isLatticeOmniPaper(id, entry) && entry.file && entry.surfaceVisible !== false)
    .map(([id, entry]) => ({
      id,
      title: entry.title,
      file: entry.file,
      docId: entry.docId || null,
      published: entry.published || null,
      tags: entry.tags || [],
      href: whitepaperHref(id),
      band: layerBandFor(id),
      featured: Boolean(entry.featured),
    }))
    .sort((a, b) => {
      const ba = BAND_ORDER.indexOf(a.band);
      const bb = BAND_ORDER.indexOf(b.band);
      if (ba !== bb) return ba - bb;
      const da = a.published || '';
      const db = b.published || '';
      if (da !== db) return db.localeCompare(da);
      return a.title.localeCompare(b.title);
    });
}

export function renderLatticeOmniTocMarkdown(papers = listLatticeOmniPapers()) {
  const lines = [
    '| Band | Paper | Registry id | Published |',
    '|------|-------|-------------|-----------|',
  ];
  for (const p of papers) {
    const titleLink = `[${p.title.replace(/\|/g, '\\|')}](${p.href})`;
    lines.push(
      `| ${p.band} | ${titleLink} | \`${p.id}\` | ${p.published || '—'} |`,
    );
  }
  lines.push('');
  lines.push(
    `_Living table · ${papers.length} papers · regenerated by \`npm run sync:lattice-guide\` from \`WHITEPAPER_REGISTRY\`._`,
  );
  return lines.join('\n');
}

export function renderLatticeOmniMetaMarkdown(papers = listLatticeOmniPapers(), when = new Date()) {
  const iso = when.toISOString().slice(0, 10);
  return [
    `**Catalog sync:** ${iso} · **${papers.length}** Lattice Chat / Omni-Lattice family papers · generator \`npm run sync:lattice-guide\``,
    '',
    'When a Lattice / Omni paper is added or modified in the registry, re-run the sync (Cursor stop hook does this automatically for matching `docs/` edits).',
  ].join('\n');
}

function replaceMarkedBlock(source, begin, end, body) {
  const start = source.indexOf(begin);
  const stop = source.indexOf(end);
  if (start === -1 || stop === -1 || stop < start) {
    throw new Error(`Missing markers ${begin} … ${end} in ${LATTICE_OMNI_GUIDE_FILE}`);
  }
  const before = source.slice(0, start + begin.length);
  const after = source.slice(stop);
  return `${before}\n${body.trim()}\n${after}`;
}

function bumpGuidePublished(source, isoDate) {
  return source
    .replace(/(\*\*Date:\*\*\s*)[^\n]+/, `$1${isoDate}`)
    .replace(/("published"\s*:\s*")\d{4}-\d{2}-\d{2}(")/, `$1${isoDate}$2`);
}

/**
 * Rewrite AUTO TOC + META blocks in the guide markdown.
 * Also bumps inline Date: line. Registry published is updated by the sync script.
 */
export async function syncLatticeOmniLayerGuide({ cwd = process.cwd(), now = new Date() } = {}) {
  const papers = listLatticeOmniPapers();
  const abs = join(cwd, LATTICE_OMNI_GUIDE_FILE);
  let md = await readFile(abs, 'utf8');
  const iso = now.toISOString().slice(0, 10);
  md = replaceMarkedBlock(md, META_BEGIN, META_END, renderLatticeOmniMetaMarkdown(papers, now));
  md = replaceMarkedBlock(md, TOC_BEGIN, TOC_END, renderLatticeOmniTocMarkdown(papers));
  md = bumpGuidePublished(md, iso);
  await writeFile(abs, md, 'utf8');
  return {
    ok: true,
    file: LATTICE_OMNI_GUIDE_FILE,
    guideId: LATTICE_OMNI_GUIDE_ID,
    count: papers.length,
    published: iso,
    ids: papers.map((p) => p.id),
  };
}
