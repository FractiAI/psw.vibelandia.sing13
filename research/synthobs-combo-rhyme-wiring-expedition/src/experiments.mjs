import {
  DOC_ID, REGISTRY_ID, SEED, PHI_EGS, ENGINE_SHELF_PINNED, HONESTY, PRIOR_WIRING, MIN_COUPLING_NEW,
} from './constants.mjs';
import {
  loadUnifiedCatalog,
  loadStringPanel,
  loadNewCandidateWiring,
  loadOpenTargetsBridge,
  loadEuropePmc,
  loadChromosomeLoci,
} from './load.mjs';
import { loadExonFeatureObjects } from '../../synthobs-npy-sod1-rhyme-validation/src/load.mjs';
import {
  cosine,
  zScoreColumns,
} from '../../synthobs-npy-sod1-rhyme-validation/src/math.mjs';
import { EXON_FEATURE_KEYS } from '../../synthobs-npy-sod1-rhyme-validation/src/constants.mjs';

function geneToken(id) {
  if (!id || typeof id !== 'string') return null;
  const m = id.match(/^([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function extractGenomePairs(discoveries, rhyme) {
  const out = [];
  for (const d of discoveries || []) {
    const th = String(d.theater || '').toLowerCase();
    if (!th.includes('genome') && !th.includes('exon') && !th.includes('chrm')) continue;
    let a = null;
    let b = null;
    if (d.discoveryId && d.discoveryId.includes('↔')) {
      const parts = d.discoveryId.split('↔').map((s) => s.trim());
      a = geneToken(parts[0]);
      b = geneToken(parts[1]);
    } else if (d.queryId && d.partnerId) {
      a = geneToken(d.queryId);
      b = geneToken(d.partnerId);
    }
    if (!a || !b || a === b) continue;
    // skip chrM self-pairs
    if (a === 'chrM' || b === 'chrM') continue;
    out.push({
      a, b, key: pairKey(a, b),
      coupling: Number(d.coupling) || 0,
      theater: d.theater,
      rhyme,
      kind: d.kind,
      discoveryId: d.discoveryId,
    });
  }
  return out;
}

function mergePairs(rows) {
  const map = new Map();
  for (const r of rows) {
    const cur = map.get(r.key) || {
      a: r.a, b: r.b, key: r.key,
      maxCoupling: 0, rhymes: new Set(), theaters: new Set(), n: 0, examples: [],
    };
    cur.maxCoupling = Math.max(cur.maxCoupling, r.coupling);
    cur.rhymes.add(r.rhyme);
    cur.theaters.add(r.theater);
    cur.n += 1;
    if (cur.examples.length < 3) cur.examples.push(r.discoveryId);
    map.set(r.key, cur);
  }
  return [...map.values()].map((r) => ({
    a: r.a, b: r.b, key: r.key,
    maxCoupling: r.maxCoupling,
    rhymes: [...r.rhymes].sort(),
    theaters: [...r.theaters],
    n: r.n,
    crossRhyme: r.rhymes.size >= 2,
    examples: r.examples,
    label: `${r.a}↔${r.b}`,
  })).sort((x, y) => (Number(y.crossRhyme) - Number(x.crossRhyme)) || y.maxCoupling - x.maxCoupling);
}

export function runExpedition() {
  const catalog = loadUnifiedCatalog();
  const stringPanel = loadStringPanel();
  const wiringMeta = loadNewCandidateWiring();

  const protein = catalog.proteinFoldingRhyme || { n: 0, discoveries: [] };
  const llm = catalog.llmRhyme || { n: 0, discoveries: [] };
  const pilot = catalog.pilotRhyme || { n: 0, discoveries: [] };

  const e1 = {
    id: 'E1',
    name: 'load_three_rhyme_catalogs',
    proteinFolding: { n: protein.n, kinds: [...new Set((protein.discoveries || []).map((d) => d.kind))] },
    llm: { n: llm.n },
    pilot: { n: pilot.n },
    catalogGeneratedAt: catalog.generatedAt || null,
    passes: protein.n > 0 && llm.n > 0 && pilot.n > 0,
  };

  const genomeRows = [
    ...extractGenomePairs(llm.discoveries, 'llm'),
    ...extractGenomePairs(pilot.discoveries, 'pilot'),
  ];
  const merged = mergePairs(genomeRows);
  const cross = merged.filter((p) => p.crossRhyme);
  const e2 = {
    id: 'E2',
    name: 'merge_genome_partners_across_llm_and_pilot',
    nGenomeHits: genomeRows.length,
    nUniquePairs: merged.length,
    nCrossRhyme: cross.length,
    topPairs: merged.slice(0, 12),
    crossRhymePairs: cross,
    passes: merged.length >= 5 && cross.length >= 2,
  };

  // STRING classify
  const stringByKey = {};
  for (const [k, v] of Object.entries(stringPanel.pairs || {})) {
    const key = pairKey(v.a, v.b);
    stringByKey[key] = v;
  }
  const classified = merged.map((p) => {
    const s = stringByKey[p.key];
    let stringClass = 'unqueried';
    let stringScore = null;
    let stringEmpty = null;
    if (s) {
      stringEmpty = !!s.empty;
      stringScore = s.maxScore ?? 0;
      if (s.empty) stringClass = 'string_empty';
      else if ((s.maxScore || 0) >= 0.9) stringClass = 'string_known_strong';
      else stringClass = 'string_known_partial';
    }
    const prior = PRIOR_WIRING.has(p.key);
    return { ...p, stringClass, stringScore, stringEmpty, priorWiringCompanion: prior };
  });

  const e3 = {
    id: 'E3',
    name: 'string_classify_panel',
    source: stringPanel.source,
    fetchedAt: stringPanel.fetchedAt,
    controlInsPomc: stringPanel.pairs?.['INS-POMC'] || null,
    classified: classified.map((c) => ({
      label: c.label, crossRhyme: c.crossRhyme, maxCoupling: c.maxCoupling,
      rhymes: c.rhymes, stringClass: c.stringClass, stringScore: c.stringScore,
      priorWiringCompanion: c.priorWiringCompanion,
    })),
    passes: (stringPanel.pairs?.['INS-POMC']?.maxScore || 0) >= 0.9,
  };

  const newEmpty = classified.filter(
    (c) => c.stringEmpty === true && !c.priorWiringCompanion && c.maxCoupling >= MIN_COUPLING_NEW,
  );
  const e4 = {
    id: 'E4',
    name: 'surface_new_string_empty_wiring_candidates',
    minCoupling: MIN_COUPLING_NEW,
    nNewEmpty: newEmpty.length,
    candidates: newEmpty,
    wiringMeta: wiringMeta.newEmptyCandidates,
    passes: newEmpty.length >= 1,
  };

  const foldContacts = (protein.discoveries || []).filter((d) => d.kind === 'aware_only_long_range_contact');
  const e5 = {
    id: 'E5',
    name: 'protein_folding_rhyme_grammar_attestation',
    nProteinCatalog: protein.n,
    nAwareLongRangeContacts: foldContacts.length,
    role: 'Protein-folding rhyme supplies the long-range partner-recovery grammar reused by LLM and Pilot language/world-model rhymes.',
    sample: foldContacts.slice(0, 5).map((d) => d.discoveryId),
    passes: foldContacts.length >= 5,
  };

  const e6 = {
    id: 'E6',
    name: 'combo_wiring_discovery_gate',
    requires: [
      'three rhyme catalogs loaded',
      'cross-rhyme genome pairs exist',
      'STRING control INS↔POMC ≥ 0.9',
      '≥1 new STRING-empty candidate above coupling floor',
      'protein-folding grammar attested',
    ],
    passes: e1.passes && e2.passes && e3.passes && e4.passes && e5.passes,
    headlineCandidates: newEmpty.map((c) => c.label),
  };

  // E7 · multi-layer bridge thickening for the same pairs
  const ot = loadOpenTargetsBridge();
  const epmc = loadEuropePmc();
  const chrom = loadChromosomeLoci();
  const objects = loadExonFeatureObjects();
  const { zObjects } = zScoreColumns(objects, [...EXON_FEATURE_KEYS]);

  function diseaseIds(sym) {
    return new Set((ot.genes?.[sym]?.topDiseases || []).map((d) => d.id));
  }
  function diseaseJaccard(a, b) {
    const A = diseaseIds(a);
    const B = diseaseIds(b);
    if (!A.size || !B.size) return { jaccard: 0, inter: 0, sharedNames: [] };
    let inter = 0;
    const sharedNames = [];
    for (const id of A) {
      if (B.has(id)) {
        inter += 1;
        const row = (ot.genes[a].topDiseases || []).find((d) => d.id === id);
        if (row) sharedNames.push(row.name);
      }
    }
    const union = A.size + B.size - inter;
    return {
      jaccard: union ? inter / union : 0,
      inter,
      sharedNames: sharedNames.slice(0, 6),
    };
  }
  function sameChromosome(a, b) {
    const A = new Set(chrom.genes?.[a] || []);
    const B = new Set(chrom.genes?.[b] || []);
    for (const c of A) if (B.has(c)) return { same: true, chr: c };
    return { same: false, chr: null };
  }
  function bestExonCoupling(a, b) {
    const A = zObjects.filter((o) => o.symbol === a);
    const B = zObjects.filter((o) => o.symbol === b);
    let max = -1;
    for (const x of A) for (const y of B) max = Math.max(max, cosine(x.z, y.z));
    return max;
  }
  function exonRank(a, b) {
    const syms = [...new Set(zObjects.map((o) => o.symbol))].sort();
    const rows = [];
    for (let i = 0; i < syms.length; i++) {
      for (let j = i + 1; j < syms.length; j++) {
        rows.push({
          key: pairKey(syms[i], syms[j]),
          maxCoupling: bestExonCoupling(syms[i], syms[j]),
        });
      }
    }
    rows.sort((x, y) => y.maxCoupling - x.maxCoupling);
    const k = pairKey(a, b);
    const idx = rows.findIndex((r) => r.key === k);
    return {
      rank: idx + 1,
      nPairs: rows.length,
      maxCoupling: idx >= 0 ? rows[idx].maxCoupling : 0,
    };
  }

  const bridgeFocus = [
    ...newEmpty.map((c) => ({ a: c.a, b: c.b, key: c.key, label: c.label, role: 'new_empty' })),
    { a: 'NPY', b: 'SOD1', key: 'NPY|SOD1', label: 'NPY↔SOD1', role: 'prior_peer' },
    { a: 'APP', b: 'DNMT3A', key: 'APP|DNMT3A', label: 'APP↔DNMT3A', role: 'prior_peer' },
    { a: 'INS', b: 'POMC', key: 'INS|POMC', label: 'INS↔POMC', role: 'control' },
  ];

  const bridgeProfiles = bridgeFocus.map((p) => {
    const mergedHit = classified.find((c) => c.key === p.key);
    const llmHit = (mergedHit?.rhymes || []).includes('llm');
    const pilotHit = (mergedHit?.rhymes || []).includes('pilot');
    const dj = diseaseJaccard(p.a, p.b);
    const locus = sameChromosome(p.a, p.b);
    const exon = exonRank(p.a, p.b);
    const lit = epmc.pairs?.[p.key]?.count ?? 0;
    const layers = {
      llmRhyme: llmHit,
      pilotRhyme: pilotHit,
      crossRhyme: llmHit && pilotHit,
      diseaseRail: dj.inter > 0,
      literatureComention: lit > 0,
      exonCosineTopHalf: exon.rank > 0 && exon.rank <= Math.ceil(exon.nPairs / 2),
      sameChromosome: locus.same,
    };
    // Thickening layers exclude sameChromosome as a positive disease-wiring vote —
    // it is scored separately as a possible locus confounder.
    const thickeningLayerCount = [
      layers.llmRhyme,
      layers.pilotRhyme,
      layers.diseaseRail,
      layers.literatureComention,
      layers.exonCosineTopHalf,
    ].filter(Boolean).length;
    const thickened =
      thickeningLayerCount >= 3 && layers.diseaseRail && !layers.sameChromosome;
    const thinOrConfounded =
      (!layers.diseaseRail && layers.sameChromosome) || thickeningLayerCount <= 2;
    return {
      ...p,
      coupling: mergedHit?.maxCoupling ?? null,
      layers,
      diseaseJaccard: dj.jaccard,
      diseaseShared: dj.sharedNames,
      literatureCount: lit,
      exon,
      locus,
      thickeningLayerCount,
      bridgeVerdict: thickened
        ? 'THICKENED — multi-layer disease-context wire (not locus-only)'
        : thinOrConfounded
          ? locus.same && !layers.diseaseRail
            ? 'THIN / CHR-CONFOUND RISK — rhyme without disease rail; same chromosome'
            : 'THIN — fewer independent bridging layers'
          : 'PARTIAL — some layers, not full thicken gate',
    };
  });

  const e7 = {
    id: 'E7',
    name: 'multi_layer_bridge_thickening',
    purpose:
      'Ask whether independent rhymes (LLM, Pilot, OpenTargets disease, EuropePMC co-mention, exon cosine) arrive at the same pairs — and whether same-chromosome locus confounds the join.',
    sources: {
      opentargets: ot.source,
      europepmc: epmc.source,
      chromosomes: chrom.source,
      exonPanel: 'synthobs-npy-sod1-rhyme-validation exon features',
    },
    profiles: bridgeProfiles,
    thickened: bridgeProfiles.filter((p) => p.bridgeVerdict.startsWith('THICKENED')),
    thinOrConfounded: bridgeProfiles.filter((p) => p.bridgeVerdict.startsWith('THIN')),
    passes: bridgeProfiles.some((p) => p.role === 'new_empty' && p.bridgeVerdict.startsWith('THICKENED')),
  };

  const thickenedLabels = e7.thickened.filter((p) => p.role === 'new_empty').map((p) => p.label);
  const thinLabels = e7.thinOrConfounded.filter((p) => p.role === 'new_empty').map((p) => p.label);

  return {
    documentId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: SEED,
    phiEgs: PHI_EGS,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    honesty: HONESTY,
    dataProvenance: {
      catalogs: 'data/RHYME_DISCOVERY_CATALOG.json (protein-folding + LLM + Pilot)',
      string: stringPanel.source,
      wiring: 'fixtures/wiring_new_candidates.json',
      opentargets: ot.source,
      europepmc: epmc.source,
      chromosomes: chrom.source,
    },
    experiments: { e1, e2, e3, e4, e5, e6, e7 },
    verdict: {
      comboWiringExpeditionPass: e6.passes,
      bridgeThickeningPass: e7.passes,
      newWiringCandidates: newEmpty.map((c) => ({
        label: c.label,
        maxCoupling: c.maxCoupling,
        rhymes: c.rhymes,
        stringEmpty: true,
      })),
      thickenedNewCandidates: thickenedLabels,
      thinOrConfoundedNewCandidates: thinLabels,
      crossRhymeRecoveries: cross.map((c) => c.label),
      summary: e6.passes
        ? `COMBO RHYME WIRING EXPEDITION PASS — new STRING-empty: ${newEmpty.map((c) => c.label).join(', ')}. Bridge thickening: thickened=${thickenedLabels.join(', ') || 'none'}; thin/confounded=${thinLabels.join(', ') || 'none'}. Not clinical; not ENGINE_SHELF.`
        : 'Combo rhyme wiring expedition gate failed.',
    },
  };
}
