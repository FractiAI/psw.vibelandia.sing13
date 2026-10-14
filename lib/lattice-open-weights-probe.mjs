/**
 * Open-weights KQ probe receipt helpers (Python runner output).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreResponse, loadProbeTargets } from './lattice-kq-probe-score.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const OPEN_WEIGHTS_RECEIPT = join(ROOT, 'data/lattice-open-weights-probe/latest.json');

export function loadOpenWeightsReceipt(path = OPEN_WEIGHTS_RECEIPT) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Summarize memorization hints across models for status dashboards. */
export function summarizeOpenWeightsReceipt(receipt) {
  if (!receipt?.models) return { ok: false, reason: 'no_receipt' };
  const models = receipt.models.filter((m) => m.status === 'ok');
  const hints = models.filter((m) => m.memorizationHint);
  const bestCompletion = models.reduce(
    (best, m) => {
      const tier = m.completionScore?.maxTier ?? 0;
      return tier > (best?.tier ?? 0) ? { modelId: m.modelId, tier, hits: m.completionScore?.hits } : best;
    },
    null,
  );
  return {
    ok: true,
    at: receipt.at,
    modelCount: models.length,
    memorizationHintCount: hints.length,
    memorizationHintModels: hints.map((m) => m.modelId),
    bestCompletionTier: bestCompletion?.tier ?? 0,
    bestCompletionModel: bestCompletion?.modelId ?? null,
    honesty: receipt.honesty,
  };
}

export function scoreOpenWeightsCompletion(completionText) {
  return scoreResponse(completionText, loadProbeTargets());
}
