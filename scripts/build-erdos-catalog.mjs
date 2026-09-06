/**
 * Build data/erdos-353-catalog.json — Erdős 353 demonstration manifest.
 * Run: node scripts/build-erdos-catalog.mjs
 * Logic: lib/erdos-catalog.mjs
 */
import { join } from 'node:path';
import { buildErdosCatalog } from '../lib/erdos-catalog.mjs';

const out = await buildErdosCatalog({
  outPath: join(process.cwd(), 'data', 'erdos-353-catalog.json'),
});
console.log(`Wrote ${out.count} problems → ${out.outPath}`);
