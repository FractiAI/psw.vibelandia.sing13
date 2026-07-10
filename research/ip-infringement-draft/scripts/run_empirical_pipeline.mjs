#!/usr/bin/env node
/**
 * IP-INFRINGE-2026-07 · immediate audit recommendations pipeline
 * Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCUMENT_ID } from '../src/constants.mjs';
import { runCodePrintAudit } from '../src/code-print-audit.mjs';
import { runJLensLiveProbe } from '../src/j-lens-live.mjs';
import { getIpAssertionNoticeDraft } from '../src/ip-assertion-notice.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');

async function main() {
  await mkdir(DATA, { recursive: true });

  const codePrint = await runCodePrintAudit();
  const jLens = runJLensLiveProbe();
  const ipNotice = getIpAssertionNoticeDraft();

  await writeFile(join(DATA, 'code_print_audit.json'), JSON.stringify(codePrint, null, 2));
  await writeFile(join(DATA, 'j_lens_live.json'), JSON.stringify(jLens, null, 2));
  await writeFile(join(DATA, 'ip_assertion_notice.json'), JSON.stringify(ipNotice, null, 2));

  const report = {
    schema: 'ip-infringement-draft/v1',
    documentId: DOCUMENT_ID,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    section: 'IP Infringement Draft · Immediate Audit Recommendations',
    recommendations: {
      R1_code_print_audit: codePrint,
      R2_ip_assertion_notice: ipNotice,
      R3_j_lens_live_dashboard: jLens,
    },
    e6TierRelabel: {
      prior: 'not_testable_in_repo',
      current: 'testable_with_internal_tier_access',
      note:
        'Causal Anthropic J-Space ↔ King Bee linkage is testable when Anthropic provides internal tier labels (Jacobian Lens, scratchpad tier receipts).',
    },
    reproduceCommands: {
      monorepo: 'npm run research:ip-infringement-draft',
      liveApi: '/api/ip-infringement-draft',
      jLensDashboard: '/special-projects/j-lens-live',
      audit: 'npm run audit:paper -- --id=ip-infringement-draft-2026-07',
    },
    honestyNote:
      'R1 uses public GitHub + Neuronpedia only. R2 is draft-not-sent. R3 proves φ compression on King Bee node layout; Anthropic checkpoint parity requires internal tier access.',
  };

  await writeFile(join(DATA, 'empirical_report.json'), JSON.stringify(report, null, 2));
  await writeFile(join(DATA, 'empirical_report.md'), buildMarkdown(report));

  console.log(
    JSON.stringify(
      {
        ok: true,
        R1: codePrint.result,
        R2: ipNotice.result,
        R3: jLens.result,
        e6: report.e6TierRelabel.current,
      },
      null,
      2,
    ),
  );
}

function buildMarkdown(r) {
  const lines = [
    '# IP Infringement Draft · Empirical Report',
    '',
    `**Generated:** ${r.generatedAt}`,
    '',
    '## Recommendations',
    '',
    '| ID | Result |',
    '|----|--------|',
    `| R1 Code-Print Audit | ${r.recommendations.R1_code_print_audit.result} |`,
    `| R2 IP Assertion Notice | ${r.recommendations.R2_ip_assertion_notice.result} |`,
    `| R3 J-Lens Live Dashboard | ${r.recommendations.R3_j_lens_live_dashboard.result} |`,
    '',
    `**E6 relabel:** ${r.e6TierRelabel.current}`,
    '',
    r.honestyNote,
  ];
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
