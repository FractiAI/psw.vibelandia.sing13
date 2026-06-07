#!/usr/bin/env node
/**
 * Cursor hook · PRA Snap auto-audit (structural_only — no API keys).
 * afterFileEdit: record whitepaper paths touched this conversation.
 * stop: run deterministic rubric; auto-follow-up agent if blockers remain.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WHITEPAPER_REGISTRY } from '../../lib/whitepaper-registry.mjs';
import {
  auditWhitepaperById,
  auditConfig,
  runPeerReviewAuditLoop,
} from '../../lib/synthobs-peer-review-audit.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const STATE_DIR = join(__dirname, 'state');
const STATE_FILE = join(STATE_DIR, 'pra-snap-edits.json');

const PAPER_PATH_RE = /^(docs|protocols)\/.+\.md$/i;

function normalizeRel(filePath, workspaceRoots = []) {
  const abs = resolve(filePath);
  const root =
    workspaceRoots.map((r) => resolve(r)).find((r) => abs.startsWith(r + '/') || abs.startsWith(r + '\\')) ||
    REPO_ROOT;
  return relative(root, abs).replace(/\\/g, '/');
}

function resolveRegistryId(relPath) {
  for (const [id, entry] of Object.entries(WHITEPAPER_REGISTRY)) {
    if (entry.file === relPath) return id;
  }
  return null;
}

function isPaperPath(relPath) {
  return PAPER_PATH_RE.test(relPath) || !!resolveRegistryId(relPath);
}

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8'));
  } catch {
    return { conversations: {} };
  }
}

async function saveState(state) {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

async function recordEdit(payload) {
  const rel = normalizeRel(payload.file_path, payload.workspace_roots);
  if (!isPaperPath(rel)) return;

  const state = await loadState();
  const cid = payload.conversation_id || 'default';
  const bucket = state.conversations[cid] || { files: [] };
  const entry = { rel, registryId: resolveRegistryId(rel), at: new Date().toISOString() };
  const key = `${rel}`;
  bucket.files = bucket.files.filter((f) => f.rel !== rel);
  bucket.files.push(entry);
  state.conversations[cid] = bucket;
  await saveState(state);
}

async function auditEntry(entry) {
  if (entry.registryId) {
    return auditWhitepaperById(entry.registryId, { cwd: REPO_ROOT });
  }
  const abs = join(REPO_ROOT, entry.rel);
  const md = await readFile(abs, 'utf8');
  return runPeerReviewAuditLoop({
    paperText: md,
    paperId: entry.rel.replace(/\//g, '-').replace(/\.md$/i, ''),
    sourcePath: entry.rel,
    cwd: REPO_ROOT,
  });
}

function summarizeResult(entry, result) {
  const receipt = result.receipt || result;
  return {
    rel: entry.rel,
    registryId: entry.registryId,
    ok: result.ok,
    score: receipt.overallScore,
    status: receipt.convergence?.status,
    blockers: receipt.criticalBlockers || [],
  };
}

async function runStopAudits(payload) {
  if (payload.status !== 'completed') return null;

  const state = await loadState();
  const cid = payload.conversation_id || 'default';
  const bucket = state.conversations[cid];
  if (!bucket?.files?.length) return null;

  const cfg = auditConfig();
  const unique = [...new Map(bucket.files.map((f) => [f.rel, f])).values()];
  const summaries = [];

  for (const entry of unique) {
    try {
      const result = await auditEntry(entry);
      summaries.push(summarizeResult(entry, result));
    } catch (e) {
      summaries.push({
        rel: entry.rel,
        registryId: entry.registryId,
        ok: false,
        status: 'error',
        blockers: [e.message],
      });
    }
  }

  delete state.conversations[cid];
  await saveState(state);

  const failed = summaries.filter(
    (s) => !s.ok || !['pass', 'soft_pass'].includes(s.status)
  );

  console.error(
    JSON.stringify({
      hook: 'synthobs-pra-snap',
      mode: cfg.llmEnabled ? 'dual_llm_recursive' : 'structural_only',
      audited: summaries,
    })
  );

  if (!failed.length) return null;

  const lines = failed.map((f) => {
    const id = f.registryId ? `id=${f.registryId}` : `path=${f.rel}`;
    const blockers = (f.blockers || []).slice(0, 5).join('; ') || 'see receipt';
    return `- ${id} · score=${f.score ?? 'n/a'} · status=${f.status} · blockers: ${blockers}`;
  });

  return [
    'PRA Snap structural audit (SynthOBS · no API keys) found blockers on edited whitepaper(s).',
    'Fix honesty boundary, Document ID, SynthOBS attribution, and proportionate claims; then save.',
    '',
    ...lines,
    '',
    'Receipts: data/synthobs-paper-audits/{paperId}.json',
    'Protocol: protocols/NSPFRNP_SNAP_PEER_REVIEW_AUDIT.md',
  ].join('\n');
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const raw = await readStdin();
  const payload = JSON.parse(raw || '{}');
  const event = payload.hook_event_name;

  if (event === 'afterFileEdit') {
    await recordEdit(payload);
    return;
  }

  if (event === 'stop') {
    const followup = await runStopAudits(payload);
    if (followup) {
      process.stdout.write(JSON.stringify({ followup_message: followup }));
    }
  }
}

main().catch((e) => {
  console.error('[synthobs-pra-snap-hook]', e);
  process.exit(0);
});
