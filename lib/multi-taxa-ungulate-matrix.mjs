/**
 * Multi-taxa ungulate grid matrix — SynthOBS wavefield roles (WP-GGM-MULTITAXA-UNGULATE-2026-06).
 * Bison = N-S keystone anchor; elk/mule deer = geologic sync; pronghorn = lateral vector.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let cached = null;

export async function loadMultiTaxaUngulateMatrix() {
  if (cached) return cached;
  const raw = await readFile(
    join(process.cwd(), 'data/multi-taxa-ungulate-grid-matrix.json'),
    'utf8'
  );
  cached = JSON.parse(raw);
  return cached;
}

export function bisonKeystoneAnchor(matrix) {
  return (matrix?.taxa || []).find((t) => t.turnerRole === 'keystone_anchor') || null;
}

export function taxaByRole(matrix, role) {
  return (matrix?.taxa || []).filter((t) => t.turnerRole === role);
}
