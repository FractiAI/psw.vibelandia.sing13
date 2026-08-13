#!/usr/bin/env node
/**
 * Publish a research/ suite folder to a FractiAI standalone GitHub repository.
 *
 *   node scripts/publish-standalone-suite.mjs synthobs-tbme-metamorphic-octaves --create-repo
 *
 * Uses GH_TOKEN / GITHUB_TOKEN via git http.extraHeader (never embed PATs in remotes).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findStandaloneSuite, loadStandaloneSuiteManifest } from '../lib/standalone-suite-manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function githubToken() {
  return String(process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '').trim();
}

function publicGitRemote(githubUrl) {
  return `${String(githubUrl || '').replace(/\/$/, '')}.git`;
}

function gitAuthArgs() {
  const token = githubToken();
  if (!token) return [];
  return ['-c', `http.extraHeader=Authorization: Bearer ${token}`];
}

function run(cmd, args, opts = {}) {
  const env = { ...process.env, ...opts.env };
  const token = githubToken();
  if (token) {
    env.GH_TOKEN = token;
    env.GITHUB_TOKEN = token;
  }
  if (opts.stripGitInsteadOf) {
    env.GIT_CONFIG_GLOBAL = '/dev/null';
    env.GIT_CONFIG_SYSTEM = '/dev/null';
  }
  return spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: opts.quiet ? 'pipe' : 'inherit',
    cwd: opts.cwd,
    env,
  });
}

async function copyTree(src, dest, { skip = [] } = {}) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    if (skip.includes(ent.name)) continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) await copyTree(from, to, { skip });
    else if (ent.isFile()) await fs.copyFile(from, to);
  }
}

async function ensureRepoExists(githubUrl, suiteId, createRepo) {
  const publicRemote = publicGitRemote(githubUrl);
  const owner = loadStandaloneSuiteManifest().owner || 'FractiAI';
  const api = run('gh', ['api', `repos/${owner}/${suiteId}`], { quiet: true });
  if (api.status === 0) {
    return { remote: publicRemote, created: false };
  }
  if (!createRepo) {
    throw new Error(
      `Remote missing: ${publicRemote}\nCreate it first:\n  gh repo create ${owner}/${suiteId} --public`,
    );
  }
  const create = run(
    'gh',
    ['repo', 'create', `${owner}/${suiteId}`, '--public', '--description', `SynthOBS · ${suiteId} standalone suite`],
    { quiet: true },
  );
  if (create.status !== 0) {
    throw new Error(`gh repo create failed for ${owner}/${suiteId}.\n${create.stderr || create.stdout}`);
  }
  return { remote: publicRemote, created: true };
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
  console.log(JSON.stringify({ suite: suiteId, src: entry.path, github: entry.github, staging, dryRun }, null, 2));

  await copyTree(srcDir, staging, { skip: ['node_modules', '.git'] });
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
  run('git', ['init', '-b', 'main'], { cwd: staging, stripGitInsteadOf: true });
  run('git', ['-c', 'user.email=cursoragent@cursor.com', '-c', 'user.name=Cursor Agent', 'add', '-A'], {
    cwd: staging,
    stripGitInsteadOf: true,
  });
  const commit = run(
    'git',
    [
      '-c',
      'user.email=cursoragent@cursor.com',
      '-c',
      'user.name=Cursor Agent',
      'commit',
      '-m',
      `Publish ${suiteId} standalone suite from psw.vibelandia.sing13`,
    ],
    { cwd: staging, stripGitInsteadOf: true },
  );
  if (commit.status !== 0) {
    console.error('Nothing to commit or commit failed');
    process.exit(1);
  }
  const token = githubToken();
  const ownerRepo = publicGitRemote(entry.github).replace(/^https:\/\/github\.com\//i, '');
  const pushRemote = token
    ? `https://x-access-token:${token}@github.com/${ownerRepo}`
    : remote;
  const push = run('git', ['push', pushRemote, 'HEAD:main', '--force'], {
    cwd: staging,
    stripGitInsteadOf: true,
    quiet: true,
  });
  if (push.status !== 0) {
    const err = String(push.stderr || push.stdout || '').replace(/x-access-token:[^@]+@/g, 'x-access-token:***@');
    console.error('Push failed. Staging left at', staging);
    console.error(err);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, suite: suiteId, remote, created, url: entry.github }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
