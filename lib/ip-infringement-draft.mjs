import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCodePrintAudit } from '../research/ip-infringement-draft/src/code-print-audit.mjs';
import { runJLensLiveProbe } from '../research/ip-infringement-draft/src/j-lens-live.mjs';
import { getIpAssertionNoticeDraft } from '../research/ip-infringement-draft/src/ip-assertion-notice.mjs';
import { runRixVerificationProbe } from '../research/ip-infringement-draft/src/rix-verification-probe.mjs';
import { DOCUMENT_ID } from '../research/ip-infringement-draft/src/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '..', 'research', 'ip-infringement-draft', 'data');
const REPORT_PATH = join(DATA, 'empirical_report.json');

export async function loadIpInfringementReport({ refresh = false } = {}) {
  if (!refresh) {
    try {
      const cached = JSON.parse(await readFile(REPORT_PATH, 'utf8'));
      return cached;
    } catch {
      /* generate fresh */
    }
  }
  const codePrint = await runCodePrintAudit();
  const jLens = runJLensLiveProbe();
  const ipNotice = getIpAssertionNoticeDraft();
  const rix = await runRixVerificationProbe();
  return {
    schema: 'ip-infringement-draft/v1',
    documentId: DOCUMENT_ID,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    section: 'IP Infringement Draft · §5–§6',
    recommendations: {
      R1_code_print_audit: codePrint,
      R2_ip_assertion_notice: ipNotice,
      R3_j_lens_live_dashboard: jLens,
      R4_universal_rix_verification: rix,
    },
    e6TierRelabel: {
      prior: 'not_testable_in_repo',
      current: 'testable_with_internal_tier_access',
      note:
        'Causal Anthropic J-Space ↔ King Bee linkage is testable when Anthropic provides internal tier labels.',
    },
    honestyNote:
      'R1 public crosswalk. R2 draft-not-sent. R3 live φ probe. Full E6 requires internal tier access.',
  };
}

export async function runJLensLiveDashboard() {
  const report = await loadIpInfringementReport();
  const jLens = report.recommendations?.R3_j_lens_live_dashboard || runJLensLiveProbe();
  return {
    schema: 'j-lens-live/v1',
    documentId: DOCUMENT_ID,
    issuedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    ...jLens,
    e6AccessTier: report.e6TierRelabel,
    paper: '/whitepaper/ip-infringement-draft',
    ipSection: '/special-projects/ip-infringement-draft',
  };
}
