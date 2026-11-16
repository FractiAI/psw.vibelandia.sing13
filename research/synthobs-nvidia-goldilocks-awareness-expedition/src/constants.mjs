/**
 * NVIDIA Goldilocks Awareness Expedition — FractiSI Computational Lab suite
 * Application companion Soft Story · not ENGINE_SHELF
 * Jensen Huang = observed leadership case
 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;
export const DOC_ID = 'WP-NVIDIA-GOLDILOCKS-AWARENESS-EXPEDITION-EGS-2026-11-15';
export const REGISTRY_ID = 'synthobs-nvidia-goldilocks-awareness-expedition-2026-11';
export const PAPER_NAME = 'SYNTHOBS_NVIDIA_GOLDILOCKS_AWARENESS_EXPEDITION_2026-11.md';
export const SHIP_BLOG_SLUG = 'nvidia-goldilocks-moment';
export const SHIP_BLOG_FILE = 'blog-nvidia-goldilocks-moment-2026-11.html';
export const STUDY_TITLE =
  'What Both Jensen Huang and NVIDIA Need Is a New World Model, Not a New CEO — Computational Lab Receipts';
export const DIGITAL_SEED = 20261115;
export const LEADERSHIP_CASE = 'Jensen Huang (observed leadership case)';
export const ENGINE_SHELF_PINNED = false;

export const HONESTY =
  'FractiSI Computational Lab · real FRED macro walk-forward + Movebank/Kp rhyme + regenerable Exp 002 / Tiny Gateway citations. Soft Story organizational companion — not NVIDIA KPI attestation, not succession advice, not ENGINE_SHELF, not live GPU-HBM bake-off. E6 is a matched-budget architecture test with a fixed extractive agent (same model/prompt/budget); live frontier-LLM bake-off runs only when GROQ_API_KEY is set.';

/** Upstream receipt paths (monorepo-relative from suite root ../..) */
export const UPSTREAM = Object.freeze({
  exp002Report: 'research/synthobs-fractisi-expedition-002-beyond-memory/data/empirical_report.json',
  tinyGatewayReport: 'research/synthobs-tiny-gateway-rhyming-templates/data/empirical_report.json',
  gpuLive: 'research/synthobs-tiny-gateway-rhyming-templates/data/gpu_live_chat_hbm_lab.json',
});

export const FRED_SERIES = Object.freeze(['UNRATE', 'CPIAUCSL', 'FEDFUNDS', 'INDPRO']);
export const WALKFORWARD = Object.freeze({
  trainMin: 60,
  horizon: 1,
  target: 'UNRATE',
});

export const MULTI_AGENT = Object.freeze({
  agents: 12,
  rounds: 24,
  tasks: 40,
  seed: DIGITAL_SEED,
});

/** E6 — matched-budget agent architecture test (same model · prompt · per-turn budget). */
export const MATCHED_BUDGET = Object.freeze({
  scenarios: 100,
  hops: 6,
  fillersPerSilo: 40,
  contextBudgetTokens: 64,
  maxRounds: 6,
  seed: DIGITAL_SEED + 6,
  promptTemplate: 'Extractive agent. Use only CONTEXT. Follow NEXT links. Report SOLUTION-* if present.',
});
