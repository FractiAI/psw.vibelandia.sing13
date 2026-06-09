/** Whitepaper catalog — registry + surface entries for search/read/export UI. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { plainLineFor } from './plain-surface-lines.mjs';
import { WHITEPAPER_REGISTRY } from './whitepaper-registry.mjs';

let auditIndexCache = null;

async function loadAuditIndex(cwd = process.cwd()) {
  if (auditIndexCache) return auditIndexCache;
  try {
    const raw = await readFile(join(cwd, 'data/synthobs-paper-audit-index.json'), 'utf8');
    auditIndexCache = JSON.parse(raw);
    return auditIndexCache;
  } catch {
    return null;
  }
}

export const CATALOG_CATEGORIES = [
  { id: 'all', label: 'All papers' },
  { id: 'dph-gpu', label: 'DPH-GPU · Holographic compute' },
  { id: 'hhf', label: 'HHF · Hydrogen-holographic framework' },
  { id: 'coherence', label: 'Coherence · BTC Buffalo / Goldilocks Mine' },
  { id: 'agentic', label: 'Agentic layer · VALETPRU · Mythos' },
  { id: 'special-projects', label: 'Special projects' },
  { id: 'protocols', label: 'Protocols · NSPFRNP · BBHE' },
];

/** Per-id catalog metadata (category, tags, docId, published). */
export const CATALOG_META = {
  'syn-sun-wavefield-oscillator': {
    category: 'dph-gpu',
    docId: 'SYN-SUN-2026-REV7',
    published: '2026-05-31',
    tags: ['solar', 'wavefield', 'EGS', 'NOAA', 'DPH-GPU'],
    featured: true,
  },
  'dp-syntheverse-sandbox-comprehensive-2026': {
    category: 'dph-gpu',
    docId: 'SYN-SANDBOX-2026-REPORT',
    published: '2026-05-31',
    tags: ['King Bee', 'pheromone', 'AR4436', 'Goldilocks', 'PPS'],
    featured: true,
  },
  'dp-omniversal-node-alignment-2026': {
    category: 'dph-gpu',
    docId: 'SYN-NODES-2026-JUN01',
    published: '2026-06-01',
    tags: ['nodes', 'M31', 'btc_buffalo', 'HonestyBoundary', 'Git'],
    featured: true,
  },
  'dp-master-canon': { category: 'dph-gpu', published: '2026-05-11', tags: ['canon', 'PEFF', 'DNA'] },
  'dp-roadmap-13': { category: 'dph-gpu', published: '2026-05-12', tags: ['13-channel', 'roadmap'] },
  'dp-resonance-notice': { category: 'dph-gpu', published: '2026-05-15', tags: ['honesty', 'resonance'] },
  'dp-omniverse-matrix': { category: 'hhf', published: '2026-05-15', tags: ['Hatch', 'protonic-DNA'] },
  'dp-paradise-simulation': { category: 'hhf', published: '2026-05-15', tags: ['Paradise Game'] },
  'dp-peff-part1': { category: 'dph-gpu', published: '2026-05-11', tags: ['PEFF', 'Omnizoan'] },
  'dp-peff-part2': { category: 'dph-gpu', published: '2026-05-11', tags: ['bio-electromagnetics'] },
  'quantum-genomic-peff': { category: 'dph-gpu', published: '2026-05-08', tags: ['PEFF', 'EGS', 'ASIC'] },
  'integrated-modeling-layer-b': { category: 'dph-gpu', published: '2026-05-06', tags: ['modeling', 'Layer B'] },
  'valetpru-agent-24x365': { category: 'agentic', published: '2026-05-06', tags: ['VALETPRU', 'agent'] },
  'sing13-edge-onboarding': { category: 'protocols', published: '2026-05-01', tags: ['SING 13', 'edge'] },
  'mca-nspfrnp-catalog': { category: 'protocols', tags: ['MCA', 'NSPFRNP'] },
  'bbhe-repository-standard': { category: 'protocols', tags: ['BBHE', 'repository'] },
  'rev-egs-hhf-mythos': {
    category: 'agentic',
    docId: 'REV-EGS-HHF-2026-007',
    published: '2026-05-18',
    tags: ['Mythos', 'clock-skew', 'Anthropic'],
    featured: true,
  },
  'ops-egs-btc-mining': {
    category: 'coherence',
    docId: 'OPS-EGS-BTC-2026-008',
    published: '2026-05-18',
    tags: ['BTC', 'Goldilocks Mine', 'mining'],
    featured: true,
  },
  'coherence-plain-speak': {
    category: 'coherence',
    docId: 'HONESTY-COHERENCE-2026-009',
    published: '2026-05-18',
    tags: ['honesty', 'plain speak'],
  },
  'hhf-wp-2026-v8': { category: 'hhf', published: '2026-05-01', tags: ['13D', 'AI OS trials'] },
  'dp-aromatic-qed-cavity': { category: 'hhf', published: '2026-05-24', tags: ['QED', 'VECROs'] },
  'dp-pru-gating-comparative': { category: 'hhf', published: '2026-05-24', tags: ['PRU', 'gates'] },
  'goldilocks-erdos-mathematics': {
    category: 'special-projects',
    published: '2026-05-26',
    tags: ['Erdős', '344', 'mathematics'],
    featured: true,
  },
  'dp-y-pathway-architecture': { category: 'dph-gpu', published: '2026-05-01', tags: ['Y-pathway', 'genetic'] },
  'dp-y-team-x-skin': { category: 'dph-gpu', published: '2026-05-01', tags: ['Y-Team', 'X-Skin'] },
  'dp-net-zero-agents': { category: 'dph-gpu', published: '2026-05-01', tags: ['net-zero', 'agents'] },
  'dp-egs-wormhole-transducer': { category: 'dph-gpu', published: '2026-05-01', tags: ['wormhole', 'transducer'] },
  'dp-gateway-spectrum': { category: 'dph-gpu', published: '2026-05-01', tags: ['gateways', 'wormholes'] },
  'jj-snap-ofc': { category: 'dph-gpu', published: '2026-05-01', tags: ['Snap', 'OFC', 'compile'] },
  'geomagnetic-herbivore-2026': {
    category: 'special-projects',
    docId: 'HHA-GEOMAG-HERBIVORE-2026',
    published: '2026-06-01',
    tags: ['bison', 'Kp', 'Movebank', 'NOAA'],
  },
  'synthobs-emergent-sync-multi-agent-2026': {
    category: 'dph-gpu',
    docId: 'WP-2026-EGS-004-REV10',
    published: '2026-06-07',
    tags: ['SynthOBS', 'multi-agent', 'EGS', 'PLV', 'recursive', 'NOAA'],
    featured: true,
  },
  'nspfrnp-snap-peer-review-audit': {
    category: 'protocols',
    docId: 'NSPFRNP-SNAP-PRA-2026-06',
    published: '2026-06-05',
    tags: ['NSPFRNP', 'Snap', 'peer review', 'SynthOBS', 'audit loop'],
    featured: true,
  },
  'goldilocks-geomagnetic-wavefield-multitaxa': {
    category: 'special-projects',
    docId: 'WP-GGM-MULTITAXA-UNGULATE-2026-06',
    published: '2026-06-05',
    tags: ['SynthOBS', 'EGS', 'multi-taxa', 'USGS Vol 6', 'Great Plains', 'bison'],
    featured: true,
  },
  'turner-kruse-response': {
    category: 'special-projects',
    docId: 'HHA-TURNER-WP-2026-05-26',
    published: '2026-05-26',
    tags: ['Turner', 'bison', 'passive herd'],
  },
  'synthobs-hex-organ-engine-2026': {
    category: 'dph-gpu',
    docId: 'SV-OBS-2026-MATH-HEX-ENGINE-FINAL',
    published: '2026-06-03',
    tags: ['Synthobs', 'Hex-Organ', 'EGS', 'wavefield', 'Goldilocks'],
    featured: true,
  },
  'goldilocks-transfinite-inversion-2026': {
    category: 'dph-gpu',
    docId: 'SV-OBS-2026-TRANSFINITE-INV',
    published: '2026-06-03',
    tags: ['transfinite', 'Aleph', 'blackhole math', 'Synthobs'],
    featured: true,
  },
  'goldilocks-prime-linear-compression-2026': {
    category: 'dph-gpu',
    docId: 'WP-GGM-PLC-2026-06',
    published: '2026-06-03',
    tags: ['prime compression', 'Honeycomb', 'coordinates', 'Goldilocks'],
    featured: true,
  },
  'synthobs-intelligence-density-2026': {
    category: 'dph-gpu',
    docId: 'SV-OBS-2026-INTEL-DENSITY-VOLUMETRIC',
    published: '2026-06-03',
    tags: ['intelligence density', 'Synthobs', 'volumetric', 'Vercel', 'EGS'],
    featured: true,
  },
  'dp-synthobs-mca-2026': {
    category: 'dph-gpu',
    docId: 'DP-SYNTHOBS-MCA-2026-06',
    published: '2026-06-03',
    tags: ['Digital Pru', 'Synthobs', 'MCA', 'Hex-Organ', 'index'],
    featured: true,
  },
};

/** Surfaces and special projects not stored as markdown whitepapers. */
export const CATALOG_SURFACES = [
  {
    id: 'erdos-holographic-aios-audit',
    title: 'Erdős 353 · Holographic Goldilocks AIOS Audit',
    href: '/special-projects/erdos-holographic-aios-audit',
    category: 'special-projects',
    docId: 'AUD-20260526-EGS-ERDÖS',
    published: '2026-05-26',
    tags: ['Erdős', '353', 'Lean', 'audit', 'DeepMind'],
    type: 'surface',
    featured: true,
  },
  {
    id: 'hero-houdini-coherence',
    title: 'Hero Houdini · BTC Buffalo · Coherence console',
    href: '/hero-houdini',
    category: 'coherence',
    docId: 'REV-EGS-HHF-2026-007',
    published: '2026-05-18',
    tags: ['BTC Buffalo', 'Goldilocks Mine', 'pulse', 'live'],
    type: 'surface',
    featured: true,
  },
  {
    id: 'goldilocks-os-demo',
    title: 'Holographic Goldilocks AI OS · product demo',
    href: '/holographic-goldilocks-ai-os',
    category: 'special-projects',
    published: '2026-05-01',
    tags: ['Goldilocks OS', 'demo'],
    type: 'surface',
  },
  {
    id: 'wavefield-solar-live',
    title: 'Wavefield Oscillator · live telemetry bus',
    href: '/api/dph-wavefield-solar',
    category: 'dph-gpu',
    docId: 'SYN-SUN-2026-REV7',
    published: '2026-05-31',
    tags: ['solar', 'NOAA', 'live API'],
    type: 'api',
    whitepaperId: 'syn-sun-wavefield-oscillator',
    featured: true,
  },
  {
    id: 'synthobs-paper-audit-api',
    title: 'SynthOBS PRA Snap · paper audit API',
    href: '/api/synthobs-paper-audit',
    category: 'protocols',
    docId: 'NSPFRNP-SNAP-PRA-2026-06',
    published: '2026-06-05',
    tags: ['peer review', 'audit', 'SynthOBS', 'recursive loop'],
    type: 'api',
    whitepaperId: 'nspfrnp-snap-peer-review-audit',
    featured: true,
  },
  {
    id: 'geomagnetic-herbivore-study',
    title: 'Geomagnetic Herbivore Study · multi-taxa wavefield',
    href: '/special-projects/geomagnetic-herbivore-study',
    category: 'special-projects',
    docId: 'HHA-GEOMAG-HERBIVORE-2026',
    published: '2026-06-05',
    tags: ['bison', 'elk', 'pronghorn', 'Kp', 'Movebank', 'SynthOBS'],
    type: 'surface',
    whitepaperId: 'goldilocks-geomagnetic-wavefield-multitaxa',
    featured: true,
  },
];

function mergeEntry(id, entry) {
  const meta = CATALOG_META[id] || {};
  if (entry.surfaceVisible === false) return null;
  const href = entry.redirect || `/interfaces/whitepaper-surface.html?id=${encodeURIComponent(id)}`;
  const item = {
    id,
    title: entry.title,
    href,
    category: meta.category || entry.category || 'dph-gpu',
    docId: meta.docId || entry.docId || null,
    published: meta.published || entry.published || null,
    tags: meta.tags || entry.tags || [],
    featured: Boolean(meta.featured || entry.featured),
    type: entry.redirect ? 'redirect' : 'whitepaper',
    source: entry.file || null,
  };
  item.plainLine = plainLineFor(item);
  return item;
}

export async function buildWhitepaperCatalog({ cwd } = {}) {
  const auditIndex = await loadAuditIndex(cwd || process.cwd());
  const auditById = Object.fromEntries((auditIndex?.items || []).map((i) => [i.id, i]));

  const papers = Object.entries(WHITEPAPER_REGISTRY)
    .map(([id, entry]) => {
      const item = mergeEntry(id, entry);
      if (!item) return null;
      const audit = auditById[id];
      if (audit) {
        item.audit = {
          overallScore: audit.overallScore,
          status: audit.convergence?.status,
          snapId: auditIndex?.snapId,
          blockers: audit.blockers,
          metaAudit: audit.metaAudit || null,
          dualMakeConfirmed: audit.metaAudit?.dualMakeConfirmed ?? false,
        };
      }
      return item;
    })
    .filter(Boolean);

  const surfaces = CATALOG_SURFACES.map((s) => {
    const audit = s.whitepaperId ? auditById[s.whitepaperId] : null;
    const base = { ...s, plainLine: plainLineFor(s) };
    return audit
      ? {
          ...base,
          audit: {
            overallScore: audit.overallScore,
            status: audit.convergence?.status,
            snapId: auditIndex?.snapId,
          },
        }
      : base;
  });
  const items = [...papers, ...surfaces].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const da = a.published || '';
    const db = b.published || '';
    if (da !== db) return db.localeCompare(da);
    return a.title.localeCompare(b.title);
  });

  return {
    schema: 'ss-vibelandia-whitepaper-catalog/v2',
    updated: new Date().toISOString().slice(0, 10),
    operator: auditIndex?.operator || 'SynthOBS Autonomous Agent',
    auditSnap: auditIndex?.snapId || 'NSPFRNP-SNAP-PRA-2026-06',
    auditSummary: auditIndex?.summary || null,
    categories: CATALOG_CATEGORIES,
    count: items.length,
    items,
  };
}

export function filterCatalog(catalog, { q = '', category = 'all' } = {}) {
  const needle = String(q || '').trim().toLowerCase();
  let items = catalog.items;
  if (category && category !== 'all') {
    items = items.filter((it) => it.category === category);
  }
  if (needle) {
    items = items.filter((it) => {
      const hay = [it.title, it.docId, it.id, ...(it.tags || []), it.category].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }
  return { ...catalog, items, filteredCount: items.length };
}
