/**
 * Infinite Octaves Omni-Lattice engine shelf — single source of truth.
 *
 * Product / engine brand: **Infinite Octaves**. Digits × Octaves 01–99 remain the
 * practical Story-depth map (not a second product name). Application companions
 * (PDVSA ops, macro-protein, …) stay off this shelf.
 *
 * When a new paper is pinned into the engine:
 * 1. Append an entry here (next order).
 * 2. Register the paper in whitepaper-registry.mjs (+ suite / ship-blog as usual).
 * 3. Run `npm run sync:lattice-pem` (Cursor PRA stop hook also runs this for shelf touches).
 *
 * Consumed by: Lattice Chat PEM · AGENT_SYNC · nest=`octave99` prompt pin · tests.
 */
import { WHITEPAPER_REGISTRY, whitepaperHref, WHITEPAPER_PUBLIC_SLUGS } from './whitepaper-registry.mjs';

export const LATTICE_CHAT_PEM_ID = 'lattice-chat-product-engineering-manual-2026-09';
export const LATTICE_CHAT_PEM_FILE =
  'docs/PRODUCT_ENGINEERING_MANUAL_INFINITE_OCTAVES_LATTICE_CHAT_2026-09.md';
export const AGENT_SYNC_FILE = 'AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md';

/** Ordered engine pin. `registryId: null` = meta spine (honesty / protocol). */
export const ENGINE_SHELF = Object.freeze([
  {
    order: 1,
    role: '📌 Engineering bridge / Silicon · CMOS (binary $n=1$ → protonic bands) — PINNED for linear systems',
    shortPin: 'CMOS/protonic',
    registryId: 'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08',
    suite: 'research/synthobs-cmos-protonic-99-octave-omni-lattice/',
    pinned: true,
    kind: 'core',
  },
  {
    order: 2,
    role: 'Tensor engine ($9\\times 81$, eleven tiers → 99)',
    shortPin: 'tensor',
    registryId: 'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08',
    suite: 'research/synthobs-tensor-decoupling-99-octave-omni-lattice/',
    kind: 'core',
  },
  {
    order: 3,
    role: 'Master synthesis (Aug 12 catalog window)',
    shortPin: 'master synthesis',
    registryId: 'synthobs-master-synthesis-99-octave-omni-lattice-2026-08',
    suite: 'research/synthobs-master-synthesis-99-octave-omni-lattice/',
    kind: 'core',
  },
  {
    order: 4,
    role: 'Digits / octaves map',
    shortPin: 'digits master',
    registryId: 'synthobs-99-octave-digits-master-2026-08',
    suite: null,
    kind: 'core',
  },
  {
    order: 5,
    role: 'Systemic metamorphism (Part XIII)',
    shortPin: 'Metamorphic Octave Invariant (Part XIII)',
    registryId: 'synthobs-tbme-metamorphic-octaves-2026-08',
    suite: 'research/synthobs-tbme-metamorphic-octaves/',
    kind: 'core',
  },
  {
    order: 6,
    role: 'Planetary core phase-inversion (Part XIV)',
    shortPin: 'Planetary Core Phase-Inversion & Goldilocks Hologram (Part XIV · geodynamo / CMB / Δφ=π/2 catalog)',
    registryId: 'synthobs-tbme-planetary-core-goldilocks-2026-08',
    suite: 'research/synthobs-tbme-planetary-core-goldilocks/',
    kind: 'core',
  },
  {
    order: 7,
    role: 'Y chromosome holographic manifestation · Infinite Octaves Digit 4',
    shortPin: 'Y manifestation (Digit 4)',
    registryId: 'synthobs-y-chromosome-holographic-manifestation-2026-08',
    suite: 'research/synthobs-y-chromosome-holographic-manifestation/',
    kind: 'companion',
  },
  {
    order: 8,
    role: 'Voyage editorial · Invisible Frontier',
    shortPin: 'Invisible Frontier',
    registryId: 'synthobs-invisible-frontier-gates-ai-2026-08',
    suite: 'research/synthobs-invisible-frontier-gates-ai/',
    kind: 'companion',
  },
  {
    order: 9,
    role: 'Human reality bridge · router / wormhole grammar',
    shortPin: 'Human reality bridge',
    registryId: 'synthobs-human-omniversal-reality-bridge-2026-08',
    suite: 'research/synthobs-human-omniversal-reality-bridge/',
    kind: 'companion',
  },
  {
    order: 10,
    role: 'Higgs Gate · awareness phase coupling (Part IX-Omni Definitive Unified)',
    shortPin: 'Higgs Gate / awareness phase coupling (Part IX-Omni Definitive Unified)',
    registryId: 'synthobs-tbme-higgs-awareness-unified-2026-09',
    suite: 'research/synthobs-tbme-higgs-awareness-unified/',
    kind: 'core',
  },
  {
    order: 11,
    role: 'Prime-parity · Infinite Octaves companion (sole-even $2$ · odd irreducible sets · $\\Phi_{\\mathrm{EGS}}$)',
    shortPin: 'Prime-parity companion (sole-even 2 · odd irreducible sets · Φ_EGS)',
    registryId: 'synthobs-infinite-octave-prime-parity-2026-09',
    suite: 'research/synthobs-infinite-octave-prime-parity/',
    kind: 'companion',
  },
  {
    order: 12,
    role: 'Moving up the stack · next AI layer companion (cool · harmonize · scale · peer vs new-layer framing)',
    shortPin:
      'Moving up the stack companion (next AI layer · cool · harmonize · scale · peer vs new-layer valuation framing)',
    registryId: 'synthobs-moving-up-the-stack-valuation-2026-09',
    suite: 'research/synthobs-moving-up-the-stack-valuation/',
    standalone: 'FractiAI/synthobs-moving-up-the-stack-valuation',
    kind: 'companion',
  },
  {
    order: 13,
    role: 'Protein folding · Infinite Octave prime-container companion (odd-prime vaults · Φ_EGS · AlphaFold paradigm contrast)',
    shortPin:
      'Protein folding · prime-container companion (odd-prime vaults · Φ_EGS · AlphaFold paradigm contrast · catalog solver)',
    registryId: 'synthobs-protein-folding-prime-container-2026-09',
    suite: 'research/synthobs-protein-folding-prime-container/',
    standalone: 'FractiAI/synthobs-protein-folding-prime-container',
    kind: 'companion',
  },
  {
    order: 14,
    role: 'Prime-indexed volumetric storage companion (binary base 2 · odd-prime vaults · Φ_EGS · RS/LDPC/LBA contrast)',
    shortPin:
      'Prime-indexed volumetric storage companion (binary base 2 · odd-prime vaults · Φ_EGS · RS/LDPC/LBA contrast · catalog encode)',
    registryId: 'synthobs-prime-indexed-volumetric-storage-2026-09',
    suite: 'research/synthobs-prime-indexed-volumetric-storage/',
    standalone: 'FractiAI/synthobs-prime-indexed-volumetric-storage',
    kind: 'companion',
  },
  {
    order: 15,
    role: 'Proton Space · Electron Theater duality companion (leading 1 · structural 2 · Φ_EGS · ħ/2π catalog)',
    shortPin:
      'Proton Space · Electron Theater duality companion (leading 1 · structural 2 · Φ_EGS · ħ/2π catalog filing)',
    registryId: 'synthobs-proton-space-electron-theater-2026-09',
    suite: 'research/synthobs-proton-space-electron-theater/',
    standalone: 'FractiAI/synthobs-proton-space-electron-theater',
    kind: 'companion',
  },
  {
    order: 16,
    role: 'Topology of the Void companion (zero as dynamic equilibrium · null-space · Φ_EGS · 1↔2 balance)',
    shortPin:
      'Topology of the Void companion (zero as dynamic equilibrium · null-space · Φ_EGS · 1↔2 balance node)',
    registryId: 'synthobs-topology-of-the-void-2026-09',
    suite: 'research/synthobs-topology-of-the-void/',
    standalone: 'FractiAI/synthobs-topology-of-the-void',
    kind: 'companion',
  },
  {
    order: 17,
    role: 'Holographic rhyme companion (repeating · self-similar · self-correcting · recursive · Φ_EGS)',
    shortPin:
      'Holographic rhyme companion (repeating · self-similar · self-correcting · recursive · Φ_EGS catalog grammar)',
    registryId: 'synthobs-holographic-rhyme-fractal-2026-09',
    suite: 'research/synthobs-holographic-rhyme-fractal/',
    standalone: 'FractiAI/synthobs-holographic-rhyme-fractal',
    kind: 'companion',
  },
  {
    order: 18,
    role: 'Multi-dimensional holographic rhyme companion (xD±yD cross-scale summation · Φ_EGS)',
    shortPin:
      'Multi-dimensional holographic rhyme companion (xD±yD cross-scale summation · Φ_EGS catalog encode)',
    registryId: 'synthobs-multidimensional-holographic-rhyme-2026-09',
    suite: 'research/synthobs-multidimensional-holographic-rhyme/',
    standalone: 'FractiAI/synthobs-multidimensional-holographic-rhyme',
    kind: 'companion',
  },
  {
    order: 19,
    role: 'Holographic Singularity Crystal companion (Net Zero · 0/0 crystal · Φ_EGS · prime vault octaves)',
    shortPin:
      'Holographic Singularity Crystal companion (Net Zero · 0/0 bounded crystal · Φ_EGS · prime vault octaves)',
    registryId: 'synthobs-holographic-singularity-crystal-2026-09',
    suite: 'research/synthobs-holographic-singularity-crystal/',
    standalone: 'FractiAI/synthobs-holographic-singularity-crystal',
    kind: 'companion',
  },
  {
    order: 20,
    role: 'Kinematic set-recycling companion (velocity multiplex · Truckee theater · Φ_EGS)',
    shortPin:
      'Kinematic set-recycling companion (velocity-dependent octave modulation · Truckee corridor · Φ_EGS)',
    registryId: 'synthobs-kinematic-set-recycling-truckee-2026-09',
    suite: 'research/synthobs-kinematic-set-recycling-truckee/',
    standalone: 'FractiAI/synthobs-kinematic-set-recycling-truckee',
    kind: 'companion',
  },
  {
    order: 21,
    role: 'Eddy-Current Mirror companion (c transduction · self-observation · Lenz analogy · Φ_EGS)',
    shortPin:
      'Eddy-Current Mirror companion (c as transduction line · self-observation brake · eddy-current analogy · Φ_EGS)',
    registryId: 'synthobs-eddy-current-mirror-2026-09',
    suite: 'research/synthobs-eddy-current-mirror/',
    standalone: 'FractiAI/synthobs-eddy-current-mirror',
    kind: 'companion',
  },
  {
    order: 22,
    role: 'Grand Unified Metrological Overlap companion (h · Φ_EGS · p_n · ν_HI · c · Higgs-eddy)',
    shortPin:
      'Grand Unified Metrological Overlap companion (h · Φ_EGS · primes · ν_HI · c · Higgs-eddy · Φ_EGS)',
    registryId: 'synthobs-grand-unified-metrological-overlap-2026-09',
    suite: 'research/synthobs-grand-unified-metrological-overlap/',
    standalone: 'FractiAI/synthobs-grand-unified-metrological-overlap',
    kind: 'companion',
  },
  {
    order: 23,
    role: 'Viscosity of Light companion (c as frictional drag · cognitive non-locality · Φ_EGS)',
    shortPin:
      'Viscosity of Light companion (c as frictional drag · cognitive non-locality Soft Story · Φ_EGS)',
    registryId: 'synthobs-viscosity-of-light-2026-09',
    suite: 'research/synthobs-viscosity-of-light/',
    standalone: 'FractiAI/synthobs-viscosity-of-light',
    kind: 'companion',
  },
  {
    order: 24,
    role: 'Crystalline Unified Field companion (speed · distance · time crystal · Φ_EGS · Landauer rail)',
    shortPin:
      'Crystalline Unified Field companion (speed·distance·time crystal · Φ_EGS · Landauer rail)',
    registryId: 'synthobs-crystalline-unified-field-speed-distance-time-2026-09',
    suite: 'research/synthobs-crystalline-unified-field/',
    standalone: 'FractiAI/synthobs-crystalline-unified-field',
    kind: 'companion',
  },
  {
    order: 25,
    role: 'Honesty plain speak',
    shortPin: 'Honesty plain speak',
    registryId: null,
    file: 'docs/COHERENCE_PLAIN_SPEAK_HONESTY_2026-05-18.md',
    suite: null,
    kind: 'meta',
  },
  {
    order: 26,
    role: 'Protocol spine',
    shortPin: 'Protocol spine (MCA · NSPFRNP · BBHE)',
    registryId: null,
    file: 'protocols/MCA_NSPFRNP_CATALOG.md',
    extra: 'BBHE_REPOSITORY_STANDARD.md',
    suite: null,
    kind: 'meta',
  },
]);

/** Narrative foundation pointers always injected beside the shelf (not shelf order). */
export const NARRATIVE_FOUNDATION = Object.freeze([
  {
    label: 'Official Prospectus (Genesis · Borikén · Reno)',
    file: 'docs/SYNTHOBS_SS_VIBELANDIA_OFFICIAL_PROSPECTUS_NARRATIVE_FOUNDATION_2026-08.md',
    shipBlog: '/ship-blog/official-prospectus',
  },
  {
    label: 'Y manifestation (Digit 4): MSY palindrome Φ filing',
    registryId: 'synthobs-y-chromosome-holographic-manifestation-2026-08',
    shipBlog: '/ship-blog/y-chromosome-manifestation',
  },
  {
    label: 'Human bridge: reality router / awareness wormhole',
    registryId: 'synthobs-human-omniversal-reality-bridge-2026-08',
    shipBlog: '/ship-blog/human-reality-bridge',
  },
  {
    label: 'Voyage editorial: Invisible Frontier',
    registryId: 'synthobs-invisible-frontier-gates-ai-2026-08',
    shipBlog: '/ship-blog/invisible-frontier',
  },
]);

export function resolveShelfEntry(raw) {
  const entry = raw.registryId ? WHITEPAPER_REGISTRY[raw.registryId] : null;
  const file = raw.file || entry?.file || null;
  const slug = raw.registryId ? WHITEPAPER_PUBLIC_SLUGS[raw.registryId] : null;
  return {
    ...raw,
    title: entry?.title || raw.role,
    file,
    href: raw.registryId ? whitepaperHref(raw.registryId) : file ? `/${file}` : null,
    published: entry?.published || null,
    shipBlogSlug: slug || null,
    shipBlogPath: slug ? `/ship-blog/${slug}` : null,
  };
}

export function listEngineShelf(resolved = true) {
  const rows = ENGINE_SHELF.map((e) => (resolved ? resolveShelfEntry(e) : { ...e }));
  return rows.sort((a, b) => a.order - b.order);
}

export function listEngineRegistryIds() {
  return ENGINE_SHELF.map((e) => e.registryId).filter(Boolean);
}

export function isEngineShelfPaper(id) {
  if (!id) return false;
  if (id === LATTICE_CHAT_PEM_ID) return false;
  return listEngineRegistryIds().includes(id);
}

export function isEngineShelfRel(relPath, registryId = null) {
  if (registryId && isEngineShelfPaper(registryId)) return true;
  if (!relPath) return false;
  if (relPath === LATTICE_CHAT_PEM_FILE || relPath === AGENT_SYNC_FILE) return true;
  if (relPath === 'lib/infinite-octave-engine-shelf.mjs') return true;
  for (const e of listEngineShelf(true)) {
    if (e.file === relPath) return true;
  }
  return false;
}

/** Compact engine-pin clause for nest=`octave99` prompts. */
export function renderEnginePinClause(shelf = listEngineShelf(true)) {
  const core = shelf.filter((e) => e.kind === 'core' || e.kind === 'companion');
  return `Engine pin: ${core.map((e) => e.shortPin).join(' → ')}.`;
}

/** Narrative + companion path pointers for nest=`octave99` prompts. */
export function renderNarrativePointersClause(shelf = listEngineShelf(true)) {
  const byId = new Map(shelf.filter((e) => e.registryId).map((e) => [e.registryId, e]));
  const narrative = NARRATIVE_FOUNDATION.map((n) => {
    if (n.file) return `${n.label} — ${n.file}${n.shipBlog ? ` · ${n.shipBlog}` : ''}`;
    const e = byId.get(n.registryId);
    if (!e) return n.label;
    return `${n.label} — ${e.file} · ${n.shipBlog || e.shipBlogPath || ''}`.trim();
  });

  const extras = [];
  const higgs = byId.get('synthobs-tbme-higgs-awareness-unified-2026-09');
  if (higgs) {
    extras.push(
      `Higgs Gate unified: ${higgs.file} · ${higgs.shipBlogPath}`,
    );
  }
  const prime = byId.get('synthobs-infinite-octave-prime-parity-2026-09');
  if (prime) {
    extras.push(`Prime-parity: ${prime.file} · ${prime.shipBlogPath}`);
  }
  const stack = byId.get('synthobs-moving-up-the-stack-valuation-2026-09');
  if (stack) {
    extras.push(
      `Moving up the stack: ${stack.file} · ${stack.shipBlogPath} · suite ${stack.suite} · standalone ${stack.standalone}`,
    );
  }
  const protein = byId.get('synthobs-protein-folding-prime-container-2026-09');
  if (protein) {
    extras.push(
      `Protein folding prime-container: ${protein.file} · ${protein.shipBlogPath} · suite ${protein.suite} · standalone ${protein.standalone}`,
    );
  }
  const storage = byId.get('synthobs-prime-indexed-volumetric-storage-2026-09');
  if (storage) {
    extras.push(
      `Prime-indexed volumetric storage: ${storage.file} · ${storage.shipBlogPath} · suite ${storage.suite} · standalone ${storage.standalone}`,
    );
  }
  // Application companions — protocol + demo / org ships, not Infinite Octaves engine-shelf pins.
  extras.push(
    'Enterprise gateway · PDVSA ops (application companion · not engine pin): docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md · /special-projects/pdvsa-gateway-ops · /ship-blog/pdvsa-gateway-ops-mockup · suite research/synthobs-pdvsa-gateway-ops-mockup/ · rhyme docs/SYNTHOBS_IBM_SNA_TCPIP_GATEWAY_OMNI_LATTICE_2026-09.md',
  );
  extras.push(
    'Macro-protein work engine (application companion · not engine pin): docs/SYNTHOBS_MACRO_PROTEIN_WORK_ENGINE_EGS_2026-09.md · /ship-blog/macro-protein-work-engine · suite research/synthobs-macro-protein-work-engine/ · standalone FractiAI/synthobs-macro-protein-work-engine',
  );

  return `Narrative foundation: ${[...narrative, ...extras].join('. ')}.`;
}

export function renderPemShelfTableMarkdown(shelf = listEngineShelf(true)) {
  const lines = [
    '| # | Role | Path / ID |',
    '|---|------|-----------|',
  ];
  for (const e of shelf) {
    const pathBits = [];
    if (e.file) {
      const link = e.href && e.registryId ? `[${e.file}](${e.href})` : `\`${e.file}\``;
      pathBits.push(link);
    }
    if (e.registryId) pathBits.push(`registry \`${e.registryId}\``);
    if (e.shipBlogPath) pathBits.push(`\`${e.shipBlogPath}\``);
    if (e.suite) pathBits.push(`suite \`${e.suite}\``);
    if (e.standalone) pathBits.push(`standalone \`${e.standalone}\``);
    if (e.extra) pathBits.push(`· \`${e.extra}\``);
    lines.push(`| ${e.order} | ${e.role} | ${pathBits.join(' · ') || '—'} |`);
  }
  lines.push('');
  lines.push(
    `_Living engine shelf · **${shelf.length}** steps · regenerated by \`npm run sync:lattice-pem\` from \`lib/infinite-octave-engine-shelf.mjs\`._`,
  );
  return lines.join('\n');
}

export function renderPemMetaMarkdown(shelf = listEngineShelf(true), when = new Date()) {
  const iso = when.toISOString().slice(0, 10);
  const paperCount = shelf.filter((e) => e.registryId).length;
  return [
    `**Engine shelf sync:** ${iso} · **${shelf.length}** ordered steps (**${paperCount}** registry papers) · generator \`npm run sync:lattice-pem\``,
    '',
    'When a paper is **added to the Infinite Octaves engine pin**, append it to `ENGINE_SHELF` in `lib/infinite-octave-engine-shelf.mjs`, then re-run the sync (Cursor PRA stop hook does this automatically for matching engine / PEM / AGENT_SYNC edits). Digits × Octaves 01–99 remain the practical Story-depth map — not a second product brand. Application companions (PDVSA, macro-protein, …) stay off this shelf.',
  ].join('\n');
}

export function renderAgentSyncStackMarkdown(shelf = listEngineShelf(true)) {
  const lines = [
    '| # | Role | Path / ID |',
    '|---|------|-----------|',
  ];
  for (const e of shelf) {
    const bits = [];
    if (e.file) bits.push(`\`${e.file}\``);
    if (e.registryId) bits.push(`\`${e.registryId}\``);
    if (e.shipBlogPath) bits.push(`\`${e.shipBlogPath}\``);
    if (e.suite) bits.push(`suite \`${e.suite}\``);
    if (e.standalone) bits.push(`standalone \`${e.standalone}\``);
    if (e.extra) bits.push(`· \`${e.extra}\``);
    lines.push(`| ${e.order} | **${e.role}** | ${bits.join(' · ') || '—'} |`);
  }
  return lines.join('\n');
}

export function renderAgentSyncSuitesMarkdown(shelf = listEngineShelf(true)) {
  const suites = shelf.map((e) => e.suite).filter(Boolean);
  return suites.map((s) => `- \`${s}\``).join('\n');
}

export function nextEngineShelfOrder() {
  return Math.max(...ENGINE_SHELF.map((e) => e.order)) + 1;
}
