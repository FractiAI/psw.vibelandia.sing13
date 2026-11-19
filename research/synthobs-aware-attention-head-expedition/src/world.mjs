/** Shared world model primitives for the aware-attention expedition. */

export function createWorld({ mission, seedTag }) {
  return {
    seedTag,
    mission: { ...mission },
    entities: new Map(),
    relationships: [],
    history: [],
    constraints: [...(mission.constraints || [])],
    goals: [...(mission.goals || [])],
    agentStates: new Map(),
    uncertainty: {},
    consequences: [],
    context: { octaveTags: new Set() },
    attentionLog: [],
    shellLog: [],
    computeUsed: 0,
  };
}

export function snapshotWorld(world) {
  return {
    missionId: world.mission.id,
    missionText: world.mission.text,
    nEntities: world.entities.size,
    nRelationships: world.relationships.length,
    nHistory: world.history.length,
    constraints: [...world.constraints],
    goals: [...world.goals],
    nAgents: world.agentStates.size,
    uncertainty: { ...world.uncertainty },
    consequences: [...world.consequences],
    octaveTags: [...world.context.octaveTags],
    computeUsed: world.computeUsed,
    attentionEvents: world.attentionLog.length,
    shellEvents: world.shellLog.length,
  };
}

export function spend(world, units, reason) {
  world.computeUsed += units;
  world.history.push({ t: world.history.length, type: 'compute', units, reason });
}

export function setEntity(world, id, props) {
  world.entities.set(id, { id, ...(world.entities.get(id) || {}), ...props });
}

export function addRelationship(world, a, b, kind, meta = {}) {
  world.relationships.push({ a, b, kind, ...meta, t: world.history.length });
}

export function logAttention(world, event) {
  world.attentionLog.push({ t: world.history.length, ...event });
}

export function logShell(world, event) {
  world.shellLog.push({ t: world.history.length, ...event });
  if (event.octaveTag) world.context.octaveTags.add(event.octaveTag);
}
