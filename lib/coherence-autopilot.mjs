/**
 * Coherence autopilot — zero human ops; public rail is display-only (locked anchor).
 */
import { ensureMiningRailAutopilot, getMiningRail } from './mining-rail.mjs';
import { runGoldilocksPulse } from './goldilocks-pulse.mjs';

export async function runCoherenceAutopilotCycle({ forcePulse } = {}) {
  const railRow = await ensureMiningRailAutopilot();
  const pulse = await runGoldilocksPulse({ force: !!forcePulse });
  const rail = await getMiningRail();
  return {
    humanInterventionRequired: false,
    autopilot: true,
    railRow,
    pulse: {
      emitted: pulse.emitted,
      latest: pulse.latest,
      historyCount: (pulse.history || []).length,
    },
    rail,
  };
}
