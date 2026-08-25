/**
 * Official Prospectus — deterministic narrative catalog fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PHI_EGS,
  DOC_ID,
  REGISTRY_ID,
  PAPER_NAME,
  GRAND_ARC_BEATS,
  VESSEL_SPECS,
  EXPERIENTIAL_PILLARS,
  SHIP_DOORS,
  PLAYER_LOOP,
  SCORECARD,
  SCORECARD_OVERALL,
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
    honesty: 'Architectural key — not a CODATA or consciousness clock.',
  };
}

export function experimentGoldenIdentity() {
  return {
    id: 'E2_phi_identity',
    title: 'Φ² = Φ + 1',
    pass: Math.abs(PHI_EGS * PHI_EGS - (PHI_EGS + 1)) < 1e-12,
  };
}

export function experimentGrandArc() {
  return {
    id: 'E3_grand_arc_beats',
    title: 'Three-beat grand arc locked',
    GRAND_ARC_BEATS,
    pass:
      GRAND_ARC_BEATS.length === 3 &&
      GRAND_ARC_BEATS[0] === 'pre_temporal_genesis' &&
      GRAND_ARC_BEATS[1] === 'great_convergence_boriken' &&
      GRAND_ARC_BEATS[2] === 'present_anchor_reno',
    honesty: 'Narrative canon — not predictive astrology.',
  };
}

export function experimentVesselSpecs() {
  return {
    id: 'E4_vessel_specs',
    title: '432 / 729 / 100 BPM · Proto 3664 · Electro 3923',
    VESSEL_SPECS,
    pass:
      VESSEL_SPECS.tuningHz === 432 &&
      VESSEL_SPECS.anchorHz === 729 &&
      VESSEL_SPECS.tempoBpm === 100 &&
      VESSEL_SPECS.protoRegion === 3664 &&
      VESSEL_SPECS.electroRegion === 3923 &&
      VESSEL_SPECS.scope === 'QUESTFEST_24x365',
    honesty: 'Aesthetic / navigation labels — not medical therapy claims.',
  };
}

export function experimentPillars() {
  return {
    id: 'E5_experiential_pillars',
    title: 'Three experiential pillars locked',
    EXPERIENTIAL_PILLARS,
    pass: EXPERIENTIAL_PILLARS.length === 3,
  };
}

export function experimentShipDoors() {
  return {
    id: 'E6_ship_doors',
    title: 'Journey · Jukebox · Library · Creator Studio',
    SHIP_DOORS,
    pass:
      SHIP_DOORS.length === 4 &&
      SHIP_DOORS.includes('journey') &&
      SHIP_DOORS.includes('creator_studio'),
  };
}

export function experimentPlayerLoop() {
  return {
    id: 'E7_player_loop',
    title: 'SEE → … → SEE AGAIN (MCA rhythm)',
    PLAYER_LOOP,
    pass: PLAYER_LOOP.length === 6 && PLAYER_LOOP[0] === 'SEE' && PLAYER_LOOP[5] === 'SEE_AGAIN',
  };
}

export function experimentScorecard() {
  return {
    id: 'E8_scorecard',
    title: 'Authored scorecard overall locks',
    SCORECARD,
    SCORECARD_OVERALL,
    pass: SCORECARD_OVERALL === 98.9 && SCORECARD.honestyBoundaryStrength >= 99,
  };
}

export function experimentDocIds() {
  const p1 = path.join(MONOREPO_DOCS, PAPER_NAME);
  const p2 = path.join(PKG_ROOT, 'docs', PAPER_NAME);
  return {
    id: 'E9_doc_ids_paper',
    title: 'Document / registry IDs locked and paper on disk',
    DOC_ID,
    REGISTRY_ID,
    pass:
      DOC_ID === 'WP-SYNTHOBS-SS-VIBELANDIA-OFFICIAL-PROSPECTUS-2026-08-25' &&
      REGISTRY_ID === 'synthobs-ss-vibelandia-official-prospectus-2026-08' &&
      (fs.existsSync(p1) || fs.existsSync(p2)),
  };
}

export async function runAllExperiments() {
  const experiments = [
    experimentEgPhi(),
    experimentGoldenIdentity(),
    experimentGrandArc(),
    experimentVesselSpecs(),
    experimentPillars(),
    experimentShipDoors(),
    experimentPlayerLoop(),
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
