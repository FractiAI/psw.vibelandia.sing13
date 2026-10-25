#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  PHI_EGS,
  HONESTY,
  STANDALONE_REPO,
  ENGINE_SHELF_SLOT,
  DIGITAL_SEED,
  EXPEDITION,
} from '../src/constants.mjs';
import { runAllExperiments } from '../src/experiments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const RESULTS = path.join(ROOT, 'results');
const FIGURES = path.join(ROOT, 'figures');

function mdReport(report) {
  const lab = report.results.lab;
  const hist = report.results.historical;
  const lines = [
    `# ${STUDY_TITLE}`,
    '',
    `**Document ID:** \`${DOC_ID}\``,
    `**Registry:** \`${REGISTRY_ID}\``,
    `**Expedition:** ${EXPEDITION}`,
    `**ENGINE_SHELF candidate:** #${ENGINE_SHELF_SLOT}`,
    `**Seed:** ${DIGITAL_SEED}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    '## Verdict',
    '',
    `| Metric | Value |`,
    `|---|---|`,
    `| Core all pass (E+M+T+G+C) | \`${report.results.all_pass}\` |`,
    `| Core passed | ${report.results.n_pass}/${report.results.n_total} |`,
    `| Foundation Wave–Node | \`${lab.foundation.allPass}\` |`,
    `| Held-out viability | ${(lab.held.summary.viabilityRate * 100).toFixed(1)}% |`,
    `| Null viability | ${(lab.nullBaseline.viabilityRate * 100).toFixed(1)}% |`,
    `| Engine pin recommended | \`${lab.summary.enginePinRecommended}\` |`,
    `| Historical ran | \`${report.results.historical_ran}\` (${hist?.sourceMode || 'n/a'}) |`,
    `| Historical passed | ${report.results.historical_n_pass}/${report.results.historical_n_total} |`,
    `| Molecular theater ran | \`${report.results.molecular_ran}\` |`,
    `| Molecular passed | ${report.results.molecular_n_pass}/${report.results.molecular_n_total} |`,
    `| Triadic–octave–DNA ran | \`${report.results.triadic_ran}\` |`,
    `| Triadic–octave–DNA passed | ${report.results.triadic_n_pass}/${report.results.triadic_n_total} |`,
    `| Genetic nodes ran | \`${report.results.genetic_ran}\` |`,
    `| Genetic nodes passed | ${report.results.genetic_n_pass}/${report.results.genetic_n_total} |`,
    `| Wave/node/fq catalog ran | \`${report.results.catalog_ran}\` |`,
    `| Wave/node/fq catalog passed | ${report.results.catalog_n_pass}/${report.results.catalog_n_total} |`,
    `| Φ_EGS | ${PHI_EGS} |`,
    `| Runtime ms | ${lab.runtimeMs.toFixed(1)} |`,
    '',
    '## Primary hypothesis',
    '',
    report.results.primaryHypothesis || '',
    '',
    '## Experiments (synthetic E1–E5)',
    '',
  ];
  for (const e of report.results.syntheticExperiments || report.results.experiments) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  lines.push('## Historical prediction tests (Movebank GPS + GFZ Kp)', '');
  if (hist?.scored?.dateRange) {
    lines.push(
      `- Source mode: \`${hist.sourceMode}\``,
      `- Collar window days scored: ${hist.scored.nDays} (train ${hist.scored.nTrain} / held-out ${hist.scored.nHeld})`,
      `- Date range: ${hist.scored.dateRange.start} → ${hist.scored.dateRange.end}`,
      `- Trajectory rows: ${hist.nTrajectoryRows ?? 'fixture'}`,
      '',
    );
  }
  for (const e of report.results.historicalExperiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  const mol = report.results.molecular;
  lines.push('## Molecular theater (DNA / chromosome physical scaffold)', '');
  if (mol?.ok) {
    lines.push(
      `- Role: DNA/chromosome polymer is the physical Wave–Node theater where TRGM executes`,
      `- Assembly: ${mol.hs1?.assembly || 'hs1'}`,
      `- Host chrom: ${mol.host?.chrom} (${mol.host?.bp} bp · L=${mol.host?.lengthM} m)`,
      `- Held-out molecular viability: ${((mol.held?.viabilityRate || 0) * 100).toFixed(1)}%`,
      '',
    );
  }
  for (const e of report.results.molecularExperiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  const tri = report.results.triadic;
  lines.push(
    '## Primary battery T1–T7 (10 bit/s bio pipe × triadic stream × polygon spin × octave tree × folded DNA)',
    '',
  );
  if (tri?.ok) {
    lines.push(
      `- Host: ${tri.host?.chrom} (${tri.host?.bp} bp)`,
      `- Polygon sides: ${tri.polygonSides}`,
      `- Octave depth: ±${tri.octaveDepth}`,
      `- Nucleosome: ${tri.nucleosome?.wrapBp} bp / ${tri.nucleosome?.turns} turns`,
      `- Full-stack benefitRate: ${((tri.conditions?.full?.benefitRate || 0) * 100).toFixed(1)}%`,
      `- Full-stack meanCoherence: ${(tri.conditions?.full?.meanCoherence || 0).toFixed(3)}`,
      '',
    );
  }
  for (const e of report.results.triadicExperiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  const gen = report.results.genetic;
  lines.push('## Genetic nodes G1–G5 (real public gene/exon/chrM/CpG data)', '');
  if (gen?.ok) {
    lines.push(
      `- Genes: ${gen.summary?.nGenes} (GTEx GRCh38 panel)`,
      `- Exons: ${gen.summary?.nExons} · CDS: ${gen.summary?.nCds}`,
      `- chrM hs1: len=${gen.summary?.chrM?.length} GC=${Number(gen.summary?.chrM?.gcPercent || 0).toFixed(2)}%`,
      `- CpG islands: ${gen.summary?.nCpg} · enrichment ${Number(gen.summary?.cpgEnrichment || 0).toFixed(2)}×`,
      `- Host theater: ${gen.summary?.host?.chrom} viability ${((gen.summary?.host?.viability || 0) * 100).toFixed(1)}%`,
      '',
    );
  }
  for (const e of report.results.geneticExperiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  const cat = report.results.catalog;
  lines.push('## Wave / node / fq catalog C1–C3 (genetic nodes ↔ triad inputs)', '');
  if (cat?.ok) {
    const gbc = cat.genesByChannel || {};
    lines.push(
      `- Triad lock: symbol 0=wave · 1=node · 2=fq`,
      `- Catalog entries: ${cat.summary?.nEntries} (wave ${cat.summary?.byChannel?.wave} / node ${cat.summary?.byChannel?.node} / fq ${cat.summary?.byChannel?.fq})`,
      `- wave genes: ${(gbc.wave || []).join(', ')}`,
      `- node genes: ${(gbc.node || []).join(', ')}`,
      `- fq genes: ${(gbc.fq || []).join(', ')}`,
      `- Fixture: \`data/molecular/genetic/wave_node_fq_catalog.json\``,
      '',
    );
  }
  for (const e of report.results.catalogExperiments || []) {
    lines.push(`### ${e.id} — ${e.title}`, '');
    lines.push(`- **Pass:** \`${e.pass}\``);
    if (e.interpretation) lines.push(`- ${e.interpretation}`);
    if (e.evidence) lines.push(`- Evidence: ${e.evidence}`);
    if (e.data) lines.push(`- Data: ${e.data}`);
    lines.push('');
  }
  lines.push('## Honesty', '', HONESTY, '', `Standalone: ${STANDALONE_REPO}`, '', '→ ∞^∞', '');
  return lines.join('\n');
}

function svgBars(rows, { title, w = 480, h = 280 }) {
  const pad = 40;
  const max = Math.max(...rows.map((r) => r.y), 1e-9);
  const bw = (w - 2 * pad) / rows.length;
  const bars = rows
    .map((r, i) => {
      const bh = ((r.y / max) * (h - 2 * pad)) | 0;
      const x = pad + i * bw + 8;
      const y = h - pad - bh;
      return `<rect x="${x}" y="${y}" width="${bw - 16}" height="${bh}" fill="#1a5f7a"/><text x="${x + (bw - 16) / 2}" y="${h - 12}" text-anchor="middle" font-size="10">${r.x}</text>`;
    })
    .join('');
  return `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#faf8f5"/><text x="${w / 2}" y="18" text-anchor="middle" font-family="Georgia,serif" font-size="14">${title}</text>${bars}</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RESULTS, { recursive: true });
  await fs.mkdir(FIGURES, { recursive: true });
  await fs.mkdir(path.join(OUT, 'historical'), { recursive: true });
  const results = await runAllExperiments();
  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    results,
    dependencyVersions: { node: process.version },
  };
  await fs.writeFile(path.join(OUT, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(OUT, 'empirical_report.md'), mdReport(report));
  await fs.writeFile(
    path.join(RESULTS, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt,
        seed: DIGITAL_SEED,
        docId: DOC_ID,
        enginePinRecommended: results.enginePinRecommended,
        historical_ran: results.historical_ran,
        historical_n_pass: results.historical_n_pass,
        historical_n_total: results.historical_n_total,
        node: process.version,
      },
      null,
      2,
    ),
  );
  const bars = [
    { x: 'TRGM', y: results.lab.held.summary.viabilityRate },
    { x: 'Null', y: results.lab.nullBaseline.viabilityRate },
    { x: 'φ soft', y: results.lab.phaseSteering?.softPhaseOkRate ?? 0 },
  ];
  await fs.writeFile(path.join(FIGURES, 'fig_viability.json'), JSON.stringify(bars, null, 2));
  await fs.writeFile(
    path.join(FIGURES, 'fig_viability.svg'),
    svgBars(bars, { title: 'Fig. TRGM — Viability + soft phase sync rate' }),
  );
  if (results.historical?.scored) {
    const h = results.historical.scored;
    const histBars = [
      { x: 'H1', y: h.H1_structureBandPhase.pass ? 1 : 0 },
      { x: 'H2', y: h.H2_phaseBeatsShuffle.beatShuffleRate },
      { x: 'H3', y: Math.abs(h.H3_stormVsQuietPhase.delta || 0) },
    ];
    await fs.writeFile(path.join(FIGURES, 'fig_historical.json'), JSON.stringify(histBars, null, 2));
    await fs.writeFile(
      path.join(FIGURES, 'fig_historical.svg'),
      svgBars(histBars, { title: 'Fig. TRGM — Historical prediction metrics' }),
    );
  }
  console.log(
    JSON.stringify(
      {
        ok: results.all_pass,
        passed: `${results.n_pass}/${results.n_total}`,
        heldViability: results.lab.held.summary.viabilityRate,
        nullViability: results.lab.nullBaseline.viabilityRate,
        enginePinRecommended: results.enginePinRecommended,
        historical: {
          ran: results.historical_ran,
          sourceMode: results.historical?.sourceMode,
          passed: `${results.historical_n_pass}/${results.historical_n_total}`,
          H1: results.historical?.scored?.H1_structureBandPhase?.pass,
          H2: results.historical?.scored?.H2_phaseBeatsShuffle?.pass,
          H3: results.historical?.scored?.H3_stormVsQuietPhase?.pass,
        },
        molecular: {
          ran: results.molecular_ran,
          passed: `${results.molecular_n_pass}/${results.molecular_n_total}`,
          host: results.molecular?.host,
          viability: results.molecular?.held?.viabilityRate,
        },
        triadic: {
          ran: results.triadic_ran,
          passed: `${results.triadic_n_pass}/${results.triadic_n_total}`,
          fullBenefit: results.triadic?.conditions?.full?.benefitRate,
          fullCoherence: results.triadic?.conditions?.full?.meanCoherence,
        },
        genetic: {
          ran: results.genetic_ran,
          passed: `${results.genetic_n_pass}/${results.genetic_n_total}`,
          summary: results.genetic?.summary,
        },
        catalog: {
          ran: results.catalog_ran,
          passed: `${results.catalog_n_pass}/${results.catalog_n_total}`,
          genesByChannel: results.catalog?.genesByChannel,
          byChannel: results.catalog?.summary?.byChannel,
        },
      },
      null,
      2,
    ),
  );

  if (results.triadic?.conditions) {
    const tBars = Object.entries(results.triadic.conditions).map(([k, v]) => ({
      x: k.slice(0, 6),
      y: v.meanCoherence,
    }));
    await fs.writeFile(path.join(FIGURES, 'fig_triadic_coherence.json'), JSON.stringify(tBars, null, 2));
    await fs.writeFile(
      path.join(FIGURES, 'fig_triadic_coherence.svg'),
      svgBars(tBars, { title: 'Fig. TRGM — Stack coherence (full vs ablations)' }),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
