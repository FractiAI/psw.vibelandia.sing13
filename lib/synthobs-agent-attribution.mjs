/**
 * SynthOBS Autonomous Agent attribution — mandatory for technical papers (NSPFRNP-SNAP-PRA-2026-06).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let manifestCache = null;

export async function loadSynthobsAgentManifest() {
  if (manifestCache) return manifestCache;
  const raw = await readFile(join(process.cwd(), 'data/synthobs-agent-manifest.json'), 'utf8');
  manifestCache = JSON.parse(raw);
  return manifestCache;
}

function metaAuditLine(receipt) {
  const ma = receipt?.metaAudit;
  if (!ma) return '';
  if (ma.dualMakeConfirmed && ma.iterationLogs?.length) {
    const last = ma.iterationLogs[ma.iterationLogs.length - 1];
    const rev = last.reviewer;
    const auth = last.author;
    const parts = [];
    if (rev) parts.push(`Reviewer: ${rev.make} ${rev.modelVersion || rev.model}`);
    if (auth) parts.push(`Author: ${auth.make} ${auth.modelVersion || auth.model}`);
    return parts.length ? `<p style="margin:0.35rem 0 0;">Meta-audit: ${parts.join(' · ')}</p>` : '';
  }
  if (ma.lanesPlanned) {
    const a = ma.lanesPlanned.author;
    const r = ma.lanesPlanned.reviewer;
    return `<p style="margin:0.35rem 0 0;">Lanes planned: Author <strong>${a.make}</strong> ${a.modelVersion} · Reviewer <strong>${r.make}</strong> ${r.modelVersion} (${ma.mode})</p>`;
  }
  return '';
}

export function attributionHtmlBlock(auditReceipt = null) {
  const structuralOnly =
    auditReceipt?.mode === 'structural_only' || auditReceipt?.metaAudit?.mode === 'structural_only';
  const auditLine = auditReceipt
    ? `Audit: <strong>${auditReceipt.snapId || 'NSPFRNP-SNAP-PRA-2026-06'}</strong> · score ${(auditReceipt.overallScore * 100).toFixed(0)}% · <code>${auditReceipt.auditId}</code>${structuralOnly ? ' · <strong>structural-only</strong> (deterministic checklist — not dual-LLM peer review)' : ''}`
    : 'Audit: pending · run <code>npm run audit:paper</code>';

  return `<aside class="synthobs-attribution" style="margin-top:2rem;padding:1rem 1.1rem;border-left:3px solid #d4af37;background:rgba(15,23,42,0.5);font-size:0.88rem;color:#94a3b8;">
<p style="margin:0 0 0.35rem;"><strong>Operator:</strong> SynthOBS Autonomous Agent · Syntheverse Sandbox</p>
<p style="margin:0;">${auditLine}</p>
${metaAuditLine(auditReceipt)}
</aside>`;
}

export function paperHasSynthobsAttribution(md) {
  const text = String(md || '').toLowerCase();
  return (
    text.includes('synthobs autonomous agent') ||
    text.includes('syntheverse sandbox') ||
    text.includes('synthobs agent')
  );
}
