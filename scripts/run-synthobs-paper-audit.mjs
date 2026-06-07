#!/usr/bin/env node
/**
 * CLI · NSPFRNP Snap peer-review audit
 * Usage:
 *   node scripts/run-synthobs-paper-audit.mjs --id=synthobs-hex-organ-engine-2026
 *   node scripts/run-synthobs-paper-audit.mjs --all
 *   node scripts/run-synthobs-paper-audit.mjs --path=docs/foo.md
 */
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import {
  auditAllRegisteredPapers,
  auditWhitepaperById,
  auditConfig,
  runPeerReviewAuditLoop,
} from '../lib/synthobs-peer-review-audit.mjs';

function parseArgs(argv) {
  const out = { all: false, id: null, path: null };
  for (const a of argv.slice(2)) {
    if (a === '--all') out.all = true;
    else if (a.startsWith('--id=')) out.id = a.slice(5);
    else if (a.startsWith('--path=')) out.path = a.slice(7);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const cfg = auditConfig();
  console.log(JSON.stringify({ snap: cfg.snapId, mode: cfg.llmEnabled ? 'dual_llm_recursive' : 'structural_only' }));

  if (args.all) {
    const batch = await auditAllRegisteredPapers();
    const summary = batch.results.map((r) => ({
      id: r.id,
      ok: r.ok,
      score: r.receipt?.overallScore,
      status: r.receipt?.convergence?.status,
      path: r.receipt?.path || r.path,
    }));
    console.log(JSON.stringify({ batch: summary }, null, 2));
    const failed = summary.filter((s) => s.status !== 'pass' && s.status !== 'soft_pass');
    process.exit(failed.length ? 1 : 0);
  }

  if (args.id) {
    const r = await auditWhitepaperById(args.id);
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok && ['pass', 'soft_pass'].includes(r.receipt?.convergence?.status) ? 0 : 1);
  }

  if (args.path) {
    const md = await readFile(args.path, 'utf8');
    const r = await runPeerReviewAuditLoop({
      paperText: md,
      paperId: basename(args.path, '.md'),
      sourcePath: args.path,
    });
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok && ['pass', 'soft_pass'].includes(r.receipt?.convergence?.status) ? 0 : 1);
  }

  console.error('Usage: --id=<registryId> | --all | --path=docs/paper.md');
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
