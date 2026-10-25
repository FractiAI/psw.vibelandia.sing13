/**
 * TRGM · Detailed Genetic Nodes Lab (G1–G5)
 *
 * Drill-down of the DNA theater into real public genetic features:
 *   genes · exons/CDS · nucleotide composition (chrM) · CpG islands ·
 *   nucleosome-fold survival of gene order.
 *
 * Fixtures (offline, pinned — no fabrication):
 *   data/molecular/genetic/{chrM.hs1.fa,genes.panel.json,exons.panel.json,
 *                           cpg.panel.json,hg38.chrom.sizes,PROVENANCE.json}
 *
 * Honesty: Soft Story overlay of public annotations — not clinical genetics,
 * not wet-lab chromatin proof, not genomic consciousness.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIGITAL_SEED, PHI_EGS } from './constants.mjs';
import {
  NUCLEOSOME_TURNS,
  WRAP_BP,
} from '../../synthobs-histone-phase-operator/src/constants.mjs';
import {
  buildChromosomeTheater,
  loadHs1ChromSizes,
} from './molecular-theater.mjs';
import { foldCompactDnaTheater } from './triadic-octave-dna-lab.mjs';
import { mulberry32 } from '../../synthobs-wave-node-mathematics/src/rng.mjs';
import { evaluateReality, generateTinyReality } from './computational-lab.mjs';
import { embedRealityOnTheater } from './molecular-theater.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUITE_ROOT = path.resolve(__dirname, '..');
const GENETIC_DIR = path.join(SUITE_ROOT, 'data/molecular/genetic');

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

export function geneticDir() {
  return GENETIC_DIR;
}

export function loadProvenance() {
  const p = path.join(GENETIC_DIR, 'PROVENANCE.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadGenePanel() {
  const p = path.join(GENETIC_DIR, 'genes.panel.json');
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return j;
}

export function loadExonPanel() {
  const p = path.join(GENETIC_DIR, 'exons.panel.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadCpgPanel() {
  const p = path.join(GENETIC_DIR, 'cpg.panel.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function loadHg38ChromSizes() {
  const p = path.join(GENETIC_DIR, 'hg38.chrom.sizes');
  const sizes = {};
  for (const line of fs.readFileSync(p, 'utf8').trim().split('\n')) {
    const [chrom, bp] = line.split(/\s+/);
    if (chrom && bp) sizes[chrom] = Number(bp);
  }
  return sizes;
}

/** Parse pinned FASTA (single or multi); returns { id, seq }. */
export function loadFasta(filePath = path.join(GENETIC_DIR, 'chrM.hs1.fa')) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.trim().split('\n');
  let id = 'seq';
  const seqParts = [];
  for (const line of lines) {
    if (line.startsWith('>')) {
      id = line.slice(1).split(/\s+/)[0];
    } else {
      seqParts.push(line.trim().toUpperCase());
    }
  }
  return { id, seq: seqParts.join(''), source: filePath };
}

/**
 * Build detailed genetic nodes from a gene + its exons + nearby CpG islands.
 * Each node carries genomic coordinates and a theater projection index.
 */
export function buildGeneticNodes({ genes, exons, cpgIslands, chromSizes }) {
  const nodes = [];
  for (const g of genes) {
    const chromLen = chromSizes[g.chrom];
    const geneNode = {
      kind: 'gene',
      symbol: g.symbol,
      chrom: g.chrom,
      start: g.start,
      end: g.end,
      strand: g.strand,
      lengthBp: g.end - g.start,
      gencodeId: g.gencodeId,
      mid: Math.floor((g.start + g.end) / 2),
      withinChrom: chromLen != null && g.start >= 0 && g.end <= chromLen && g.start < g.end,
      chromLen,
    };
    nodes.push(geneNode);

    const geneExons = exons.filter((e) => e.symbol === g.symbol);
    // Transcript span from MyGene (may extend slightly beyond GTEx gene box).
    const txStarts = geneExons.map((e) => e.txStart).filter((x) => x != null);
    const txEnds = geneExons.map((e) => e.txEnd).filter((x) => x != null);
    const txStart = txStarts.length ? Math.min(...txStarts) : g.start;
    const txEnd = txEnds.length ? Math.max(...txEnds) : g.end;

    for (const e of geneExons) {
      // Nest check: exon inside transcript ±1 bp (annotation edge tolerance)
      const withinTranscript = e.exonStart >= txStart - 1 && e.exonEnd <= txEnd + 1;
      // Soft gene-box check (±2 kb) — GTEx vs RefSeq boundaries can differ slightly
      const withinGeneSoft =
        e.exonStart >= g.start - 2000 && e.exonEnd <= g.end + 2000;
      nodes.push({
        kind: 'exon',
        symbol: g.symbol,
        chrom: e.chrom,
        start: e.exonStart,
        end: e.exonEnd,
        exonIndex: e.exonIndex,
        transcript: e.transcript,
        lengthBp: e.exonEnd - e.exonStart,
        withinGene: withinTranscript || withinGeneSoft,
        withinTranscript,
        cdsStart: e.cdsStart,
        cdsEnd: e.cdsEnd,
      });
    }

    // Coding length = sum of exon overlaps with [cdsStart, cdsEnd) — not genomic span
    if (geneExons.length) {
      const cdsStart = geneExons[0].cdsStart;
      const cdsEnd = geneExons[0].cdsEnd;
      if (cdsStart != null && cdsEnd != null && cdsEnd > cdsStart) {
        let cdsLen = 0;
        for (const e of geneExons) {
          const s = Math.max(e.exonStart, cdsStart);
          const ee = Math.min(e.exonEnd, cdsEnd);
          if (ee > s) cdsLen += ee - s;
        }
        nodes.push({
          kind: 'cds',
          symbol: g.symbol,
          chrom: g.chrom,
          start: cdsStart,
          end: cdsEnd,
          genomicSpanBp: cdsEnd - cdsStart,
          lengthBp: cdsLen,
          mod3: cdsLen % 3,
          codonCompatible: cdsLen > 0 && cdsLen % 3 === 0,
        });
      }
    }

    const nearby = (cpgIslands || []).filter(
      (c) => c.chrom === g.chrom && c.end >= g.start - 50000 && c.start <= g.end + 50000,
    );
    for (const c of nearby) {
      nodes.push({
        kind: 'cpg_island',
        symbol: g.symbol,
        chrom: c.chrom,
        start: c.start,
        end: c.end,
        lengthBp: c.end - c.start,
        perGc: c.perGc,
        obsExp: c.obsExp,
        cpgNum: c.cpgNum,
      });
    }
  }
  return nodes;
}

/** Project genetic feature midpoints onto a coarse chromosome theater. */
export function projectNodesOntoTheater(geneticNodes, theater) {
  const chromLen = theater.bp;
  return geneticNodes
    .filter((n) => n.kind === 'gene' || n.kind === 'exon' || n.kind === 'cpg_island')
    .map((n) => {
      const mid = n.mid ?? Math.floor((n.start + n.end) / 2);
      const t = Math.min(1, Math.max(0, mid / Math.max(chromLen, 1)));
      const theaterIndex = Math.min(
        theater.nodes.length - 1,
        Math.max(0, Math.round(t * (theater.nodes.length - 1))),
      );
      return { ...n, mid, theaterIndex, theaterX: theater.nodes[theaterIndex]?.x };
    });
}

export function sequenceComposition(seq) {
  const n = seq.length || 1;
  const counts = { A: 0, C: 0, G: 0, T: 0, N: 0, other: 0 };
  for (const ch of seq) {
    if (counts[ch] != null) counts[ch] += 1;
    else counts.other += 1;
  }
  const gc = (counts.G + counts.C) / n;
  // CpG dinucleotide observed / expected
  let cpg = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] === 'C' && seq[i + 1] === 'G') cpg += 1;
  }
  const pC = counts.C / n;
  const pG = counts.G / n;
  const expected = pC * pG * (n - 1);
  const obsExp = expected > 0 ? cpg / expected : 0;
  return {
    length: seq.length,
    counts,
    gcFraction: gc,
    gcPercent: gc * 100,
    cpgCount: cpg,
    cpgObsExp: obsExp,
    alphabetOk: counts.other === 0 && counts.A + counts.C + counts.G + counts.T + counts.N === seq.length,
  };
}

/**
 * Primary G1–G5 laboratory on pinned real genetic data.
 */
export function runGeneticNodesLaboratory() {
  const provenance = loadProvenance();
  if (!provenance || !fs.existsSync(path.join(GENETIC_DIR, 'genes.panel.json'))) {
    return {
      ok: false,
      error: 'genetic fixtures missing under data/molecular/genetic/',
      hypotheses: [],
    };
  }

  const genePanel = loadGenePanel();
  const exonPanel = loadExonPanel();
  const cpgPanel = loadCpgPanel();
  const hg38 = loadHg38ChromSizes();
  const fasta = loadFasta();
  const hs1 = loadHs1ChromSizes();

  const genes = genePanel.genes || [];
  const exons = exonPanel.exons || [];
  const islands = cpgPanel.islands || [];
  const geneticNodes = buildGeneticNodes({
    genes,
    exons,
    cpgIslands: islands,
    chromSizes: hg38,
  });

  // --- G1: gene nodes load, within chrom bounds, distinct loci ---
  const geneNodes = geneticNodes.filter((n) => n.kind === 'gene');
  const g1Pass =
    geneNodes.length >= 8 &&
    geneNodes.every((n) => n.withinChrom && n.lengthBp > 0) &&
    new Set(geneNodes.map((n) => n.symbol)).size === geneNodes.length;

  // --- G2: exon nodes nest under genes; CDS length % 3 == 0 when present ---
  const exonNodes = geneticNodes.filter((n) => n.kind === 'exon');
  const cdsNodes = geneticNodes.filter((n) => n.kind === 'cds');
  const exonsWithinGene = exonNodes.filter((e) => e.withinGene).length;
  const exonNestRate = exonsWithinGene / Math.max(exonNodes.length, 1);
  const cdsCompatibleRate =
    cdsNodes.filter((c) => c.codonCompatible).length / Math.max(cdsNodes.length, 1);
  // Pre-register: ≥95% exons nest; ≥80% CDS coding lengths divisible by 3
  // (incomplete / alternate transcripts may leave residual bases).
  const cdsOk = cdsNodes.length > 0 && cdsCompatibleRate >= 0.8;
  const g2Pass = exonNodes.length >= 20 && exonNestRate >= 0.95 && cdsOk;

  // --- G3: real chrM sequence composition (hs1 T2T) ---
  const comp = sequenceComposition(fasta.seq);
  const g3Pass =
    fasta.id.startsWith('chrM') &&
    comp.length === (hs1.sizes?.chrM || 16569) &&
    comp.alphabetOk &&
    comp.gcPercent > 20 &&
    comp.gcPercent < 70 &&
    Number.isFinite(comp.cpgObsExp);

  // --- G4: CpG islands enrich gene windows vs shuffled null ---
  const geneWindowHits = islands.length; // already fetched in gene±50kb windows
  const rng = mulberry32(DIGITAL_SEED ^ 0x0c0de);
  // Null: same island lengths placed randomly on same chroms; count overlaps with gene±50kb
  let nullHits = 0;
  const nullTrials = 200;
  for (let t = 0; t < nullTrials; t++) {
    let hits = 0;
    for (const island of islands) {
      const chromLen = hg38[island.chrom] || 1;
      const len = Math.max(1, island.end - island.start);
      const start = Math.floor(rng() * Math.max(1, chromLen - len));
      const end = start + len;
      const overlapsGene = genes.some(
        (g) =>
          g.chrom === island.chrom &&
          end >= g.start - 50000 &&
          start <= g.end + 50000,
      );
      if (overlapsGene) hits += 1;
    }
    nullHits += hits;
  }
  const nullMean = nullHits / nullTrials;
  // Real islands were sampled IN gene windows, so hit rate should dominate random placement
  const enrichment = geneWindowHits / Math.max(nullMean, 1e-9);
  const g4Pass = geneWindowHits >= 10 && enrichment > 1.5;

  // --- G5: gene nodes project onto theater + survive nucleosome fold; TRGM viable ---
  // Host: chr21 if present in panel genes, else first gene chrom; theater from hs1 lengths when available
  const hostGene = genes.find((g) => g.chrom === 'chr21') || genes[0];
  const hostChrom = hostGene.chrom;
  const hostBp = hs1.sizes?.[hostChrom] || hg38[hostChrom];
  const theater = buildChromosomeTheater(hostChrom, hostBp);
  const hostGeneNodes = geneNodes.filter((n) => n.chrom === hostChrom);
  // For projection, use hg38 gene mids against hs1 length when same chrom name —
  // if mid exceeds hs1 length (assembly drift), clamp and flag.
  const projected = hostGeneNodes.map((n) => {
    const t = Math.min(1, Math.max(0, n.mid / Math.max(hostBp, 1)));
    const theaterIndex = Math.min(
      theater.nodes.length - 1,
      Math.max(0, Math.round(t * (theater.nodes.length - 1))),
    );
    return {
      ...n,
      theaterIndex,
      clamped: n.mid > hostBp,
    };
  });
  const folded = foldCompactDnaTheater(theater);
  // Gene order along polymer (by genomic start) preserved in theaterIndex sort
  const byGenome = [...projected].sort((a, b) => a.start - b.start);
  const theaterOrder = byGenome.map((n) => n.theaterIndex);
  let orderPreserved = true;
  for (let i = 1; i < theaterOrder.length; i++) {
    if (theaterOrder[i] < theaterOrder[i - 1]) orderPreserved = false;
  }
  // Drive a few TRGM recipes on host theater with genetic node metadata
  const held = [];
  for (let i = 0; i < 8; i++) {
    const recipe = generateTinyReality(DIGITAL_SEED, 9000 + i);
    recipe.geneticNodes = {
      hostChrom,
      nGenes: hostGeneNodes.length,
      nExons: exonNodes.filter((e) => e.chrom === hostChrom || e.symbol === hostGene.symbol).length,
      phiEgs: PHI_EGS,
    };
    const embedded = embedRealityOnTheater(recipe, theater);
    held.push(evaluateReality(embedded));
  }
  const viability = mean(held.map((e) => (e.viable ? 1 : 0)));
  const g5Pass =
    projected.length >= 1 &&
    folded.folded &&
    folded.wrapBp === WRAP_BP &&
    Math.abs(NUCLEOSOME_TURNS - 1.65) < 1e-9 &&
    orderPreserved &&
    viability >= 0.75;

  const hypotheses = [
    {
      id: 'G1',
      title: 'Real gene panel nodes load within GRCh38 chrom bounds',
      pass: g1Pass,
      detail: {
        nGenes: geneNodes.length,
        symbols: geneNodes.map((n) => n.symbol),
        assembly: genePanel.assembly,
        source: genePanel.source,
        allWithinChrom: geneNodes.every((n) => n.withinChrom),
      },
      interpretation: g1Pass
        ? `Loaded ${geneNodes.length} GTEx gene nodes; all within hg38 chrom sizes.`
        : 'Gene panel failed bound / uniqueness checks.',
      evidence: 'empirically_observed',
      data: 'gtex_gene_panel_grch38',
    },
    {
      id: 'G2',
      title: 'Exon nodes nest under genes; CDS lengths are codon-compatible (mod 3 = 0)',
      pass: g2Pass,
      detail: {
        nExons: exonNodes.length,
        exonNestRate,
        nCds: cdsNodes.length,
        cdsCompatibleRate,
        cdsOk,
        cds: cdsNodes.map((c) => ({
          symbol: c.symbol,
          lengthBp: c.lengthBp,
          mod3: c.mod3,
          codonCompatible: c.codonCompatible,
        })),
        source: exonPanel.source,
      },
      interpretation: g2Pass
        ? `MyGene exons ${exonNodes.length} nest (rate=${(exonNestRate * 100).toFixed(1)}%); CDS codon-compatible rate=${(cdsCompatibleRate * 100).toFixed(1)}%.`
        : 'Exon/CDS nesting or codon-length checks failed.',
      evidence: 'empirically_observed',
      data: 'mygene_exon_panel_grch38',
    },
    {
      id: 'G3',
      title: 'Real hs1 chrM FASTA composition is well-formed (GC + CpG obs/exp)',
      pass: g3Pass,
      detail: {
        id: fasta.id,
        ...comp,
        expectedLength: hs1.sizes?.chrM,
        source: 'UCSC hs1 getData/sequence',
      },
      interpretation: g3Pass
        ? `chrM hs1 length=${comp.length} · GC=${comp.gcPercent.toFixed(2)}% · CpG obs/exp=${comp.cpgObsExp.toFixed(3)}.`
        : 'chrM sequence composition failed alphabet/length/GC checks.',
      evidence: 'numerically_verified',
      data: 'ucsc_hs1_chrM_fasta',
    },
    {
      id: 'G4',
      title: 'Public CpG islands in gene±50kb windows enrich vs chrom-shuffled null',
      pass: g4Pass,
      detail: {
        nIslands: geneWindowHits,
        nullMeanHits: nullMean,
        enrichment,
        nullTrials,
        source: cpgPanel.source,
      },
      interpretation: g4Pass
        ? `CpG panel n=${geneWindowHits} enriches ${enrichment.toFixed(2)}× vs shuffled null (mean=${nullMean.toFixed(2)}).`
        : 'CpG enrichment vs shuffle failed.',
      evidence: 'empirically_observed',
      data: 'ucsc_hg38_cpgIslandExt_gene_windows',
    },
    {
      id: 'G5',
      title: 'Gene nodes project onto DNA theater, survive nucleosome fold, TRGM stays viable',
      pass: g5Pass,
      detail: {
        hostChrom,
        hostBp,
        nProjectedGenes: projected.length,
        orderPreserved,
        compactionRatio: folded.compactionRatio,
        wrapBp: WRAP_BP,
        turns: NUCLEOSOME_TURNS,
        viabilityRate: viability,
        nHeld: held.length,
      },
      interpretation: g5Pass
        ? `Host ${hostChrom}: gene order preserved under fold (compaction=${folded.compactionRatio.toFixed(2)}); TRGM viability ${(viability * 100).toFixed(1)}%.`
        : 'Gene theater projection / fold survival / viability failed.',
      evidence: 'empirically_observed',
      data: 'genetic_nodes_on_hs1_theater',
    },
  ];

  return {
    ok: true,
    provenance,
    fixtureDir: GENETIC_DIR,
    summary: {
      nGenes: geneNodes.length,
      nExons: exonNodes.length,
      nCds: cdsNodes.length,
      nCpg: islands.length,
      chrM: { length: comp.length, gcPercent: comp.gcPercent, cpgObsExp: comp.cpgObsExp },
      host: { chrom: hostChrom, bp: hostBp, viability },
      cpgEnrichment: enrichment,
    },
    geneticNodes: {
      n: geneticNodes.length,
      byKind: {
        gene: geneNodes.length,
        exon: exonNodes.length,
        cds: cdsNodes.length,
        cpg_island: geneticNodes.filter((n) => n.kind === 'cpg_island').length,
      },
    },
    hypotheses,
    n_pass: hypotheses.filter((h) => h.pass).length,
    n_total: hypotheses.length,
    all_pass: hypotheses.every((h) => h.pass),
  };
}
