/**
 * Coherence autopilot — zero human ops; public rail is display-only (locked anchor).
 */
import { ensureMiningRailAutopilot, getMiningRail } from './mining-rail.mjs';
import { runGoldilocksPulse } from './goldilocks-pulse.mjs';

export async function runCoherenceAutopilotCycle({ forcePulse, backfillPredictions } = {}) {
  const railRow = await ensureMiningRailAutopilot();
  if (backfillPredictions) {
    const { backfillIfEmpty } = await import('./goldilocks-predictions.mjs');
    await backfillIfEmpty({ count: 24 });
  }
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
