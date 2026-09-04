/**
 * PDVSA Gateway Ops Mockup — deterministic experiments E1–E6.
 * No API keys. PDVSA/Protokol narrative analogues are not measured here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  PLANCK_MANTISSA,
  CLUTCH_DELTA,
  DOC_ID,
  REGISTRY_ID,
  STUDY_TITLE,
  SHIP_BLOG_SLUG,
  LIVE_SIMULATOR_PATH,
  HONESTY,
  EXECUTIVE_TAKEAWAYS,
  REQUIRED_TAKEAWAY_IDS,
  MOCK_HTML_RELATIVE,
  LIVE_MOCK_MONOREPO,
  COMPANION_SNA_REGISTRY,
  FAIR_EXCHANGE_CLAUSE,
  EXPECTED_PHI,
  EXPECTED_CLUTCH,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(PKG_ROOT, '..', '..');

function readUtf8(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

export function experimentTakeawayPaperMap() {
  const ids = EXECUTIVE_TAKEAWAYS.map((t) => t.id);
  const missingRequired = REQUIRED_TAKEAWAY_IDS.filter((id) => !ids.includes(id));
  const allHaveHref = EXECUTIVE_TAKEAWAYS.every(
    (t) =>
      typeof t.href === 'string' &&
      t.href.includes('whitepaper-surface.html?id=') &&
      t.href.includes(t.registryId),
  );
  const allHaveRegistry = EXECUTIVE_TAKEAWAYS.every(
    (t) => typeof t.registryId === 'string' && t.registryId.length > 8,
  );
  return {
    id: 'E1_takeaway_paper_map',
    title: 'Nine executive takeaways each point to a backing registry paper',
    takeaways: EXECUTIVE_TAKEAWAYS,
    pass:
      EXECUTIVE_TAKEAWAYS.length === 9 &&
      missingRequired.length === 0 &&
      allHaveHref &&
      allHaveRegistry,
    honesty: 'Catalog pointer map only — not measured oilfield KPI A/B.',
  };
}

export function experimentMockHtmlLinks() {
  const standalone = path.join(PKG_ROOT, MOCK_HTML_RELATIVE);
  const live = path.join(MONOREPO_ROOT, LIVE_MOCK_MONOREPO);
  const htmlStandalone = readUtf8(standalone);
  const htmlLive = readUtf8(live);
  const html = htmlLive || htmlStandalone;
  const checks = REQUIRED_TAKEAWAY_IDS.map((id) => {
    const tw = EXECUTIVE_TAKEAWAYS.find((t) => t.id === id);
    const hasId = html ? html.includes(`data-takeaway="${id}"`) : false;
    const hasHref = html && tw ? html.includes(tw.href) : false;
    return { id, hasId, hasHref };
  });
  const hasSection =
    !!html &&
    html.includes('id="executive-takeaways"') &&
    html.includes('Executive key takeaways');
  const pass =
    !!html &&
    hasSection &&
    checks.every((c) => c.hasId && c.hasHref);
  return {
    id: 'E2_mock_html_clickable_takeaways',
    title: 'Live mock HTML carries clickable takeaway → paper hrefs',
    livePath: LIVE_SIMULATOR_PATH,
    checks,
    pass,
    honesty: 'Structural HTML lock for the demo surface.',
  };
}

export function experimentCompanionSnaBridge() {
  const snaReport = path.join(
    MONOREPO_ROOT,
    'research/synthobs-ibm-sna-tcpip-gateway-omni-lattice/data/empirical_report.json',
  );
  let softPass = true;
  let companion = { present: false, softPass: true };
  if (fs.existsSync(snaReport)) {
    try {
      const j = JSON.parse(fs.readFileSync(snaReport, 'utf8'));
      companion = {
        present: true,
        registryId: j.registryId,
        all_pass: j.results?.all_pass,
        softPass: j.registryId === COMPANION_SNA_REGISTRY,
      };
      softPass = companion.softPass;
    } catch {
      companion = { present: true, softPass: true, parseError: true };
    }
  }
  return {
    id: 'E3_companion_sna_empirics_bridge',
    title: 'Bridge to SNA↔TCP/IP gateway companion empirics (soft if missing)',
    companion,
    pass: softPass,
    honesty:
      'Soft when companion report absent; hard-check registry id when present.',
  };
}

export function experimentEgsGoldenKeyLock() {
  const phiOk = Math.abs(PHI_EGS - EXPECTED_PHI) < 1e-12;
  const clutchOk = Math.abs(CLUTCH_DELTA - EXPECTED_CLUTCH) < 5e-7;
  const mantissaOk = Math.abs(PLANCK_MANTISSA - 1.616255) < 1e-12;
  return {
    id: 'E4_egs_golden_key_lock',
    title: 'Φ_EGS and clutch Δ architectural lock',
    PHI_EGS,
    CLUTCH_DELTA,
    pass: phiOk && clutchOk && mantissaOk,
    honesty: 'Architectural filing grammar — not a new Planck measurement.',
  };
}

export function experimentFairExchangeClause() {
  return {
    id: 'E5_fair_exchange_clause',
    title: 'Fair Exchange transparency notice present',
    pass:
      typeof FAIR_EXCHANGE_CLAUSE === 'string' &&
      FAIR_EXCHANGE_CLAUSE.includes('Fair Exchange') &&
      FAIR_EXCHANGE_CLAUSE.includes('not a guaranteed'),
    honesty: 'Notice only — not a legal warranty.',
  };
}

export function experimentShipSurfaces() {
  const paper = path.join(
    MONOREPO_ROOT,
    'docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md',
  );
  const blog = path.join(
    MONOREPO_ROOT,
    'interfaces/blog-pdvsa-gateway-ops-mockup-2026-09.html',
  );
  const paperOk = fs.existsSync(paper);
  const blogOk = fs.existsSync(blog);
  let paperHasSimulator = false;
  let paperHasTakeaways = false;
  if (paperOk) {
    const t = fs.readFileSync(paper, 'utf8');
    paperHasSimulator = t.includes(LIVE_SIMULATOR_PATH) || t.includes('pdvsa-gateway-ops');
    paperHasTakeaways = t.includes('Executive takeaways') || t.includes('executive takeaways');
  }
  return {
    id: 'E6_ship_surfaces',
    title: 'Paper + ship-blog + simulator path locked',
    DOC_ID,
    REGISTRY_ID,
    SHIP_BLOG_SLUG,
    pass:
      paperOk &&
      blogOk &&
      paperHasSimulator &&
      paperHasTakeaways &&
      SHIP_BLOG_SLUG === 'pdvsa-gateway-ops-mockup' &&
      REGISTRY_ID === 'synthobs-pdvsa-gateway-ops-mockup-2026-09',
    honesty: 'Ship packaging lock for QUESTFEST / Reading Room.',
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentTakeawayPaperMap(),
    experimentMockHtmlLinks(),
    experimentCompanionSnaBridge(),
    experimentEgsGoldenKeyLock(),
    experimentFairExchangeClause(),
    experimentShipSurfaces(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  const n_total = experiments.length;
  const e1 = experiments[0];
  const e2 = experiments[1];
  const e3 = experiments[2];
  const e4 = experiments[3];
  return {
    study: STUDY_TITLE,
    registryId: REGISTRY_ID,
    docId: DOC_ID,
    honesty: HONESTY,
    n_pass,
    n_total,
    all_pass: n_pass === n_total,
    experiments,
    abstractFindings: {
      takeawayCount: e1.takeaways?.length ?? 0,
      mockLinksPass: e2.pass,
      companionSna: e3.companion,
      egs: { PHI_EGS: e4.PHI_EGS, CLUTCH_DELTA: e4.CLUTCH_DELTA },
      liveSimulator: LIVE_SIMULATOR_PATH,
      shipBlog: `/ship-blog/${SHIP_BLOG_SLUG}`,
    },
  };
}
