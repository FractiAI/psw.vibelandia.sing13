import {
  DOC_ID,
  HONESTY,
  REGISTRY_ID,
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  EXPEDITION,
} from './constants.mjs';
import { runTrgmLaboratory } from './computational-lab.mjs';
import { runHistoricalLaboratory } from './historical-lab.mjs';
import { runMolecularTheaterLaboratory } from './molecular-theater.mjs';

/**
 * Core synthetic E1–E5 · Historical H1–H3 · Molecular theater M1–M5
 * (DNA/chromosome as physical theater where TRGM executes).
 */
export async function runAllExperiments() {
  const lab = runTrgmLaboratory();
  const historical = await runHistoricalLaboratory();
  const molecular = runMolecularTheaterLaboratory();
  const experiments = [
    {
      id: 'E1',
      title: 'Wave–Node foundation A–E still pass (imported battery)',
      pass: lab.foundation.allPass,
      foundation: lab.foundation,
      interpretation: lab.foundation.allPass
        ? `Foundation intact · FDTD order ≈ ${Number(lab.foundation.waveOrder).toFixed(3)}`
        : 'Foundation Wave–Node battery failed — TRGM cannot claim scaffold validity.',
      evidence: 'numerically_verified',
      data: 'synthetic',
    },
    {
      id: 'E2',
      title: 'Held-out tiny-reality Goldilocks viability',
      pass: lab.held.summary.viabilityRate >= 0.75,
      held: lab.held.summary,
      interpretation: `Held-out viability ${(lab.held.summary.viabilityRate * 100).toFixed(1)}% (n=${lab.held.n}).`,
      evidence: 'empirically_observed',
      data: 'synthetic',
    },
    {
      id: 'E3',
      title: 'TRGM beats null unstructured scatter on viability',
      pass: lab.summary.trgmBeatsNull,
      trgm: lab.held.summary.viabilityRate,
      nullRate: lab.nullBaseline.viabilityRate,
      interpretation: lab.summary.trgmBeatsNull
        ? 'Structured Wave–Node scaffolds out-viable random scatters under pre-registered gates.'
        : 'TRGM did not beat null — do not pin.',
      evidence: 'empirically_observed',
      data: 'synthetic',
    },
    {
      id: 'E4',
      title: 'Nested L0→L1 child descriptors present',
      pass: lab.nesting.allHaveChild,
      nesting: lab.nesting,
      interpretation: lab.nesting.allHaveChild
        ? 'Every held-out L0 reality carries an L1 nested child recipe.'
        : 'Nesting incomplete.',
      evidence: 'empirically_observed',
      data: 'synthetic',
    },
    {
      id: 'E5',
      title: 'Phase is steering delta (soft); hard viability = geo+wave+nav',
      pass:
        lab.phaseSteering?.hardGate === false &&
        lab.held.summary.viabilityRate >= 0.75 &&
        (lab.phaseSteering?.softPhaseOkRate ?? 0) >= 0,
      softPhaseOkRate: lab.phaseSteering?.softPhaseOkRate,
      hardGate: lab.phaseSteering?.hardGate,
      interpretation: lab.summary.phaseRole,
      evidence: 'empirically_observed',
      data: 'synthetic',
    },
  ];

  const historicalExperiments = (historical.hypotheses || []).map((h) => ({
    id: h.id,
    title: h.title,
    pass: h.pass,
    interpretation: h.detail?.interpretation || h.interpretation || h.title,
    detail: h.detail,
    evidence: h.evidence,
    data: h.data,
  }));

  const molecularExperiments = (molecular.hypotheses || []).map((h) => ({
    id: h.id,
    title: h.title,
    pass: h.pass,
    interpretation: h.interpretation || h.title,
    detail: h.detail,
    evidence: h.evidence,
    data: h.data,
  }));

  // Core all_pass includes E* + M* (molecular theater is part of the model now).
  const core = [...experiments, ...molecularExperiments];
  const n_pass = core.filter((e) => e.pass).length;
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    expedition: EXPEDITION,
    honesty: HONESTY,
    lab,
    historical,
    molecular,
    experiments: core,
    syntheticExperiments: experiments,
    historicalExperiments,
    molecularExperiments,
    n_pass,
    n_total: core.length,
    all_pass: n_pass === core.length,
    historical_n_pass: historicalExperiments.filter((e) => e.pass).length,
    historical_n_total: historicalExperiments.length,
    historical_all_pass: Boolean(historical.ok) && historicalExperiments.every((e) => e.pass),
    historical_ran: Boolean(historical.ok),
    molecular_ran: Boolean(molecular.ok),
    molecular_n_pass: molecularExperiments.filter((e) => e.pass).length,
    molecular_n_total: molecularExperiments.length,
    molecular_all_pass: Boolean(molecular.ok) && molecularExperiments.every((e) => e.pass),
    enginePinRecommended: lab.summary.enginePinRecommended && Boolean(molecular.ok) && molecular.all_pass,
  };
}
