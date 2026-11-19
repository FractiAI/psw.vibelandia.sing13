/**
 * Spirit profile: six operational properties commonly attributed to "spirit"
 * (continuity across embodiments, persistent purpose, directed attention,
 * self-construction of vehicles, transfer of what matters, scale invariance,
 * survival of substrate loss), plus the octave-depth and substrate-loss tests
 * that the base task families do not cover (S5, S6).
 */
import { mulberry32 } from './rng.mjs';
import { SEED } from './constants.mjs';

export const DEPTHS = [1, 4, 16, 64, 256, 1024];
export const SPIRIT_TRIALS = 600;
export const DRIFT = { A: 0.15, B: 0.15, C: 0.02 };

/** Mission copies held across nested shells; corruption is worst-case correlated (corrupt copies agree). */
function survivesDepth({ depth, copies, p, repair, rng }) {
  let intact = copies;
  for (let d = 0; d < depth; d++) {
    let hit = 0;
    for (let c = 0; c < intact; c++) if (rng() < p) hit += 1;
    intact -= hit;
    const corrupted = copies - intact;
    if (repair) {
      if (intact > corrupted) intact = copies;
      else return false;
    } else if (intact <= corrupted) {
      return false;
    }
  }
  return true;
}

function rate(fn, trials = SPIRIT_TRIALS, seedTag = 0) {
  let ok = 0;
  for (let i = 0; i < trials; i++) if (fn(mulberry32(SEED + seedTag * 99991 + i * 7))) ok += 1;
  return ok / trials;
}

/** Exact per-octave loss probability for k copies with majority repair (worst-case correlated). */
export function perOctaveLoss(k, p) {
  const choose = (n, r) => { let c = 1; for (let i = 1; i <= r; i++) c = (c * (n - r + i)) / i; return c; };
  let q = 0;
  for (let h = Math.floor(k / 2) + 1; h <= k; h++) q += choose(k, h) * p ** h * (1 - p) ** (k - h);
  return q;
}

export function horizon(k, p) {
  const q = perOctaveLoss(k, p);
  return q <= 0 ? Infinity : Math.log(0.5) / Math.log(1 - q);
}

export function octaveInvariance() {
  const arms = {
    A_single_drift15: { copies: 1, p: DRIFT.A, repair: false },
    B_single_drift15: { copies: 1, p: DRIFT.B, repair: false },
    C_single_drift2: { copies: 1, p: DRIFT.C, repair: false },
    C_five_no_repair: { copies: 5, p: DRIFT.C, repair: false },
    C_five_repair: { copies: 5, p: DRIFT.C, repair: true },
  };
  const out = {};
  for (const [name, cfg] of Object.entries(arms)) {
    out[name] = {};
    for (const depth of DEPTHS) {
      out[name][depth] = rate((rng) => survivesDepth({ depth, ...cfg, rng }), SPIRIT_TRIALS, depth);
    }
  }
  const sweep = [1, 3, 5, 7, 9, 13].map((k) => ({
    copies: k,
    perOctaveLoss: perOctaveLoss(k, DRIFT.C),
    horizonOctaves: horizon(k, DRIFT.C),
  }));
  const logCopies = [1, 4, 16, 64, 256, 1024, 1e6].map((depth) => {
    let k = 1;
    while (k < 61 && horizon(k, DRIFT.C) < depth * 2) k += 2;
    return { depth, copiesNeeded: k, reached: horizon(k, DRIFT.C) >= depth * 2 };
  });
  return { config: arms, survival: out, sweep, copiesForDepth: logCopies };
}

/** Substrate loss: each shell is destroyed with probability f per octave; any survivor can re-instantiate the rest. */
export function substrateLoss() {
  const fs = [0.1, 0.3, 0.5];
  const depth = 256;
  const result = {};
  for (const f of fs) {
    const run = (copies) => rate((rng) => {
      let alive = copies;
      for (let d = 0; d < depth; d++) {
        let lost = 0;
        for (let c = 0; c < alive; c++) if (rng() < f) lost += 1;
        alive -= lost;
        if (alive <= 0) return false;
        alive = copies;
      }
      return true;
    }, SPIRIT_TRIALS, Math.round(f * 100));
    result[f] = { single: run(1), five: run(5), nine: run(9) };
  }
  return { depth, results: result };
}

export const PROFILE = [
  { id: 'S1', property: 'Continuity of identity and purpose across embodiments', test: 'Mission survives context switches and shell retirement', family: 'identity_persistence', ablation: 'persistentIdentity' },
  { id: 'S2', property: 'Directed attention that organizes the parts', test: 'Follows corroborated evidence against a confident majority; refuses uncorroborated decoys', family: 'attention_trap', ablation: 'evidenceCheck' },
  { id: 'S3', property: 'Builds new vehicles for new capacities', test: 'Creates a specialist shell when a capability gap appears and budget allows', family: 'self_construction', ablation: 'shellCreation' },
  { id: 'S4', property: 'Carries what matters between embodiments', test: 'Selective reconstruction of a fact across hand-offs', family: 'octave_transfer', ablation: 'crossOctaveTransfer' },
  { id: 'S5', property: 'Same structure at every octave', test: 'Mission survival stays flat from depth 1 to depth 1,024 (needs redundancy plus repair)', family: 'octave_depth', ablation: 'repair' },
  { id: 'S6', property: 'Survives loss of any substrate', test: 'Mission survives destruction of shells at 10 to 30% per octave over 256 octaves (50% reported as the limit)', family: 'substrate_loss', ablation: 'redundancy' },
];
