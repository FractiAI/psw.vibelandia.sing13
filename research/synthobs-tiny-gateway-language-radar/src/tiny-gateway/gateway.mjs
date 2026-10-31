/**
 * Tiny Gateway assembler — Boundary → Recursive Tree → Golden Spiral → Honeycomb → Wave–Node–Fq
 * + template binding / execution. Ablation flags disable components for Experiment D.
 */
import { createBoundaryNode, assertWithinBoundary } from './boundary-node.mjs';
import { buildRecursiveTree, treeNodeCount } from './recursive-tree.mjs';
import { pickScaleLevel, scaleBridgePoint } from './golden-spiral.mjs';
import { createHoneycomb, shortestPathway, attachPayload } from './honeycomb-lattice.mjs';
import { selectTemplate, propagateAlongPath, waveActivation } from './wave-node-fq.mjs';
import { createTemplateRegistry, bindTemplate, executeBound } from './template-binding.mjs';
import { PHI_EGS } from '../constants.mjs';

export function createTinyGateway(opts = {}) {
  const {
    domain = 'generic',
    task = 'execute',
    treeLayers = [[{ id: 'ops' }, { id: 'ctx' }], [{ id: 'leaf' }]],
    honeycombRadius = 3,
    ablation = {},
  } = opts;

  const useTree = ablation.disableTree !== true;
  const useSpiral = ablation.disableSpiral !== true;
  const useHoneycomb = ablation.disableHoneycomb !== true;
  const useWave = ablation.disableWave !== true;

  const boundary = createBoundaryNode({
    domain,
    task,
    constraints: { maxBytes: opts.maxBytes ?? 1_000_000, allowedKinds: opts.allowedKinds },
  });

  const tree = useTree ? buildRecursiveTree(`${domain}:root`, treeLayers) : null;
  const lattice = useHoneycomb ? createHoneycomb({ radius: honeycombRadius }) : null;
  const registry = createTemplateRegistry();
  let step = 0;

  return {
    boundary,
    tree,
    lattice,
    registry,
    ablation: { useTree, useSpiral, useHoneycomb, useWave },
    phi: PHI_EGS,

    registerTemplate(template) {
      return registry.register(template);
    },

    describe() {
      return {
        boundary: { domain: boundary.domain, task: boundary.task },
        treeNodes: tree ? treeNodeCount(tree) : 0,
        honeycombSize: lattice ? lattice.size : 0,
        templates: registry.size(),
        ablation: { useTree, useSpiral, useHoneycomb, useWave },
        spiralSample: useSpiral ? scaleBridgePoint(2) : null,
      };
    },

    /**
     * Score templates → select (wave) → bind → execute.
     * Optional pathway routing on honeycomb when from/to hex keys provided.
     */
    run({ data, kind, scored, pathway, targetScale = 2 }) {
      const gate = assertWithinBoundary(boundary, data ?? {});
      if (!gate.ok) return { ok: false, error: gate };

      let scalePick = null;
      if (useSpiral) {
        scalePick = pickScaleLevel([0, 1, 2, 3, 4], targetScale);
      }

      const candidates =
        scored ??
        registry.list(kind).map((t) => ({
          template: t,
          score: kindScore(t, data),
        }));

      let selected;
      if (useWave) {
        selected = selectTemplate(candidates, step++);
      } else {
        // Ablation: plain argmax
        selected = candidates.reduce(
          (best, c) => (c.score > (best?.score ?? -Infinity) ? { template: c.template ?? c, score: c.score } : best),
          null,
        );
        if (selected) selected = { ...selected, activation: waveActivation([selected.score], step++) };
      }
      if (!selected?.template) return { ok: false, error: 'no_template' };

      let path = null;
      let propagation = null;
      if (useHoneycomb && lattice && pathway?.from && pathway?.to) {
        path = shortestPathway(lattice, pathway.from, pathway.to);
        if (path) {
          attachPayload(lattice, pathway.to, { lastTemplate: selected.template.id });
          propagation = propagateAlongPath(path, selected.score);
        }
      }

      const binding = bindTemplate(selected.template, data ?? {});
      const result = executeBound(selected.template, binding);
      return {
        ok: true,
        result,
        templateId: selected.template.id,
        score: selected.score,
        activation: selected.activation,
        scalePick,
        path,
        propagation,
        treeNodes: tree ? treeNodeCount(tree) : 0,
      };
    },
  };
}

function kindScore(template, data) {
  if (!data) return 0.1;
  let s = 0.2;
  if (data.intent && template.id.includes(data.intent)) s += 0.5;
  if (data.kind && template.kind === data.kind) s += 0.3;
  if (Array.isArray(data.tokens)) s += Math.min(0.3, data.tokens.length * 0.02);
  return s;
}

export { bindTemplate, executeBound, createTemplateRegistry };
