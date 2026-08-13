#!/usr/bin/env node
/**
 * Publish a research/ suite folder to a FractiAI standalone GitHub repository.
 *
 * Usage:
 *   node scripts/publish-standalone-suite.mjs synthio-mri-vs-legacy-perf
 *   node scripts/publish-standalone-suite.mjs synthio-mri-cloud-antenna --create-repo
 *
 * Requires: empty or existing https://github.com/FractiAI/<suite>.git
 * For --create-repo: gh CLI + token with org repo create (Player 1 / CI secret).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findStandaloneSuite, loadStandaloneSuiteManifest } from '../lib/standalone-suite-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: opts.quiet ? 'pipe' : 'inherit',
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
  });
  return r;
}

async function copyTree(src, dest, { skip = [] } = {}) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    if (skip.includes(ent.name)) continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      await copyTree(from, to, { skip });
    } else if (ent.isFile()) {
      await fs.copyFile(from, to);
    }
  }
}

async function ensureRepoExists(githubUrl, suiteId, createRepo) {
  const remote = `${githubUrl.replace(/\/$/, '')}.git`;
  const probe = run('git', ['ls-remote', remote], { quiet: true });
  if (probe.status === 0 && probe.stdout.trim()) {
    return { remote, created: false };
  }
  if (!createRepo) {
    throw new Error(
      `Remote missing: ${remote}\nCreate it first:\n  gh repo create FractiAI/${suiteId} --public --description "Synthio standalone suite"`,
    );
  }
  const owner = loadStandaloneSuiteManifest().owner || 'FractiAI';
  const create = run(
    'gh',
    ['repo', 'create', `${owner}/${suiteId}`, '--public', '--description', `Synthio · ${suiteId} standalone suite`],
    { quiet: true },
  );
  if (create.status !== 0) {
    throw new Error(
      `gh repo create failed for ${owner}/${suiteId}.\n${create.stderr || create.stdout}\nCreate the empty repo manually, then re-run.`,
    );
  }
  return { remote, created: true };
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('-')));
  const suiteId = args[0];
  if (!suiteId) {
    console.error('Usage: node scripts/publish-standalone-suite.mjs <suite-id> [--create-repo] [--dry-run]');
    process.exit(1);
  }
  const createRepo = flags.has('--create-repo');
  const dryRun = flags.has('--dry-run');

  const entry = findStandaloneSuite(suiteId);
  if (!entry) {
    console.error(`Unknown suite "${suiteId}". Add it to data/standalone-suite-manifest.json`);
    process.exit(1);
  }

  const srcDir = path.join(REPO_ROOT, entry.path);
  const staging = path.join('/tmp', `standalone-${suiteId}-${Date.now()}`);
  const skip = new Set(['node_modules', '.git']);

  console.log(JSON.stringify({ suite: suiteId, src: entry.path, github: entry.github, staging, dryRun }, null, 2));

  await copyTree(srcDir, staging, { skip: [...skip] });

  for (const rel of entry.extraDocs || []) {
    const from = path.join(REPO_ROOT, rel);
    const base = path.basename(rel);
    const to = rel.startsWith('docs/') ? path.join(staging, 'docs', base) : path.join(staging, base);
    await fs.mkdir(path.dirname(to), { recursive: true });
    try {
      await fs.copyFile(from, to);
    } catch (e) {
      console.warn(`warn: could not copy extra doc ${rel}: ${e.message}`);
    }
  }

  if (dryRun) {
    console.log('dry-run: staged at', staging);
    return;
  }

  const { remote, created } = await ensureRepoExists(entry.github, suiteId, createRepo);

  run('git', ['init', '-b', 'main'], { cwd: staging });
  run('git', ['add', '-A'], { cwd: staging });
  const commit = run(
    'git',
    ['commit', '-m', `Publish ${suiteId} standalone suite from psw.vibelandia.sing13`],
    { cwd: staging },
  );
  if (commit.status !== 0) {
    console.error('Nothing to commit or commit failed');
    process.exit(1);
  }
  const push = run('git', ['push', '-u', remote, 'HEAD:main', '--force'], { cwd: staging });
  if (push.status !== 0) {
    console.error('Push failed. Staging left at', staging);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        suite: suiteId,
        remote,
        created,
        url: entry.github,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
