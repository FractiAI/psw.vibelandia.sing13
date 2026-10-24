import {
  DOC_ID,
  HONESTY,
  REGISTRY_ID,
  DIGITAL_SEED,
  ENGINE_SHELF_SLOT,
} from './constants.mjs';
import { runWaveNodeLaboratory } from './computational-lab.mjs';

export function runAllExperiments() {
  const lab = runWaveNodeLaboratory();
  const experiments = [
    {
      id: 'E1',
      title: 'Node placement geometric reconstruction (A1–A4)',
      pass: lab.A.allPass,
      cases: lab.A.cases,
      interpretation: lab.A.allPass
        ? 'Lattice, circle, constrained placement, and snap recovery match analytical references within tolerance.'
        : 'One or more placement cases failed analytical checks.',
      evidence: 'numerically_verified',
    },
    {
      id: 'E2',
      title: '1D FDTD wave analytical agreement + convergence + stability (B1–B5)',
      pass: lab.B.allPass,
      b1: lab.B.b1,
      b2: lab.B.b2,
      b3: lab.B.b3,
      b4: lab.B.b4,
      b5: lab.B.b5,
      interpretation: lab.B.allPass
        ? `Observed mean convergence order ≈ ${lab.B.b2.meanObservedOrder.toFixed(2)}; CFL violation diverges as expected.`
        : 'Wave suite failed one or more B checks.',
      evidence: 'numerically_verified',
    },
    {
      id: 'E3',
      title: 'Kuramoto phase coordination (C1–C6)',
      pass: lab.C.allPass,
      c1: lab.C.c1,
      c2: lab.C.c2,
      c3: lab.C.c3,
      c4: lab.C.c4,
      c5: lab.C.c5,
      c6: lab.C.c6,
      interpretation: lab.C.allPass
        ? 'Connected identical-frequency oscillators sync; disconnected graph does not; K=0 baseline stays below threshold.'
        : 'Phase suite failed one or more C checks.',
      evidence: 'numerically_verified',
    },
    {
      id: 'E4',
      title: '2D trajectory planning vs A* + phase ablation (D)',
      pass: lab.D.allPass,
      heldSummary: lab.D.heldSummary,
      waveBeatsAstarLength: lab.D.waveBeatsAstarLength,
      phaseHelpsVsAblation: lab.D.phaseHelpsVsAblation,
      interpretation: lab.D.interpretation,
      evidence: 'empirically_observed',
      honesty:
        '2D point navigation only — not manipulator, multi-robot hardware, or physical Wave–Node Robotics product proof.',
    },
    {
      id: 'E5',
      title: 'Computational cost / scaling (E)',
      pass: lab.E.allPass,
      nodePlace: lab.E.nodePlace,
      wave: lab.E.wave,
      kuramoto: lab.E.kuramoto,
      plan: lab.E.plan,
      interpretation: 'Wall-clock scaling recorded; not an asymptotic complexity proof.',
      evidence: 'empirically_observed',
    },
  ];

  const n_pass = experiments.filter((e) => e.pass).length;
  return {
    docId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: DIGITAL_SEED,
    engineShelfSlot: ENGINE_SHELF_SLOT,
    honesty: HONESTY,
    lab,
    experiments,
    n_pass,
    n_total: experiments.length,
    all_pass: n_pass === experiments.length,
    enginePinRecommended: lab.summary.enginePinRecommended,
  };
}
