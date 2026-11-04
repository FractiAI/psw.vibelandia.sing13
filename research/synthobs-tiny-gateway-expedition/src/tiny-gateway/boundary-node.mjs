/**
 * Boundary Node — defines computational domain, task boundary, and entry point.
 * Implemented (not conceptual).
 */
export function createBoundaryNode({ domain, task, entry = 'ingress', constraints = {} }) {
  return Object.freeze({
    kind: 'BoundaryNode',
    domain,
    task,
    entry,
    constraints: Object.freeze({ ...constraints }),
    openedAt: Date.now(),
  });
}

export function assertWithinBoundary(node, payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'payload_not_object' };
  }
  if (node.constraints.maxBytes != null) {
    const bytes = JSON.stringify(payload).length;
    if (bytes > node.constraints.maxBytes) {
      return { ok: false, reason: 'maxBytes_exceeded', bytes };
    }
  }
  if (node.constraints.allowedKinds && payload.kind && !node.constraints.allowedKinds.includes(payload.kind)) {
    return { ok: false, reason: 'kind_not_allowed', kind: payload.kind };
  }
  return { ok: true };
}
