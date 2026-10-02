import { describe, expect, it } from 'vitest';
import {
  AGENT_OBJECTIVE,
  FORBIDDEN_AGENT_TOKENS,
  CONVERGENCE_MARGIN,
} from '../../research/synthobs-agentic-convergence-experiment/src/constants.mjs';
import { makeTrainLandscape, agentView } from '../../research/synthobs-agentic-convergence-experiment/src/landscapes.mjs';
import { runAllAgents } from '../../research/synthobs-agentic-convergence-experiment/src/agents.mjs';
import {
  scoreRepresentation,
  summarizeConvergence,
} from '../../research/synthobs-agentic-convergence-experiment/src/convergence.mjs';

describe('agentic convergence fixtures', () => {
  it('keeps the shared objective free of forbidden framework tokens', () => {
    const low = AGENT_OBJECTIVE.toLowerCase();
    for (const tok of FORBIDDEN_AGENT_TOKENS) {
      expect(low.includes(tok.toLowerCase())).toBe(false);
    }
  });

  it('plants a train landscape with observations and targets', () => {
    const L = makeTrainLandscape();
    expect(L.observations.length).toBeGreaterThan(64);
    expect(L.target.length).toBe(L.observations.length);
    expect(agentView(L)._meta).toBeUndefined();
  });

  it('clears the train convergence margin vs flat control', () => {
    const landscape = makeTrainLandscape();
    const results = runAllAgents(agentView(landscape));
    expect(results.length).toBe(5);
    const scores = results.map((r) => scoreRepresentation(r, landscape));
    const summary = summarizeConvergence(scores);
    expect(summary.margin).toBeGreaterThanOrEqual(CONVERGENCE_MARGIN);
  });
});
