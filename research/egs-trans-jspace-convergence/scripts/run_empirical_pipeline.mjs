#!/usr/bin/env node
/**
 * EGS-TRANS-2026-0710 · empirical pipeline
 * Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import {
  DOCUMENT_ID,
  EGS_PHI,
  KING_BEE_ANCHOR_ISO,
  KING_BEE_SANDBOX_ISO,
  ANTHROPIC_JSPACE_PAPER_ISO,
} from '../src/constants.mjs';
import { fetchKingBeeWindowTelemetry } from '../src/github-telemetry.mjs';
import { fetchSolarSyncReport } from '../src/solar-sync.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA = join(ROOT, 'data');
const SCRIPTS = join(ROOT, 'scripts');

function daysBetween(isoA, isoB) {
  const a = new Date(isoA.includes('T') ? isoA : isoA + 'T12:00:00Z');
  const b = new Date(isoB.includes('T') ? isoB : isoB + 'T12:00:00Z');
  return Math.round((b - a) / 86400000);
}

function runPython(scriptName) {
  const py = process.env.PYTHON || 'python';
  execSync(`${py} "${join(SCRIPTS, scriptName)}"`, { stdio: 'inherit', cwd: ROOT });
}

async function main() {
  await mkdir(DATA, { recursive: true });

  const github = await fetchKingBeeWindowTelemetry();
  const solar = await fetchSolarSyncReport();

  let svdReport = null;
  let transformerReport = null;
  try {
    runPython('svd_workspace_probe.py');
    const { readFile } = await import('node:fs/promises');
    svdReport = JSON.parse(await readFile(join(DATA, 'svd_probe_report.json'), 'utf8'));
  } catch (e) {
    svdReport = { error: String(e.message || e) };
  }

  try {
    runPython('transformer_jspace_probe.py');
    const { readFile } = await import('node:fs/promises');
    transformerReport = JSON.parse(
      await readFile(join(DATA, 'transformer_probe_report.json'), 'utf8'),
    );
  } catch (e) {
    transformerReport = { skipped: true, error: String(e.message || e) };
  }

  const sing13Init = github.byRepo['FractiAI/psw.vibelandia.sing13']?.windows?.king_bee_init;
  const sing4Init = github.byRepo['FractiAI/psw.vibelandia.sing4']?.windows?.king_bee_init;
  const sing9Init = github.byRepo['FractiAI/psw.vibelandia.sing9']?.windows?.king_bee_init;

  const propagationDays = daysBetween('2026-06-01', ANTHROPIC_JSPACE_PAPER_ISO);

  const hypothesisTests = {
    E1_king_bee_repo_telemetry: {
      statement:
        'Public GitHub commits exist in sing13/sing4 during King Bee initialization window (2026-05-31 — 2026-06-01)',
      sing13_commits: sing13Init?.commitCount ?? 0,
      sing4_commits: sing4Init?.commitCount ?? 0,
      sing9_commits: sing9Init?.commitCount ?? 0,
      key_sing13_messages: (sing13Init?.commits || [])
        .filter((c) => /king bee|dph-gpu|wavefield/i.test(c.message))
        .map((c) => ({ sha: c.shaShort, date: c.date, message: c.message })),
      result:
        (sing13Init?.commitCount ?? 0) > 0 || (sing4Init?.commitCount ?? 0) > 0
          ? 'support'
          : 'refute',
      dataTier: 'public_github_api',
    },
    E2_svd_phi_decay: {
      statement:
        'φ-structured synthetic activation matrices yield higher near-φ singular-value ratios than i.i.d. Gaussian baselines',
      result: svdReport?.result || 'not_run',
      phiStructuredNearPhi: svdReport?.phiStructured?.fractionPrimaryNearPhi,
      randomNearPhi: svdReport?.randomBaseline?.fractionPrimaryNearPhi,
      dataTier: 'synthetic_numpy',
    },
    E3_propagation_window: {
      statement: 'June 1 → July 6 interval equals 35 days (catalog propagation claim)',
      measuredDays: propagationDays,
      claimedDays: 35,
      result: propagationDays === 35 ? 'support' : 'refute',
      dataTier: 'calendar_arithmetic',
    },
    E4_solar_disk_ssn: {
      statement: 'SILSO daily sunspot series is available for King Bee and J-Space windows (disk-integrated)',
      kingBeeMean: solar.windows.find((w) => w.id === 'king_bee_week')?.meanSsn,
      jspaceMean: solar.windows.find((w) => w.id === 'jspace_week')?.meanSsn,
      result: solar.windows.every((w) => w.sampleDays > 0) ? 'support' : 'refute',
      honesty: 'Per-AR character mapping not testable from SILSO alone',
      dataTier: 'public_silso',
    },
    E5_optional_transformer: {
      statement:
        'Optional open-weights mid-layer SVD probe (requires torch+transformers); φ proximity is falsifiable per forward pass',
      result: transformerReport?.skipped
        ? 'skipped'
        : transformerReport?.status === 'CONVERGED_SUCCESS'
          ? 'weak'
          : 'no_support',
      detail: transformerReport,
      dataTier: 'optional_open_weights',
    },
    E6_causal_anthropic_jspace: {
      statement:
        'Anthropic J-Space discovery was caused by King Bee weight-state propagation through open networks',
      result: 'not_testable_in_repo',
      note:
        'Narrative-tier postulate only. No independent access to Anthropic training checkpoints, Jacobian Lens telemetry, or June 11 internal audit logs.',
      dataTier: 'narrative_catalog',
    },
  };

  const report = {
    documentId: DOCUMENT_ID,
    generatedAt: new Date().toISOString(),
    operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
    egsPhi: EGS_PHI,
    anchors: {
      kingBeeSandbox: KING_BEE_SANDBOX_ISO,
      kingBeeNodeSweep: KING_BEE_ANCHOR_ISO,
      anthropicJSpacePaperClaim: ANTHROPIC_JSPACE_PAPER_ISO,
      coreRepos: ['FractiAI/psw.vibelandia.sing4', 'FractiAI/psw.vibelandia.sing9', 'FractiAI/psw.vibelandia.sing13'],
    },
    githubTelemetry: github,
    solarSync: solar,
    svdProbe: svdReport,
    transformerProbe: transformerReport,
    hypothesisTests,
    reproduceCommands: {
      monorepo: 'npm run research:egs-trans-jspace-convergence',
      standalone: 'npm run empirical',
      svdOnly: 'python scripts/svd_workspace_probe.py',
      transformerOptional: 'python scripts/transformer_jspace_probe.py [model] [layer] [prompt]',
      audit: 'npm run audit:paper -- --id=egs-trans-jspace-convergence-2026-07',
    },
    honestyNote:
      'E1–E5 test reproducible public or synthetic signals. E6 and Anthropic↔King Bee causality remain narrative until third-party instrument data is available. Correlation ≠ causation.',
  };

  const jsonPath = join(DATA, 'empirical_report.json');
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  const md = buildMarkdown(report);
  const mdPath = join(DATA, 'empirical_report.md');
  await writeFile(mdPath, md);

  console.log(JSON.stringify({ ok: true, jsonPath, mdPath, hypothesisTests }, null, 2));
}

function buildMarkdown(r) {
  const lines = [
    '# EGS-TRANS-2026-0710 · Empirical Report',
    '',
    `**Generated:** ${r.generatedAt}`,
    `**Operator:** ${r.operator}`,
    '',
    '## Hypothesis tests',
    '',
  ];
  for (const [id, t] of Object.entries(r.hypothesisTests)) {
    lines.push(`### ${id}`, `- **Result:** ${t.result}`, '');
  }
  lines.push('## Reproduce', '', '```bash', 'npm run empirical', '```', '', r.honestyNote);
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
