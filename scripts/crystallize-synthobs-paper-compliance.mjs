#!/usr/bin/env node
/**
 * MCA Crystallize — inject PRA Snap compliance (honesty + doc ID + SynthOBS operator)
 * into registered whitepapers missing blockers. Then re-audit via npm run audit:papers.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { WHITEPAPER_REGISTRY } from '../lib/whitepaper-registry.mjs';
import { paperHasSynthobsAttribution } from '../lib/synthobs-agent-attribution.mjs';
import { auditAllRegisteredPapers } from '../lib/synthobs-peer-review-audit.mjs';

const SNAP = 'NSPFRNP-SNAP-PRA-2026-06';

function hasHonestyBoundary(md) {
  const lower = md.toLowerCase();
  return (
    lower.includes('honesty boundary') ||
    lower.includes('honesty tier') ||
    lower.includes('plain speak') ||
    lower.includes('what it does not') ||
    lower.includes('not claimed')
  );
}

function hasDocumentId(md) {
  return /document\s*(id|ref)|\*\*doc/i.test(md) || /docid/i.test(md);
}

function operatorBlock(registryId, entry) {
  const docId = entry.docId || registryId.toUpperCase();
  return `

---

## SynthOBS operator & PRA Snap audit

**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Audit snap:** ${SNAP}  
**Document ID:** ${docId}  
**Registry ID:** \`${registryId}\`  
**Re-audit:** \`npm run audit:paper -- --id=${registryId}\`

Technical delivery for this document is attributed to the SynthOBS Autonomous Agent operating inside the Syntheverse Sandbox (\`research/synthobs-sandbox/\`), unless explicitly marked Player 1 editorial.
`;
}

function honestyBlock() {
  return `

---

## Honesty boundary (PRA Snap compliance)

| Tier | Scope |
|------|--------|
| **Narrative / catalog** | SynthOBS sandbox mathematics, EGS φ framing, holographic story geometry |
| **Operational** | Surfaces, APIs, and reproducible commands documented in this repository |
| **Not claimed** | External journal acceptance, instrument-grade hardware proof, or production breakthroughs without separate validation |

Where empirical or movement data appear: **correlation ≠ causation** until multivariate controls are documented.
`;
}

function docIdHeaderLine(entry, registryId) {
  const docId = entry.docId || registryId;
  return `**Document ID:** ${docId}  \n`;
}

async function patchPaper(registryId, entry, root) {
  if (!entry.file) return { id: registryId, skipped: true, reason: 'redirect' };
  const abs = join(root, entry.file);
  let md;
  try {
    md = await readFile(abs, 'utf8');
  } catch {
    return { id: registryId, skipped: true, reason: 'file_missing', file: entry.file };
  }
  const before = md;
  let patched = [];

  if (!hasDocumentId(md)) {
    const titleMatch = md.match(/^#[^\n]+\n+/m);
    if (titleMatch) {
      const insertAt = titleMatch.index + titleMatch[0].length;
      md = md.slice(0, insertAt) + docIdHeaderLine(entry, registryId) + md.slice(insertAt);
      patched.push('document_id');
    }
  }

  if (!hasHonestyBoundary(md)) {
    md += honestyBlock();
    patched.push('honesty_boundary');
  }

  if (!paperHasSynthobsAttribution(md)) {
    md += operatorBlock(registryId, entry);
    patched.push('synthobs_operator');
  }

  if (md !== before) {
    await writeFile(abs, md, 'utf8');
    return { id: registryId, file: entry.file, patched };
  }
  return { id: registryId, file: entry.file, patched: [] };
}

async function buildAuditIndex(root, results) {
  const items = results
    .filter((r) => r.receipt)
    .map((r) => ({
      id: r.id,
      title: r.title,
      source: r.receipt.sourcePath,
      overallScore: r.receipt.overallScore,
      convergence: r.receipt.convergence,
      mode: r.receipt.mode,
      blockers: r.receipt.final?.criticalBlockers || [],
      auditId: r.receipt.auditId,
      updated: r.receipt.completedAt,
      metaAudit: r.receipt.metaAudit
        ? {
            dualMakeConfirmed: r.receipt.metaAudit.dualMakeConfirmed,
            mode: r.receipt.metaAudit.mode,
            authorMake: r.receipt.metaAudit.lanesPlanned?.author?.make,
            authorModel: r.receipt.metaAudit.lanesPlanned?.author?.modelVersion,
            reviewerMake: r.receipt.metaAudit.lanesPlanned?.reviewer?.make,
            reviewerModel: r.receipt.metaAudit.lanesPlanned?.reviewer?.modelVersion,
          }
        : null,
    }))
    .sort((a, b) => b.overallScore - a.overallScore);

  const pass = items.filter((i) => i.convergence?.status === 'pass').length;
  const soft = items.filter((i) => i.convergence?.status === 'soft_pass').length;
  const plateau = items.filter((i) => i.convergence?.status === 'plateau').length;
  const capped = items.filter((i) => i.convergence?.status === 'capped').length;
  const missing = results
    .filter((r) => r.code === 'read_error' || r.skipped)
    .map((r) => ({ id: r.id, reason: r.code || r.reason, file: r.message }));

  const index = {
    schema: 'synthobs-paper-audit-index/v1',
    snapId: SNAP,
    operator: 'SynthOBS Autonomous Agent',
    sandbox: 'Syntheverse Sandbox',
    generatedAt: new Date().toISOString(),
    mca: { metabolize: 'batch audit', crystallize: 'compliance blocks', animate: 'catalog v2 + receipts', squeeze: 'this index' },
    summary: { total: items.length, pass, softPass: soft, plateau, capped, missingFiles: missing.length },
    missingFiles: missing,
    items,
  };
  await mkdir(join(root, 'data'), { recursive: true });
  await writeFile(join(root, 'data/synthobs-paper-audit-index.json'), JSON.stringify(index, null, 2), 'utf8');
  return index;
}

async function main() {
  const root = process.cwd();
  const patches = [];
  for (const [id, entry] of Object.entries(WHITEPAPER_REGISTRY)) {
    patches.push(await patchPaper(id, entry, root));
  }
  const changed = patches.filter((p) => p.patched?.length);
  console.log(JSON.stringify({ crystallized: changed.length, patches: changed }, null, 2));

  const batch = await auditAllRegisteredPapers({ cwd: root });
  const index = await buildAuditIndex(root, batch.results);
  console.log(JSON.stringify({ squeeze: index.summary }, null, 2));

  const below = index.items.filter(
    (i) => !['pass', 'soft_pass'].includes(i.convergence?.status)
  );
  if (below.length) {
    console.log(JSON.stringify({ needsWork: below.map((i) => ({ id: i.id, score: i.overallScore, status: i.convergence?.status, blockers: i.blockers })) }, null, 2));
  }
  process.exit(below.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
