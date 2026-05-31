#!/usr/bin/env node
/**
 * SYN-SUN-2026-REV7 metrology verification — structural tests (no mocks on cast/filter path).
 */
import { strict as assert } from 'node:assert';
import { parseHeliographicLocation, castActiveSolarNode, buildHolographicPacingMatrix } from '../lib/metrology/wavefield-types.mjs';
import { calculateHolographicLimit } from '../lib/metrology/clock-skew-filter.mjs';
import { EGS_PHI, TEST_COVERAGE_FLOOR } from '../lib/metrology/wavefield-constants.mjs';
import { CANONICAL_ACTIVE_REGIONS, runWavefieldOscillatorPipeline } from '../lib/dph-wavefield-solar.mjs';

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('parseHeliographicLocation S16W00', () => {
  const p = parseHeliographicLocation('S16W00');
  assert.equal(p.latitude, -16);
  assert.equal(p.longitude, 0);
  assert.equal(p.parsed, true);
});

test('parseHeliographicLocation N09W50', () => {
  const p = parseHeliographicLocation('N09W50');
  assert.equal(p.latitude, 9);
  assert.equal(p.longitude, 50);
});

test('castActiveSolarNode rejects empty id', () => {
  assert.throws(() => castActiveSolarNode({}, 133), /regionId required/);
});

test('castActiveSolarNode canonical AR14452 Solon', () => {
  const node = castActiveSolarNode(CANONICAL_ACTIVE_REGIONS[1], 133);
  assert.equal(node.regionId, 'AR14452');
  assert.equal(node.codename, 'Solon');
  assert.equal(node.magneticClass, 'Beta-Gamma');
  assert.equal(node.areaMillionths, 210);
});

test('pipeline nine infrastructure impacts', async () => {
  const out = await runWavefieldOscillatorPipeline({ force: true });
  assert.equal(out.downstream.impactCount, 9);
  assert.equal(out.downstream.infrastructureImpacts.length, 9);
});

test('calculateHolographicLimit bounded 0..EGS_PHI', () => {
  const nodes = CANONICAL_ACTIVE_REGIONS.map((r) => castActiveSolarNode(r, 133));
  const score = calculateHolographicLimit({
    live_nodes: nodes.map((n) => ({
      latitude: n.latitude,
      longitude: n.longitude,
      area_millionths: n.areaMillionths,
    })),
  });
  assert.ok(score >= 0 && score <= EGS_PHI + 1e-9);
});

test('buildHolographicPacingMatrix clamps egsStabilityIndex', () => {
  const matrix = buildHolographicPacingMatrix({
    globalSunspotCount: 133,
    liveNodes: [],
    egsStabilityIndex: 99,
  });
  assert.equal(matrix.egsStabilityIndex, EGS_PHI);
});

test('pipeline emits v2 schema + pacing matrix', async () => {
  const out = await runWavefieldOscillatorPipeline({ force: true });
  assert.equal(out.schema, 'dph-wavefield-solar/v2');
  assert.ok(out.holographicPacingMatrix);
  assert.ok(out.egsStabilityIndex >= 0 && out.egsStabilityIndex <= EGS_PHI);
  assert.equal(out.honestyBoundary.mined_block, false);
});

async function main() {
  let passed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      passed += 1;
      console.log('ok', name);
    } catch (err) {
      console.error('FAIL', name, err.message);
      process.exitCode = 1;
      return;
    }
  }
  const coverage = passed / tests.length;
  console.log(JSON.stringify({
    documentId: 'SYN-SUN-2026-REV7',
    testsRun: tests.length,
    testsPassed: passed,
    structuralCoverage: coverage,
    floor: TEST_COVERAGE_FLOOR,
    floorMet: coverage >= TEST_COVERAGE_FLOOR,
  }, null, 2));
  if (coverage < TEST_COVERAGE_FLOOR) {
    console.error('Coverage floor not met');
    process.exitCode = 1;
  }
}

main();
