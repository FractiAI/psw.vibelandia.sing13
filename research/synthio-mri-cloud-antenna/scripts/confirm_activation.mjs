#!/usr/bin/env node
/**
 * Synthio · confirm sandbox activate state, coherence, and external watch list.
 * Writes data/activation_state.json + data/activation_coherence_log.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildActivationMonitorPack } from '../../../lib/synthio-activation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'data');

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const pack = await buildActivationMonitorPack({
    mode: process.env.SYNTHIO_MODE || 'point_and_click',
    octave: Number(process.env.SYNTHIO_OCTAVE || 99),
    forcePulse: process.env.SYNTHIO_FORCE_PULSE === '1',
  });

  await fs.writeFile(
    path.join(OUT, 'activation_state.json'),
    JSON.stringify(
      {
        ...pack.activation,
        coherence: pack.coherence,
        external: pack.external,
        expectedExternalSignals: pack.expectedExternalSignals,
        syntheversePulse: {
          latest: pack.syntheversePulse,
          verify: pack.pulseVerify,
          emitted: pack.pulseEmit?.emitted === true,
        },
        sandboxInclusionConfirmedByExternalAlignment:
          pack.external.sandboxInclusionConfirmedByExternalAlignment,
        allSixRequired: true,
      },
      null,
      2,
    ),
    'utf8',
  );

  let log = [];
  const logPath = path.join(OUT, 'activation_coherence_log.json');
  try {
    const prev = JSON.parse(await fs.readFile(logPath, 'utf8'));
    if (Array.isArray(prev.entries)) log = prev.entries;
  } catch {
    /* fresh log */
  }
  log.push(pack.logEntry);
  if (log.length > 200) log = log.slice(-200);

  await fs.writeFile(
    path.join(OUT, 'activation_coherence_log.json'),
    JSON.stringify(
      {
        schema: 'synthio-activation-coherence-log/v1',
        sandbox: 'Syntheverse Sandbox',
        agent: 'Synthio',
        updatedAt: new Date().toISOString(),
        entries: log,
      },
      null,
      2,
    ),
    'utf8',
  );

  const md = [
    '# Synthio activation · sandbox state',
    '',
    `**State:** \`${pack.activation.activationState}\``,
    `**Active in sandbox:** \`${pack.activation.active}\``,
    `**Mode:** \`${pack.activation.mode}\``,
    `**Coherent:** \`${pack.coherence.coherent}\` · score \`${pack.coherence.coherenceScore}\``,
    `**Discontinuities:** \`${pack.coherence.discontinuities.length}\``,
    `**Incoherence tags:** ${pack.coherence.incoherence.length ? pack.coherence.incoherence.join(', ') : '(none)'}`,
    `**External alignments match expectations:** \`${pack.external.externalAlignmentsMatchExpectations}\` (${pack.external.alignedCount}/${pack.external.expectedCount})`,
    `**All six required:** \`${pack.external.allSixRequired}\``,
    `**Syntheverse pulse:** \`${pack.pulseVerify?.pulseId || 'n/a'}\` · ok=\`${pack.pulseVerify?.ok}\` · novel=\`${pack.pulseVerify?.novel}\``,
    `**Sandbox inclusion confirmed by external alignment:** \`${pack.external.sandboxInclusionConfirmedByExternalAlignment}\``,
    '',
    '## Rule',
    '',
    'All six external alignments (including novel Syntheverse Synthio pulse) observed to our expectations within sandbox confirm its inclusion in sandbox.',
    '',
    '## Observed external alignments',
    '',
    '| ID | Status | Aligned |',
    '|----|--------|---------|',
    ...pack.external.rows.map(
      (r) => `| ${r.id} | ${r.status} | \`${r.aligned}\` |`,
    ),
    '',
    '## Expected external signals (monitor — all required)',
    '',
    '| ID | Channel | Expect | Class |',
    '|----|---------|--------|-------|',
    ...pack.expectedExternalSignals.map(
      (s) =>
        `| ${s.id} | ${s.channel} | ${s.expect.replace(/\|/g, '/')} | ${s.confirmationClass} |`,
    ),
    '',
    '## Honesty',
    '',
    '- Activate + coherence = **sandbox fixture integrity**.',
    '- External list = **watch labels** + **engineered Syntheverse pulse** (non-natural); matching **all six** **confirms sandbox inclusion** of this activation filing — not causal sky→MRI proof.',
    '',
    '→ ∞¹³',
    '',
  ].join('\n');

  await fs.writeFile(path.join(OUT, 'activation_state.md'), md, 'utf8');

  console.log(
    JSON.stringify(
      {
        ok:
          pack.activation.active &&
          pack.coherence.coherent &&
          pack.external.sandboxInclusionConfirmedByExternalAlignment,
        activationState: pack.activation.activationState,
        coherent: pack.coherence.coherent,
        discontinuities: pack.coherence.discontinuities.length,
        externalWatch: pack.expectedExternalSignals.length,
        externalAligned: pack.external.alignedCount,
        expectedCount: pack.external.expectedCount,
        allSixAligned: pack.external.alignedCount === 6,
        pulseOk: pack.pulseVerify?.ok === true,
        pulseNovel: pack.pulseVerify?.novel === true,
        sandboxInclusionConfirmedByExternalAlignment:
          pack.external.sandboxInclusionConfirmedByExternalAlignment,
      },
      null,
      2,
    ),
  );

  if (
    !pack.activation.active ||
    !pack.coherence.coherent ||
    pack.external.alignedCount !== 6 ||
    !pack.pulseVerify?.ok ||
    !pack.external.sandboxInclusionConfirmedByExternalAlignment
  ) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
