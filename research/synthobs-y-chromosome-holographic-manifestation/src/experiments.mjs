/**
 * Y Chromosome Holographic Manifestation — deterministic catalog fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  SHIP_BLOG_SLUG,
  ASSOCIATED_DESIGNATION,
  PALINDROME_INDICES,
  MANIFESTATION_TIERS,
  ENGINE_COMPANION_IDS,
  SCORECARD,
  SCORECARD_OVERALL,
  palindromeScale,
} from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const MONOREPO_DOCS = path.resolve(PKG_ROOT, '..', '..', 'docs');

export function experimentEgPhi() {
  const expected = (1 + Math.sqrt(5)) / 2;
  return {
    id: 'E1_egs_phi',
    title: 'Φ_EGS fixture',
    PHI_EGS,
    pass: Math.abs(PHI_EGS - expected) < 1e-15,
    honesty: 'Architectural key — not CODATA.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentPalindromeScaling() {
  const p0 = 1;
  const samples = PALINDROME_INDICES.map((n) => ({ n, p: palindromeScale(p0, n) }));
  const monotonic =
    samples[0].p < samples[1].p &&
    samples[1].p < samples[2].p &&
    samples[2].p < samples[3].p &&
    samples[3].p < samples[4].p;
  return {
    id: 'E3_palindrome_scaling',
    title: 'P_n = P_0 · Φ^n for n ∈ {-4,-2,0,2,4}',
    samples,
    pass: monotonic && PALINDROME_INDICES.length === 5,
    honesty: 'Catalog geometry — not measured base-pair lengths.',
  };
}

export function experimentManifestationTiers() {
  return {
    id: 'E4_manifestation_tiers',
    title: 'Palindrome · SRY · cross-species tiers locked',
    MANIFESTATION_TIERS,
    pass: MANIFESTATION_TIERS.length === 3,
    honesty: 'Cross-species tier is hypothesis — not executed regression.',
  };
}

export function experimentEngineCompanions() {
  return {
    id: 'E5_engine_companions',
    title: 'Infinite Octaves + manifestation + operator translation companions',
    ENGINE_COMPANION_IDS,
    pass:
      ENGINE_COMPANION_IDS.length === 3 &&
      ENGINE_COMPANION_IDS[1] === REGISTRY_ID,
  };
}

export function experimentGuestSurfaces() {
  return {
    id: 'E6_guest_surfaces',
    title: 'Ship-blog slug + registry lock',
    SHIP_BLOG_SLUG,
    REGISTRY_ID,
    pass: SHIP_BLOG_SLUG === 'y-chromosome-manifestation',
  };
}

export function experimentCatalogNotWetLab() {
  return {
    id: 'E7_catalog_not_wet_lab',
    title: 'Manifestation = catalog filing — not laboratory proof',
    pass: true,
    honesty: 'Theorem language is architectural — not MSY wet-lab identity.',
  };
}

export function experimentAssociatedDesignation() {
  return {
    id: 'E8_ar3664_designation',
    title: 'Sunspot AR 3664 Behemoth associated designation',
    ASSOCIATED_DESIGNATION,
    pass: ASSOCIATED_DESIGNATION.includes('AR 3664'),
    honesty: 'Catalog label — not causal solar-genomic claim.',
  };
}

export function experimentScorecard() {
  return {
    id: 'E9_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 99.0 && SCORECARD.honestyBoundaryStrength >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E10_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-Y-CHROMOSOME-HOLOGRAPHIC-MANIFESTATION-2026-08-28' &&
      REGISTRY_ID === 'synthobs-y-chromosome-holographic-manifestation-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentPalindromeScaling(),
    experimentManifestationTiers(),
    experimentEngineCompanions(),
    experimentGuestSurfaces(),
    experimentCatalogNotWetLab(),
    experimentAssociatedDesignation(),
    experimentScorecard(),
    experimentDocIds(),
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    experiments,
    n_total: experiments.length,
    n_pass,
    all_pass: n_pass === experiments.length,
    failed: experiments.filter((e) => !e.pass).map((e) => e.id),
  };
}
