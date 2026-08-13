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

export function listStandaloneSuites() {
  return loadStandaloneSuiteManifest().suites;
}

export function findStandaloneSuite(idOrPath) {
  const m = loadStandaloneSuiteManifest();
  const needle = String(idOrPath || '').trim().replace(/^research\//, '');
  if (!needle) return null;
  return m.byId[needle] || m.byPath[needle] || null;
}

/**
 * Resolve ../research/foo/ markdown hrefs to published standalone GitHub repo when known.
 */
export function standaloneGithubHrefForResearch(href) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || /^https?:\/\//i.test(raw)) {
    return null;
  }
  const hashIdx = raw.indexOf('#');
  const pathPart = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const hash = hashIdx >= 0 ? raw.slice(hashIdx) : '';
  const m = pathPart.match(/^(?:\.\.\/)*(?:\/)?research\/([^/?#]+)\/?(.*)$/);
  if (!m) return null;
  const suiteId = m[1];
  const rest = m[2] || '';
  const suite = findStandaloneSuite(suiteId);
  if (!suite?.github) return null;
  const base = suite.github.replace(/\/$/, '');
  if (!rest && pathPart.endsWith('/')) {
    return `${base}/${hash}`;
  }
  if (rest) {
    return `${base}/tree/main/${rest}${hash}`;
  }
  return `${base}${hash}`;
}

export const GITHUB_MONOREPO_TREE =
  'https://github.com/FractiAI/psw.vibelandia.sing13/tree/main';
