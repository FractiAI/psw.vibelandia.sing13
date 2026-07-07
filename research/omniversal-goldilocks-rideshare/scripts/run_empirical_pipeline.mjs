#!/usr/bin/env node
/**
 * OGRP · Omniversal Goldilocks Rideshare Protocol · empirical pipeline
 * Document ID: WP-OGRP-2026-07
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareCapitalLeak,
  compareParkingCruising,
  generosityGateBreakEven,
  loadOgrpProtocol,
  validateDensityGate,
  validateOgrpSchema,
} from '../src/benchmarks.mjs';
import { verifyEgsOverheadModel } from '../src/egs-overhead.mjs';
import { AAA_DRIVING_COSTS_2025, MICRO_MOBILITY_OPERATING } from '../src/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'data');

async function main() {
  await mkdir(DATA, { recursive: true });

  const e1 = compareCapitalLeak();
  const e2 = compareParkingCruising();
  const e3 = verifyEgsOverheadModel();
  const e4 = generosityGateBreakEven();
  const density = await validateDensityGate();
  const protocol = await loadOgrpProtocol();
  const schema = validateOgrpSchema(protocol);

  const hypothesisTests = {
    E1_capital_leak_elimination: {
      statement: 'OGRP micro-mobility operating cost << AAA published per-mile vehicle tiers',
      result:
        e1.minRatioVehicleToMicro >= 50 ? 'support' : e1.minRatioVehicleToMicro >= 10 ? 'weak' : 'no_support',
      minRatioVehicleToMicro: e1.minRatioVehicleToMicro,
      microPerMileUsd: MICRO_MOBILITY_OPERATING.operatingPerMileUsd,
      aaaCompositePerMileUsd: AAA_DRIVING_COSTS_2025.compositePerMileUsd,
    },
    E2_parking_cruising_discrepancy: {
      statement: 'Legacy delivery parking cruise fraction >> OGRP micro-mobility model (0%)',
      result: e2.legacyParkingCruiseFraction > 0.2 && e2.ogrpParkingCruiseFraction === 0 ? 'support' : 'weak',
      legacyFraction: e2.legacyParkingCruiseFraction,
      ogrpFraction: e2.ogrpParkingCruiseFraction,
      minutesSavedPerTripAssumed180min: e2.minutesSavedPerTrip,
    },
    E3_egs_overhead_minimum: {
      statement: 'C(x)=x²−Φx minimum aligns with Φ/2; modeled sprawl divergence exceeds Φ-band',
      result:
        e3.minimumMatchesPhiHalf && e3.sprawlDivergenceExceedsPhi ? 'support' : 'weak',
      analyticMinimumX: e3.analyticMinimum.x,
      numericMinimumRatio: e3.numericMinimum.d_over_r,
      sprawlRatioModeled: e3.modeledRatioAtSprawl,
    },
    E4_generosity_gate_arithmetic: {
      statement: 'Γ_floor=$9 yields positive net on micro tier after zero-mile overhead; rejects sub-floor by policy',
      result: e4.netYieldIfZeroMiles.microMobility > 0 ? 'support' : 'refute',
      gammaFloorUsd: e4.gammaFloorUsd,
      netMicro: e4.netYieldIfZeroMiles.microMobility,
      netAaa: e4.netYieldIfZeroMiles.aaaVehicle,
    },
    E5_density_gate_and_schema: {
      statement: 'Sample Reno core trips inside Ω_core bbox; OGRP JSON schema valid',
      result:
        density.allSampleTripsInsideCore && schema.valid ? 'support' : 'refute',
      allInsideCore: density.allSampleTripsInsideCore,
      schemaValid: schema.valid,
      schemaErrors: schema.errors,
    },
  };

  const report = {
    documentId: 'WP-OGRP-2026-07',
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    repository: 'https://github.com/FractiAI/omniversal-goldilocks-rideshare',
    experiments: {
      E1_capitalLeak: e1,
      E2_parkingCruising: e2,
      E3_egsOverhead: e3,
      E4_generosityGate: e4,
      E5_densityAndSchema: { density, protocol, schema },
    },
    hypothesisTests,
    honestyNote:
      'E1–E2 use published AAA and UW freight statistics — economic comparison, not causal proof of φ routing. E3 is analytic model verification. E4 is policy arithmetic. Field tipping (Experiment C narrative) requires optional controlled logs — not asserted here.',
  };

  const jsonPath = join(DATA, 'empirical_report.json');
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  const md = buildMarkdownReport(report);
  const mdPath = join(DATA, 'empirical_report.md');
  await writeFile(mdPath, md);

  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, hypothesisTests }, null, 2));
}

function buildMarkdownReport(r) {
  const e1 = r.experiments.E1_capitalLeak;
  const lines = [
    '# OGRP · Empirical Report',
    '',
    `**Document ID:** ${r.documentId}`,
    `**Generated:** ${r.generatedAt}`,
    `**Operator:** ${r.operator}`,
    '',
    '## E1 · Capital leak (AAA vs micro-mobility)',
    '',
    '| Tier | $/mile |',
    '|------|--------|',
  ];
  for (const t of e1.tiers) {
    lines.push(`| ${t.label} | ${t.perMileUsd.toFixed(4)} |`);
  }
  lines.push(
    '',
    `**Min vehicle/micro ratio:** ${e1.minRatioVehicleToMicro.toFixed(1)}×`,
    '',
    '## Hypothesis tests',
    '',
  );
  for (const [id, t] of Object.entries(r.hypothesisTests)) {
    lines.push(`### ${id}`, `- **Result:** ${t.result}`, '');
  }
  lines.push('## Honesty', '', r.honestyNote, '', '```bash', 'npm run research:omniversal-goldilocks-rideshare', '```');
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
