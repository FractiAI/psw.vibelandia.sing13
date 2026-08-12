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
  const pack = buildActivationMonitorPack({
    mode: process.env.SYNTHIO_MODE || 'point_and_click',
    octave: Number(process.env.SYNTHIO_OCTAVE || 99),
  });

  await fs.writeFile(
    path.join(OUT, 'activation_state.json'),
    JSON.stringify(
      {
        ...pack.activation,
        coherence: pack.coherence,
        expectedExternalSignals: pack.expectedExternalSignals,
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
    '',
    '## Expected external signals (monitor)',
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
    '- External list = **watch labels** for co-timing / companions — not causal proof.',
    '',
    '→ ∞¹³',
    '',
  ].join('\n');

  await fs.writeFile(path.join(OUT, 'activation_state.md'), md, 'utf8');

  console.log(
    JSON.stringify(
      {
        ok: pack.activation.active && pack.coherence.coherent,
        activationState: pack.activation.activationState,
        coherent: pack.coherence.coherent,
        discontinuities: pack.coherence.discontinuities.length,
        externalWatch: pack.expectedExternalSignals.length,
      },
      null,
      2,
    ),
  );

  if (!pack.activation.active || !pack.coherence.coherent) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
