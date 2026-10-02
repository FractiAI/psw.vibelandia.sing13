/**
 * Phase 4 — same scorers on held-out landscape / higher noise.
 */
import { agentView, makeHeldOutLandscape } from './landscapes.mjs';
import { runAllAgents } from './agents.mjs';
import { scoreRepresentation, summarizeConvergence } from './convergence.mjs';
import { PORTABILITY_MARGIN } from './constants.mjs';

export function runPortabilityPhase() {
  const landscape = makeHeldOutLandscape();
  const view = agentView(landscape);
  const results = runAllAgents(view);
  const scores = results.map((r) => scoreRepresentation(r, landscape));
  const summary = summarizeConvergence(scores);
  return {
    landscapeId: landscape.id,
    noiseScale: landscape.noiseScale,
    summary,
    portable: summary.margin >= PORTABILITY_MARGIN,
    gate: PORTABILITY_MARGIN,
  };
}
