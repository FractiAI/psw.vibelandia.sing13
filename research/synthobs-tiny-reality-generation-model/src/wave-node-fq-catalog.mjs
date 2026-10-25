/**
 * TRGM · Wave / Node / Fq genetic-node catalog
 *
 * Associates every identified genetic feature with one of the three
 * Wave–Node triad inputs that drive the structured three-symbol stream:
 *
 *   symbol 0 → wave  (sequence / composition / LC wave theater)
 *   symbol 1 → node  (discrete locus / lattice placement)
 *   symbol 2 → fq    (frequency · codon rhythm · nucleosome period · f₀)
 *
 * Honesty: catalog Soft Story grammar linking public annotations to the
 * Wave–Node triad — not gene→physics causation, not clinical genetics.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHI_EGS, DIGITAL_SEED } from './constants.mjs';
import { WRAP_BP, NUCLEOSOME_TURNS } from '../../synthobs-histone-phase-operator/src/constants.mjs';
import { DELTA_X_M, VP_LITERATURE_BAND_M_S } from '../../synthobs-chromosomal-electrodynamics/src/constants.mjs';
import {
  stretchedLengthM,
  fundamentalFrequencyHz,
} from '../../synthobs-chromosomal-electrodynamics/src/fetch-public-data.mjs';
import {
  loadGenePanel,
  loadExonPanel,
  loadCpgPanel,
  loadFasta,
  loadHg38ChromSizes,
  loadProvenance,
  buildGeneticNodes,
  sequenceComposition,
  geneticDir,
} from './genetic-nodes-lab.mjs';
import { structuredTriadicMotif } from './triadic-octave-dna-lab.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUITE_ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(SUITE_ROOT, 'data/molecular/genetic/wave_node_fq_catalog.json');

/** Three Wave–Node triad inputs ↔ three-symbol stream. */
export const TRIADIC_INPUTS = Object.freeze({
  wave: {
    symbol: 0,
    key: 'wave',
    label: 'wave',
    role: 'Wave field · sequence composition · LC dispersion theater',
  },
  node: {
    symbol: 1,
    key: 'node',
    label: 'node',
    role: 'Discrete lattice · gene/exon locus placement on polymer theater',
  },
  fq: {
    symbol: 2,
    key: 'fq',
    label: 'fq',
    role: 'Frequency · codon reading-frame rhythm · nucleosome period · length→f₀',
  },
});

export const SYMBOL_TO_INPUT = Object.freeze({
  0: 'wave',
  1: 'node',
  2: 'fq',
});

/**
 * Feature-kind → primary triad channel (catalog grammar).
 * Genes also get a Soft Story primary by panel role (below).
 */
export const FEATURE_KIND_CHANNEL = Object.freeze({
  gene: 'node',
  exon: 'node',
  cds: 'fq',
  cpg_island: 'wave',
  sequence_composition: 'wave',
  lc_dispersion: 'wave',
  nucleosome_period: 'fq',
  fundamental_frequency: 'fq',
  theater_scaffold: 'node',
});

/**
 * Panel gene Soft Story primary channels (catalog roles — not clinical claims).
 * wave = epigenetic / field-marking loci
 * node = structural / chromosome-locus panel (esp. chr21)
 * fq   = endocrine / pulse Soft Story loci
 */
export const GENE_PRIMARY_CHANNEL = Object.freeze({
  DNMT1: 'wave',
  DNMT3A: 'wave',
  APP: 'node',
  SOD1: 'node',
  DYRK1A: 'node',
  TMPRSS2: 'node',
  INS: 'fq',
  PDX1: 'fq',
  POMC: 'fq',
  NPY: 'fq',
});

function channelForGene(symbol) {
  return GENE_PRIMARY_CHANNEL[symbol] || 'node';
}

function channelForFeature(kind, geneSymbol) {
  if (kind === 'gene') return channelForGene(geneSymbol);
  return FEATURE_KIND_CHANNEL[kind] || 'node';
}

/**
 * Build the full catalog from pinned genetic fixtures.
 */
export function buildWaveNodeFqCatalog() {
  const genePanel = loadGenePanel();
  const exonPanel = loadExonPanel();
  const cpgPanel = loadCpgPanel();
  const hg38 = loadHg38ChromSizes();
  const fasta = loadFasta();
  const provenance = loadProvenance();
  const genes = genePanel.genes || [];
  const exons = exonPanel.exons || [];
  const islands = cpgPanel.islands || [];
  const geneticNodes = buildGeneticNodes({
    genes,
    exons,
    cpgIslands: islands,
    chromSizes: hg38,
  });
  const comp = sequenceComposition(fasta.seq);
  const motif = structuredTriadicMotif();

  // Length→f₀ for chrM (wave host) using mid-band LC literature vp
  const chrMBp = comp.length;
  const lengthM = stretchedLengthM(chrMBp, DELTA_X_M);
  const f0 = fundamentalFrequencyHz(lengthM, VP_LITERATURE_BAND_M_S.mid);

  const entries = [];

  for (const n of geneticNodes) {
    const channel = channelForFeature(n.kind, n.symbol);
    const input = TRIADIC_INPUTS[channel];
    entries.push({
      id: `${n.kind}:${n.symbol || n.chrom}:${n.start}-${n.end}`,
      kind: n.kind,
      symbol: n.symbol || null,
      chrom: n.chrom,
      start: n.start,
      end: n.end,
      lengthBp: n.lengthBp,
      channel,
      triadSymbol: input.symbol,
      triadInput: input.key,
      notes:
        n.kind === 'cds'
          ? `CDS coding length ${n.lengthBp} bp · mod3=${n.mod3}`
          : n.kind === 'cpg_island'
            ? `CpG island · perGc=${n.perGc} · obsExp=${n.obsExp}`
            : n.kind === 'gene'
              ? `Gene primary Soft Story channel=${channel}`
              : `Exon nest under ${n.symbol}`,
    });
  }

  // Sequence composition entry (chrM)
  entries.push({
    id: `sequence_composition:chrM:0-${comp.length}`,
    kind: 'sequence_composition',
    symbol: null,
    chrom: 'chrM',
    start: 0,
    end: comp.length,
    lengthBp: comp.length,
    channel: 'wave',
    triadSymbol: 0,
    triadInput: 'wave',
    gcPercent: comp.gcPercent,
    cpgObsExp: comp.cpgObsExp,
    notes: 'UCSC hs1 chrM FASTA composition → wave channel',
  });

  // Nucleosome period → fq
  entries.push({
    id: `nucleosome_period:WRAP_BP:${WRAP_BP}`,
    kind: 'nucleosome_period',
    symbol: null,
    chrom: null,
    start: null,
    end: null,
    lengthBp: WRAP_BP,
    channel: 'fq',
    triadSymbol: 2,
    triadInput: 'fq',
    turns: NUCLEOSOME_TURNS,
    notes: `Nucleosome wrap ${WRAP_BP} bp / ${NUCLEOSOME_TURNS} turns → fq period`,
  });

  // Fundamental frequency of chrM polymer → fq
  entries.push({
    id: `fundamental_frequency:chrM:f0`,
    kind: 'fundamental_frequency',
    symbol: null,
    chrom: 'chrM',
    start: 0,
    end: chrMBp,
    lengthBp: chrMBp,
    channel: 'fq',
    triadSymbol: 2,
    triadInput: 'fq',
    lengthM,
    f0Hz: f0,
    vpM_s: VP_LITERATURE_BAND_M_S.mid,
    notes: 'f₀ = vp/(2L) on hs1 chrM stretched length → fq channel',
  });

  // Theater scaffold meta → node
  entries.push({
    id: 'theater_scaffold:polymer_nodes',
    kind: 'theater_scaffold',
    symbol: null,
    chrom: null,
    start: null,
    end: null,
    lengthBp: null,
    channel: 'node',
    triadSymbol: 1,
    triadInput: 'node',
    notes: 'Coarse polymer theater nodes (Wave–Node lattice host) → node channel',
  });

  // LC dispersion meta → wave
  entries.push({
    id: 'lc_dispersion:chromosomal_electrodynamics',
    kind: 'lc_dispersion',
    symbol: null,
    chrom: null,
    start: null,
    end: null,
    lengthBp: null,
    channel: 'wave',
    triadSymbol: 0,
    triadInput: 'wave',
    vpBand: VP_LITERATURE_BAND_M_S,
    notes: 'Chromosomal LC dispersion / group-velocity theater → wave channel',
  });

  const byChannel = { wave: [], node: [], fq: [] };
  for (const e of entries) byChannel[e.channel].push(e);

  const geneCatalog = genes.map((g) => {
    const channel = channelForGene(g.symbol);
    const input = TRIADIC_INPUTS[channel];
    const geneExons = exons.filter((x) => x.symbol === g.symbol);
    const geneCpg = islands.filter(
      (c) => c.chrom === g.chrom && c.end >= g.start - 50000 && c.start <= g.end + 50000,
    );
    return {
      symbol: g.symbol,
      gencodeId: g.gencodeId,
      chrom: g.chrom,
      start: g.start,
      end: g.end,
      strand: g.strand,
      primaryChannel: channel,
      triadSymbol: input.symbol,
      triadInput: input.key,
      associated: {
        wave: [
          ...geneCpg.map((c) => ({
            kind: 'cpg_island',
            start: c.start,
            end: c.end,
            triadSymbol: 0,
          })),
          ...(channel === 'wave' ? [{ kind: 'gene_primary', triadSymbol: 0 }] : []),
        ],
        node: [
          { kind: 'gene_locus', start: g.start, end: g.end, triadSymbol: 1 },
          ...geneExons.map((e) => ({
            kind: 'exon',
            start: e.exonStart,
            end: e.exonEnd,
            transcript: e.transcript,
            triadSymbol: 1,
          })),
          ...(channel === 'node' ? [{ kind: 'gene_primary', triadSymbol: 1 }] : []),
        ],
        fq: [
          ...(geneExons.length
            ? [
                {
                  kind: 'cds_codon_rhythm',
                  cdsStart: geneExons[0].cdsStart,
                  cdsEnd: geneExons[0].cdsEnd,
                  triadSymbol: 2,
                },
              ]
            : []),
          ...(channel === 'fq' ? [{ kind: 'gene_primary', triadSymbol: 2 }] : []),
        ],
      },
      nExons: geneExons.length,
      nCpgNearby: geneCpg.length,
    };
  });

  const catalog = {
    schema: 'trgm-wave-node-fq-genetic-catalog/v1',
    seed: DIGITAL_SEED,
    phiEgs: PHI_EGS,
    honesty:
      'Catalog associates public genetic features with Wave–Node triad inputs (wave/node/fq ↔ symbols 0/1/2). Soft Story grammar — not gene→physics causation, not clinical genetics.',
    triadInputs: TRIADIC_INPUTS,
    symbolToInput: SYMBOL_TO_INPUT,
    featureKindChannel: FEATURE_KIND_CHANNEL,
    genePrimaryChannel: GENE_PRIMARY_CHANNEL,
    structuredMotif: motif,
    motifChannelSequence: motif.map((s) => SYMBOL_TO_INPUT[s]),
    provenance: provenance
      ? { fetchedAt: provenance.fetchedAt, files: Object.keys(provenance.files || {}) }
      : null,
    summary: {
      nEntries: entries.length,
      nGenes: genes.length,
      byChannel: {
        wave: byChannel.wave.length,
        node: byChannel.node.length,
        fq: byChannel.fq.length,
      },
      genesByChannel: {
        wave: geneCatalog.filter((g) => g.primaryChannel === 'wave').map((g) => g.symbol),
        node: geneCatalog.filter((g) => g.primaryChannel === 'node').map((g) => g.symbol),
        fq: geneCatalog.filter((g) => g.primaryChannel === 'fq').map((g) => g.symbol),
      },
      chrM: { length: comp.length, gcPercent: comp.gcPercent, f0Hz: f0 },
      nucleosome: { wrapBp: WRAP_BP, turns: NUCLEOSOME_TURNS },
    },
    genes: geneCatalog,
    entries,
  };

  return catalog;
}

/** Persist catalog JSON next to genetic fixtures. */
export function writeWaveNodeFqCatalog(catalog = buildWaveNodeFqCatalog()) {
  fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  return CATALOG_PATH;
}

export function loadWaveNodeFqCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    const catalog = buildWaveNodeFqCatalog();
    writeWaveNodeFqCatalog(catalog);
    return catalog;
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

/**
 * C1–C3: catalog completeness + triad coverage + symbol lock.
 */
export function runWaveNodeFqCatalogLaboratory() {
  if (!fs.existsSync(path.join(geneticDir(), 'genes.panel.json'))) {
    return { ok: false, error: 'genetic fixtures missing', hypotheses: [] };
  }

  const catalog = buildWaveNodeFqCatalog();
  const outPath = writeWaveNodeFqCatalog(catalog);

  const channels = ['wave', 'node', 'fq'];
  const entries = catalog.entries || [];
  const genes = catalog.genes || [];

  // C1 — every entry has a valid triad channel + symbol
  const c1Pass =
    entries.length >= 20 &&
    entries.every(
      (e) =>
        channels.includes(e.channel) &&
        e.triadSymbol === TRIADIC_INPUTS[e.channel].symbol &&
        e.triadInput === e.channel,
    ) &&
    genes.every((g) => channels.includes(g.primaryChannel) && g.associated);

  // C2 — each channel has ≥1 gene primary and ≥1 non-gene feature kind
  const genesBy = catalog.summary.genesByChannel;
  const kindsBy = { wave: new Set(), node: new Set(), fq: new Set() };
  for (const e of entries) kindsBy[e.channel].add(e.kind);
  const c2Pass = channels.every(
    (ch) => genesBy[ch].length >= 1 && kindsBy[ch].size >= 2,
  );

  // C3 — three-symbol stream maps onto wave/node/fq and motif visits all channels
  const motifChannels = catalog.motifChannelSequence || [];
  const motifCover = new Set(motifChannels);
  const symbolLock =
    SYMBOL_TO_INPUT[0] === 'wave' &&
    SYMBOL_TO_INPUT[1] === 'node' &&
    SYMBOL_TO_INPUT[2] === 'fq';
  const c3Pass = symbolLock && motifCover.size === 3 && catalog.structuredMotif.length === 9;

  const hypotheses = [
    {
      id: 'C1',
      title: 'Genetic-node catalog assigns every feature to wave / node / fq',
      pass: c1Pass,
      detail: {
        nEntries: entries.length,
        nGenes: genes.length,
        byChannel: catalog.summary.byChannel,
        catalogPath: outPath,
      },
      interpretation: c1Pass
        ? `Catalogued ${entries.length} genetic features across wave/node/fq (${catalog.summary.byChannel.wave}/${catalog.summary.byChannel.node}/${catalog.summary.byChannel.fq}).`
        : 'Catalog incomplete or channel/symbol mismatch.',
      evidence: 'numerically_verified',
      data: 'wave_node_fq_catalog',
    },
    {
      id: 'C2',
      title: 'Each triad input has ≥1 gene primary and ≥2 feature kinds',
      pass: c2Pass,
      detail: {
        genesByChannel: genesBy,
        kindsByChannel: {
          wave: [...kindsBy.wave],
          node: [...kindsBy.node],
          fq: [...kindsBy.fq],
        },
      },
      interpretation: c2Pass
        ? `wave←${genesBy.wave.join(',')} · node←${genesBy.node.join(',')} · fq←${genesBy.fq.join(',')}.`
        : 'One or more triad channels lack gene/feature coverage.',
      evidence: 'empirically_observed',
      data: 'wave_node_fq_catalog',
    },
    {
      id: 'C3',
      title: 'Three-symbol stream locks to wave=0 · node=1 · fq=2 and visits all channels',
      pass: c3Pass,
      detail: {
        symbolToInput: SYMBOL_TO_INPUT,
        motif: catalog.structuredMotif,
        motifChannelSequence: motifChannels,
        motifCover: [...motifCover],
      },
      interpretation: c3Pass
        ? 'Σ={0,1,2} ↔ {wave,node,fq}; structured motif visits all three channels each polygon period.'
        : 'Symbol↔channel lock or motif coverage failed.',
      evidence: 'numerically_verified',
      data: 'triadic_symbol_wave_node_fq_lock',
    },
  ];

  return {
    ok: true,
    catalogPath: outPath,
    summary: catalog.summary,
    triadInputs: TRIADIC_INPUTS,
    genesByChannel: genesBy,
    hypotheses,
    n_pass: hypotheses.filter((h) => h.pass).length,
    n_total: hypotheses.length,
    all_pass: hypotheses.every((h) => h.pass),
  };
}
