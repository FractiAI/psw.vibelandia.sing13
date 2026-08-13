/**
 * Canonical FractiAI standalone GitHub repos for research/ suites.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, '..', 'data', 'standalone-suite-manifest.json');

let cached = null;

export function loadStandaloneSuiteManifest() {
  if (cached) return cached;
  const raw = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const suites = Array.isArray(raw.suites) ? raw.suites : [];
  cached = {
    schema: raw.schema || 'standalone-suite-manifest/v1',
    owner: raw.owner || 'FractiAI',
    updatedAt: raw.updatedAt || null,
    suites,
    byId: Object.fromEntries(suites.map((s) => [s.id, s])),
    byPath: Object.fromEntries(suites.map((s) => [s.path.replace(/^research\//, ''), s])),
  };
  return cached;
}

export function findStandaloneSuite(idOrPath) {
  const m = loadStandaloneSuiteManifest();
  const needle = String(idOrPath || '').trim().replace(/^research\//, '');
  if (!needle) return null;
  return m.byId[needle] || m.byPath[needle] || null;
}
