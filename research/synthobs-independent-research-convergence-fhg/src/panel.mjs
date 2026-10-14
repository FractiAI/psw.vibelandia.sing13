import { PANEL_SLOTS } from './constants.mjs';

/** Per-slot adaptive agent (blind objective shared; slot maps to anchor-inspired strategy). */
const ADAPTIVE_AGENT_BY_SLOT = Object.freeze([
  'A_energy_keep',
  'B_pyramid',
  'C_local_global',
  'D_bounded_adapt',
  'A_energy_keep',
  'C_local_global',
]);
import { makeLandscapeForSeed } from './landscape.mjs';
import { runAllAgents } from '../../synthobs-agentic-convergence-experiment/src/agents.mjs';
import { scoreRepresentation } from '../../synthobs-agentic-convergence-experiment/src/convergence.mjs';
import { scoreAgentResult } from './fhg-score.mjs';

/** Run one panel slot: best adaptive explorer vs flat wasteful control. */
export function runPanelSlot(slot, slotIndex = 0) {
  const landscape = makeLandscapeForSeed(slot.seed, slot.noise);
  const results = runAllAgents(landscape);
  const scored = results.map((r) => ({
    ...scoreRepresentation(r, landscape),
    architecture: r.architecture,
  }));
  const adaptiveRows = scored.filter((s) => !s.isControl);
  const controlRows = scored.filter((s) => s.isControl);
  const preferredId = ADAPTIVE_AGENT_BY_SLOT[slotIndex % ADAPTIVE_AGENT_BY_SLOT.length];
  const bestAdaptive =
    adaptiveRows.find((s) => s.agentId === preferredId) ||
    adaptiveRows.reduce((a, b) => (a.meanProp >= b.meanProp ? a : b), adaptiveRows[0]);
  const control = controlRows[0];
  const adaptiveFhg = scoreAgentResult(bestAdaptive);
  const wastefulFhg = scoreAgentResult(control);
  const margin = adaptiveFhg.S_IRC - wastefulFhg.S_IRC;
  return {
    slotId: slot.id,
    anchor: slot.anchor,
    adaptive: adaptiveFhg,
    wasteful: wastefulFhg,
    margin,
    pass: margin >= 0,
    bestArchitecture: bestAdaptive.agentId,
    controlArchitecture: control.agentId,
  };
}

export function runIntegratedPanel() {
  const panels = PANEL_SLOTS.map((slot, i) => runPanelSlot(slot, i));
  const meanMargin =
    panels.reduce((a, p) => a + p.margin, 0) / Math.max(1, panels.length);
  const meanAdaptive =
    panels.reduce((a, p) => a + p.adaptive.S_IRC, 0) / Math.max(1, panels.length);
  const meanWasteful =
    panels.reduce((a, p) => a + p.wasteful.S_IRC, 0) / Math.max(1, panels.length);
  return {
    panels,
    meanMargin,
    meanAdaptive,
    meanWasteful,
    nPanels: panels.length,
  };
}
