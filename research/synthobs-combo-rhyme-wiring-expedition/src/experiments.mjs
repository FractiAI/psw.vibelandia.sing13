import {
  DOC_ID, REGISTRY_ID, SEED, PHI_EGS, ENGINE_SHELF_PINNED, HONESTY, PRIOR_WIRING, MIN_COUPLING_NEW,
} from './constants.mjs';
import { loadUnifiedCatalog, loadStringPanel, loadNewCandidateWiring } from './load.mjs';

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
    },
    experiments: { e1, e2, e3, e4, e5, e6 },
    verdict: {
      comboWiringExpeditionPass: e6.passes,
      newWiringCandidates: newEmpty.map((c) => ({
        label: c.label,
        maxCoupling: c.maxCoupling,
        rhymes: c.rhymes,
        stringEmpty: true,
      })),
      crossRhymeRecoveries: cross.map((c) => c.label),
      summary: e6.passes
        ? `COMBO RHYME WIRING EXPEDITION PASS — protein-folding + LLM + Pilot catalogs surface ${newEmpty.length} new STRING-empty wiring candidate(s): ${newEmpty.map((c) => c.label).join(', ')}. Cross-rhyme recoveries include ${cross.map((c) => c.label).join(', ')}. Not clinical; not ENGINE_SHELF.`
        : 'Combo rhyme wiring expedition gate failed.',
    },
  };
}
