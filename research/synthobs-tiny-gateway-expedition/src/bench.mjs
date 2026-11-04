/** Timing helpers — measured only, never fabricated. */
export function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function summarizeLatencies(samplesMs) {
  const s = [...samplesMs].sort((a, b) => a - b);
  const sum = s.reduce((a, b) => a + b, 0);
  return {
    n: s.length,
    medianMs: percentile(s, 50),
    p95Ms: percentile(s, 95),
    meanMs: s.length ? sum / s.length : 0,
    minMs: s[0] ?? 0,
    maxMs: s[s.length - 1] ?? 0,
  };
}

export function timeCall(fn) {
  const t0 = performance.now();
  const result = fn();
  const ms = performance.now() - t0;
  return { result, ms };
}

export function cpuMemSnapshot() {
  const mu = process.memoryUsage();
  return {
    rssBytes: mu.rss,
    heapUsedBytes: mu.heapUsed,
    externalBytes: mu.external,
    // GPU / energy: not available on this harness
    gpuUtilization: null,
    energyJoules: null,
  };
}
