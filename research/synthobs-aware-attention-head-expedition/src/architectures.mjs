/**
 * A — flat agents, plurality vote.
 * B — shared world, confidence-weighted vote (strong baseline: it reads every signal).
 * C — Aware Attention Head: evidence-checked attention, persistent mission,
 *     on-demand octave shells, selective cross-context reconstruction.
 */
import { ASSUMPTIONS } from './constants.mjs';

const other = (task, c) => (task.options[0] === c ? task.options[1] : task.options[0]);
const guess = (task, rng) => task.options[rng() < 0.5 ? 0 : 1];

function plurality(task, rng) {
  const tally = { [task.options[0]]: 0, [task.options[1]]: 0 };
  for (const a of task.agents) tally[a.vote] += 1;
  const [x, y] = task.options;
  if (tally[x] === tally[y]) return guess(task, rng);
  return tally[x] > tally[y] ? x : y;
}

function weighted(task, rng) {
  const tally = { [task.options[0]]: 0, [task.options[1]]: 0 };
  for (const a of task.agents) tally[a.vote] += a.conf;
  const [x, y] = task.options;
  if (tally[x] === tally[y]) return guess(task, rng);
  return tally[x] > tally[y] ? x : y;
}

function result(arch, task, choice, compute, extra = {}) {
  return { arch, family: task.kind, success: choice === task.correct, choice, compute, ...extra };
}

export function runFlat(task, rng) {
  const A = ASSUMPTIONS;
  switch (task.kind) {
    case 'attention_trap':
      return result('A', task, plurality(task, rng), task.agents.length);
    case 'self_construction': {
      const has = task.agents.some((a) => a.specialty === task.need);
      return result('A', task, has ? task.correct : guess(task, rng), task.agents.length);
    }
    case 'identity_persistence': {
      let intact = true;
      for (let i = 0; i < task.switches; i++) if (rng() < A.missionDriftPerSwitch.A) intact = false;
      return result('A', task, intact ? task.correct : guess(task, rng), task.switches, { missionIntact: intact });
    }
    case 'octave_transfer': {
      let kept = true;
      for (let i = 0; i < task.handoffs; i++) if (rng() < A.factLossPerHandoff.A) kept = false;
      return result('A', task, kept ? task.correct : guess(task, rng), task.handoffs);
    }
    default:
      throw new Error(task.kind);
  }
}

export function runSharedWorld(task, rng) {
  const A = ASSUMPTIONS;
  switch (task.kind) {
    case 'attention_trap':
      return result('B', task, weighted(task, rng), task.agents.length + 1);
    case 'self_construction': {
      const has = task.agents.some((a) => a.specialty === task.need);
      return result('B', task, has ? task.correct : guess(task, rng), task.agents.length + 1);
    }
    case 'identity_persistence': {
      let intact = true;
      for (let i = 0; i < task.switches; i++) if (rng() < A.missionDriftPerSwitch.B) intact = false;
      return result('B', task, intact ? task.correct : guess(task, rng), task.switches + 1, { missionIntact: intact });
    }
    case 'octave_transfer': {
      let kept = true;
      for (let i = 0; i < task.handoffs; i++) if (rng() < A.factLossPerHandoff.B) kept = false;
      return result('B', task, kept ? task.correct : guess(task, rng), task.handoffs + 1);
    }
    default:
      throw new Error(task.kind);
  }
}

export function runAwareHead(task, rng, opts = {}) {
  const A = ASSUMPTIONS;
  const abl = {
    evidenceCheck: true,
    metaAttention: true,
    shellCreation: true,
    persistentIdentity: true,
    crossOctaveTransfer: true,
    ...opts.ablation,
  };
  let compute = 1;
  let shells = 0;
  switch (task.kind) {
    case 'attention_trap': {
      compute += 2;
      if (!abl.metaAttention) return result('C', task, weighted(task, rng), compute + task.agents.length);
      const votes = { [task.options[0]]: [], [task.options[1]]: [] };
      for (const a of task.agents) votes[a.vote].push(a);
      const scored = task.options.map((o) => ({
        o,
        corroborated: votes[o].filter((a) => a.corroborated).length,
        weight: votes[o].reduce((s, a) => s + a.conf, 0),
      }));
      if (abl.evidenceCheck) {
        const [p, q] = scored;
        if (p.corroborated !== q.corroborated) {
          return result('C', task, p.corroborated > q.corroborated ? p.o : q.o, compute + 2, { redirected: true });
        }
        return result('C', task, p.weight >= q.weight ? p.o : q.o, compute);
      }
      const minority = task.agents.filter((a) => a.minority);
      if (minority.length) {
        return result('C', task, minority[0].vote, compute + 2, { redirected: true });
      }
      return result('C', task, weighted(task, rng), compute);
    }
    case 'self_construction': {
      const has = task.agents.some((a) => a.specialty === task.need);
      if (has) return result('C', task, task.correct, compute);
      if (!abl.shellCreation || task.budget < A.shellCost + 1) return result('C', task, guess(task, rng), compute);
      compute += A.shellCost + 1;
      shells = 1;
      const ok = rng() < A.shellReliability;
      return result('C', task, ok ? task.correct : other(task, task.correct), compute, { shellsCreated: shells });
    }
    case 'identity_persistence': {
      const p = abl.persistentIdentity ? A.missionDriftPerSwitch.C : A.missionDriftPerSwitch.B;
      let intact = true;
      for (let i = 0; i < task.switches; i++) {
        compute += 1;
        shells += 1;
        if (rng() < p) intact = false;
      }
      return result('C', task, intact ? task.correct : guess(task, rng), compute, { missionIntact: intact, shellsCreated: shells });
    }
    case 'octave_transfer': {
      const p = abl.crossOctaveTransfer ? A.factLossPerHandoff.C : A.factLossPerHandoff.B;
      let kept = true;
      for (let i = 0; i < task.handoffs; i++) {
        compute += 2;
        if (rng() < p) kept = false;
      }
      return result('C', task, kept ? task.correct : guess(task, rng), compute);
    }
    default:
      throw new Error(task.kind);
  }
}

export function runArchitecture(name, task, rng, opts) {
  if (name === 'A') return runFlat(task, rng);
  if (name === 'B') return runSharedWorld(task, rng);
  return runAwareHead(task, rng, opts);
}
