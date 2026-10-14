/**
 * Map agentic property scores → FHG subscores S_F, S_H, S_G (post-hoc only).
 */
export function propertiesToFhg(properties) {
  const S_F =
    (properties.multiscale_compression + properties.hierarchical_coarse_to_fine) / 2;
  const S_H = properties.local_preserves_global;
  const S_G = properties.bounded_recursive_adaptation;
  const S_IRC = (S_F + S_H + S_G) / 3;
  return {
    S_F: clamp01(S_F),
    S_H: clamp01(S_H),
    S_G: clamp01(S_G),
    S_IRC: clamp01(S_IRC),
  };
}

export function scoreAgentResult(agentScoreRow) {
  const fhg = propertiesToFhg(agentScoreRow.properties);
  return {
    agentId: agentScoreRow.agentId,
    isControl: agentScoreRow.isControl,
    predictiveRmse: agentScoreRow.predictiveRmse,
    ...fhg,
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function jaccardArchitecture(a, b) {
  const sa = new Set(String(a || '').split(/[_\s]+/).filter(Boolean));
  const sb = new Set(String(b || '').split(/[_\s]+/).filter(Boolean));
  if (!sa.size && !sb.size) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const union = sa.size + sb.size - inter;
  return union ? inter / union : 0;
}
