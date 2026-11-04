/**
 * Template binding — separates reusable computational structures from incoming data.
 * Central FractiAI hypothesis under test in Experiment C.
 */
export function createTemplate({ id, kind, slots = [], execute }) {
  if (typeof execute !== 'function') throw new Error('template requires execute(fn)');
  return Object.freeze({
    id,
    kind,
    slots: Object.freeze([...slots]),
    execute,
    createdAt: Date.now(),
  });
}

export function bindTemplate(template, data) {
  const bound = {};
  for (const slot of template.slots) {
    if (!(slot in data) && data[slot] !== 0) {
      // allow missing optional slots prefixed with ?
      if (slot.startsWith('?')) continue;
      bound[slot] = data[slot];
    } else {
      bound[slot] = data[slot];
    }
  }
  // Also pass through unbound extras under _raw for executors that need them
  return Object.freeze({
    templateId: template.id,
    kind: template.kind,
    bound,
    raw: data,
    boundAt: Date.now(),
  });
}

export function executeBound(template, binding) {
  return template.execute(binding.bound, binding.raw);
}

export function createTemplateRegistry() {
  const byId = new Map();
  const byKind = new Map();
  return {
    register(template) {
      byId.set(template.id, template);
      if (!byKind.has(template.kind)) byKind.set(template.kind, []);
      byKind.get(template.kind).push(template);
      return template;
    },
    get(id) {
      return byId.get(id) ?? null;
    },
    list(kind) {
      return kind ? [...(byKind.get(kind) ?? [])] : [...byId.values()];
    },
    size() {
      return byId.size;
    },
  };
}
