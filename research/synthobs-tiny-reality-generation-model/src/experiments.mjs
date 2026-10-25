import {
  DOC_ID,
  HONESTY,
  REGISTRY_ID,
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
  EXPEDITION,
} from './constants.mjs';
import { runTrgmLaboratory } from './computational-lab.mjs';

export function runAllExperiments() {
  const lab = runTrgmLaboratory();
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
    },
    {
      id: 'E2',
      title: 'Held-out tiny-reality Goldilocks viability',
      pass: lab.held.summary.viabilityRate >= 0.75,
      held: lab.held.summary,
      interpretation: `Held-out viability ${(lab.held.summary.viabilityRate * 100).toFixed(1)}% (n=${lab.held.n}).`,
      evidence: 'empirically_observed',
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
    },
    {
      id: 'E5',
      title: 'Phase-gate ablation still leaves geo+wave+nav band',
      pass: lab.ablationNoPhaseGate.viabilityRate >= lab.held.summary.viabilityRate - 1e-9,
      ablationRate: lab.ablationNoPhaseGate.viabilityRate,
      fullRate: lab.held.summary.viabilityRate,
      interpretation:
        'Removing the phase sync requirement cannot lower geo+wave+nav pass rate below full-gate rate (subset relation).',
      evidence: 'analytically_established',
    },
  ];
  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    expedition: EXPEDITION,
    honesty: HONESTY,
    lab,
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
    enginePinRecommended: lab.summary.enginePinRecommended,
  };
}
