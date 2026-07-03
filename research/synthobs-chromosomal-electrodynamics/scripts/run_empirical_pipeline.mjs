#!/usr/bin/env node
/**
 * SYNTHOBS chromosomal electrodynamics · public-data empirical pipeline
 * Document IDs: WP-SYNTHOBS-CHROM-ELCD-2026-07 · WP-SYNTHOBS-CROSS-ANTENNAE-2026-07
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GARTEN2015_DNA_THZ_PEAKS_GHZ,
  VP_LITERATURE_BAND_M_S,
  lcParamsForPhaseVelocity,
} from '../src/constants.mjs';
import {
  buildGenomicLengthTable,
  fetchPdbSpikeSpanNm,
  fetchUcscHs1ChromSizes,
  fundamentalFrequencyHz,
  honeybeeAntennaLength,
} from '../src/fetch-public-data.mjs';
import { dispersionProfile } from '../src/dispersion.mjs';
import { crossScaleEgsMatrix } from '../src/egs-scaling.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');

async function thzPeakAlignment(genomicRows, vpBand) {
  const chrY = genomicRows.find((r) => r.chrom === 'chrY');
  if (!chrY) return null;
  const rows = [];
  for (const vp of [vpBand.low, vpBand.mid, vpBand.high]) {
    const f0Hz = fundamentalFrequencyHz(chrY.lengthM, vp);
    const f0Ghz = f0Hz / 1e9;
    let nearestPeak = GARTEN2015_DNA_THZ_PEAKS_GHZ[0];
    let minDelta = Infinity;
    for (const peak of GARTEN2015_DNA_THZ_PEAKS_GHZ) {
      const d = Math.abs(Math.log10(f0Ghz) - Math.log10(peak));
      if (d < minDelta) {
        minDelta = d;
        nearestPeak = peak;
      }
    }
    rows.push({
      vp_m_s: vp,
      f0_Hz: f0Hz,
      f0_GHz: f0Ghz,
      nearestGarten2015Peak_GHz: nearestPeak,
      log10DeltaFromNearestPeak: minDelta,
      withinOneDecadeOfThzPeak: minDelta < 1.0,
    });
  }
  return {
    chrY_bp: chrY.bp,
    chrY_lengthM: chrY.lengthM,
    garten2015Peaks_GHz: GARTEN2015_DNA_THZ_PEAKS_GHZ,
    vpSensitivity: rows,
    note: 'Standing-wave f0 from macro boundary length vs published THz molecular peaks — correlation only.',
  };
}

async function main() {
  await mkdir(DATA, { recursive: true });

  const ucsc = await fetchUcscHs1ChromSizes();
  const genomicRows = await buildGenomicLengthTable(ucsc);
  const spike = await fetchPdbSpikeSpanNm();
  const antenna = honeybeeAntennaLength();

  const chrY = genomicRows.find((r) => r.chrom === 'chrY');
  const structures = [
    { id: 'viral_spike', label: 'SARS-CoV-2 spike PDB 6VXX', lengthM: spike.maxSpanM },
    { id: 'honeybee_antenna', label: 'Apis mellifera antenna', lengthM: antenna.lengthM },
    { id: 'chrY', label: 'Human chrY hs1', lengthM: chrY.lengthM },
  ];

  const egs = crossScaleEgsMatrix(structures);
  const lc = lcParamsForPhaseVelocity(VP_LITERATURE_BAND_M_S.mid);
  const dispersion = dispersionProfile(lc.Lk, lc.Ck);

  const frequencyMap = genomicRows.map((row) => ({
    ...row,
    f0_Hz_midVp: fundamentalFrequencyHz(row.lengthM, VP_LITERATURE_BAND_M_S.mid),
    f0_GHz_midVp: fundamentalFrequencyHz(row.lengthM, VP_LITERATURE_BAND_M_S.mid) / 1e9,
  }));

  const thzAlign = await thzPeakAlignment(genomicRows, VP_LITERATURE_BAND_M_S);

  const hypothesisTests = {
    E1_genomic_lengths_public: {
      statement: 'T2T hs1 chromosome bp counts match published assembly order of magnitude',
      result: chrY.bp >= 60e6 && chrY.bp <= 63e6 ? 'support' : 'refute',
      chrY_bp: chrY.bp,
      paperNominal_bp: 60e6,
    },
    E2_band_edge_vg_zero: {
      statement: 'Discrete LC model yields v_g → 0 at first Brillouin zone edge',
      result: dispersion.bandEdgeVgIsZero ? 'support' : 'refute',
      vgAtEdge: dispersion.vgAtEdge,
      vgMin: dispersion.vgMin,
    },
    E3_egs_integer_tiers: {
      statement: 'Cross-scale length ratios align with integer n·log10(φ) within 5%',
      result: egs.summary.interpretation,
      ...egs.summary,
    },
    E4_thz_peak_proximity: {
      statement: 'Macro chrY f0 lies within one decade of published DNA THz peaks (Garten 2015)',
      result: thzAlign.vpSensitivity.some((r) => r.withinOneDecadeOfThzPeak)
        ? 'weak'
        : 'no_support',
      vpSensitivity: thzAlign.vpSensitivity,
    },
  };

  const report = {
    documentIds: ['WP-SYNTHOBS-CHROM-ELCD-2026-07', 'WP-SYNTHOBS-CROSS-ANTENNAE-2026-07'],
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    dataSources: {
      ucsc: { url: ucsc.source, assembly: ucsc.assembly },
      pdbSpike: { entry: spike.entry, url: spike.source },
      antenna: antenna.source,
      thzPeaks: 'Garten et al. 2015 · Chem. Phys. Lett. 634',
      vpBand: VP_LITERATURE_BAND_M_S,
    },
    genomicLengths: genomicRows,
    frequencyMap,
    crossScaleStructures: structures,
    spike,
    antenna,
    egsScaling: egs,
    dispersion: {
      Lk: lc.Lk,
      Ck: lc.Ck,
      vpMid: VP_LITERATURE_BAND_M_S.mid,
      bandEdgeVgIsZero: dispersion.bandEdgeVgIsZero,
      vgAtZero: dispersion.vgAtZero,
      vgAtEdge: dispersion.vgAtEdge,
      vgMin: dispersion.vgMin,
      profileSample: dispersion.profile.filter((_, i) => i % 20 === 0),
    },
    thzAlignment: thzAlign,
    hypothesisTests,
    honestyNote:
      'Public assembly sizes and PDB spans are empirical. LC dispersion band-edge is analytic confirmation. EGS integer-tier and THz alignment are falsification probes — correlation ≠ causation.',
  };

  const jsonPath = join(DATA, 'empirical_report.json');
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  const md = buildMarkdownReport(report);
  const mdPath = join(DATA, 'empirical_report.md');
  await writeFile(mdPath, md);

  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, hypothesisTests }, null, 2));
}

function buildMarkdownReport(r) {
  const lines = [
    '# SYNTHOBS Chromosomal Electrodynamics · Empirical Report',
    '',
    `**Generated:** ${r.generatedAt}`,
    `**Operator:** ${r.operator}`,
    '',
    '## Data sources',
    '',
    `- UCSC hs1: ${r.dataSources.ucsc.url}`,
    `- PDB ${r.spike.entry}: ${r.spike.source}`,
    `- Antenna: ${r.antenna.source}`,
    '',
    '## Genomic stretched lengths (public hs1)',
    '',
    '| Chrom | bp | L (cm) | f₀ mid-vp (GHz) |',
    '|-------|-----|--------|-----------------|',
  ];
  for (const row of r.frequencyMap) {
    lines.push(
      `| ${row.chrom} | ${row.bp.toLocaleString()} | ${row.lengthCm.toFixed(3)} | ${row.f0_GHz_midVp.toFixed(3)} |`
    );
  }
  lines.push('', '## Cross-scale structures', '');
  for (const s of r.crossScaleStructures) {
    lines.push(`- **${s.label}:** L = ${(s.lengthM * 1e3).toFixed(4)} mm (${s.lengthM.toExponential(3)} m)`);
  }
  lines.push('', '## Hypothesis tests (empirical tier)', '');
  for (const [id, t] of Object.entries(r.hypothesisTests)) {
    lines.push(`### ${id}`, `- **Result:** ${t.result}`, '');
  }
  lines.push(
    '',
    '## Honesty',
    '',
    r.honestyNote,
    '',
    '```bash',
    'npm run research:synthobs-chromosomal-electrodynamics',
    '```'
  );
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
