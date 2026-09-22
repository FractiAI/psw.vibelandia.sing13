#!/usr/bin/env node
/**
 * Path-aware Vercel build — skip SPA rebuilds when only docs / ship-blog /
 * protocols / static interfaces land. Built SPA assets are committed under
 * interfaces/, so paper ships do not need three Vite builds every time.
 *
 * Usage (vercel.json buildCommand):
 *   node scripts/vercel-smart-build.mjs
 *
 * Force all SPAs: VERCEL_FORCE_SPA_BUILD=1
 */
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @typedef {'questfest' | 'executive' | 'lattice-chat'} SpaId */

const SPA_PATH_PREFIXES = {
  questfest: ['apps/ss-vibelandia-questfest/'],
  executive: ['apps/executive-ai-onboard/'],
  'lattice-chat': ['apps/lattice-chat/'],
};

const ALWAYS_FULL_BUILD_PREFIXES = [
  'package.json',
  'package-lock.json',
  'scripts/vercel-smart-build.mjs',
];

/**
 * @param {string} file
 * @returns {SpaId[] | 'all' | null}
 */
export function spasAffectedByPath(file) {
  const f = String(file || '').replace(/^\.\//, '');
  if (!f) return null;
  if (ALWAYS_FULL_BUILD_PREFIXES.some((p) => f === p || f.startsWith(p))) {
    return 'all';
  }
  /** @type {SpaId[]} */
  const hit = [];
  for (const [id, prefixes] of Object.entries(SPA_PATH_PREFIXES)) {
    if (prefixes.some((p) => f === p.slice(0, -1) || f.startsWith(p))) {
      hit.push(/** @type {SpaId} */ (id));
    }
  }
  return hit.length ? hit : null;
}

/**
 * @param {string[]} files
 * @returns {{ buildAll: boolean, spas: Set<SpaId> }}
 */
export function planSpaBuilds(files) {
  /** @type {Set<SpaId>} */
  const spas = new Set();
  let buildAll = false;
  for (const file of files) {
    const r = spasAffectedByPath(file);
    if (r === 'all') {
      buildAll = true;
      break;
    }
    if (r) for (const id of r) spas.add(id);
  }
  if (buildAll) {
    return {
      buildAll: true,
      spas: new Set(/** @type {SpaId[]} */ (['questfest', 'executive', 'lattice-chat'])),
    };
  }
  return { buildAll: false, spas };
}

function gitChangedFiles() {
  const head = process.env.VERCEL_GIT_COMMIT_SHA || 'HEAD';
  const prev = process.env.VERCEL_GIT_PREVIOUS_SHA || '';
  const ranges = [];
  if (prev && prev !== head) ranges.push(`${prev}...${head}`);
  ranges.push('HEAD~1...HEAD');
  ranges.push('HEAD');

  for (const range of ranges) {
    try {
      const out = execSync(`git diff --name-only ${range}`, {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const files = out
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (files.length) return { range, files };
    } catch {
      /* try next */
    }
  }
  return { range: null, files: [] };
}

function run(cmd) {
  console.log(`[vercel-smart-build] $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env });
}

function main() {
  const force = process.env.VERCEL_FORCE_SPA_BUILD === '1';
  const { range, files } = gitChangedFiles();

  console.log(
    `[vercel-smart-build] diff=${range || 'none'} files=${files.length} force=${force ? 1 : 0}`,
  );

  /** @type {Set<SpaId>} */
  let spas;
  if (force) {
    spas = new Set(/** @type {SpaId[]} */ (['questfest', 'executive', 'lattice-chat']));
    console.log('[vercel-smart-build] VERCEL_FORCE_SPA_BUILD=1 — building all SPAs');
  } else if (!files.length) {
    spas = new Set(/** @type {SpaId[]} */ (['questfest', 'executive', 'lattice-chat']));
    console.log('[vercel-smart-build] no diff available — building all SPAs (safe default)');
  } else {
    const plan = planSpaBuilds(files);
    spas = plan.spas;
    if (spas.size === 0) {
      console.log(
        '[vercel-smart-build] no apps/ or lockfile changes — skipping SPA builds (interfaces/ assets already committed)',
      );
      return;
    }
  }

  const wanted = [...spas];
  console.log(`[vercel-smart-build] building SPAs: ${wanted.join(', ')}`);

  run('npm ci');
  if (wanted.includes('questfest')) run('npm run build:questfest-bridge');
  if (wanted.includes('executive')) run('npm run build:executive-onboard');
  if (wanted.includes('lattice-chat')) run('npm run build:lattice-chat');
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  try {
    main();
  } catch (err) {
    console.error('[vercel-smart-build] failed', err);
    process.exit(1);
  }
}
