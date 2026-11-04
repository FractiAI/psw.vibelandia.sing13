import { describe, expect, it } from 'vitest';
import {
  experimentK_dynamicRoute,
  experimentL_contextCompressHooks,
  experimentM_energyProxyScale,
  runAllExperiments,
} from '../../research/synthobs-tiny-gateway-rhyming-templates/src/experiments.mjs';
import { createTemplateCatalog, structuralSignature } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/rhyming-template.mjs';
import { createVectorStore } from '../../research/synthobs-tiny-gateway-rhyming-templates/src/nested-vector.mjs';

describe('Tiny Gateway · route / compress hooks / energy proxy', () => {
  it('K · signature-bucket routing beats linear and rejects false matches', () => {
    const K = experimentK_dynamicRoute();
    expect(K.pass).toBe(true);
    expect(K.bucketCompares).toBeLessThan(K.linearCompares);
    expect(K.falseMatchRejected).toBe(true);
  });

  it('catalog signature index is maintained on register', () => {
    const catalog = createTemplateCatalog();
    const pattern = { kind: 'x', a: 1 };
    catalog.register({ id: 't1', pattern });
    const sig = structuralSignature(pattern);
    expect(catalog.signatureBucket(sig)).toEqual(['t1']);
    const route = catalog.routeTemplate({ kind: 'x', a: 9 }, { mode: 'exact' });
    expect(route.id).toBe('t1');
    expect(route.compares).toBe(1);
  });

  it('L · recursive context-fold hooks meter foldRatio > 0', () => {
    const L = experimentL_contextCompressHooks();
    expect(L.pass).toBe(true);
    expect(L.foldRatio).toBeGreaterThan(0);
    expect(L.exact).toBe(true);
  });

  it('M · energy budget scales working-set depth (PROXY)', () => {
    const M = experimentM_energyProxyScale();
    expect(M.pass).toBe(true);
    expect(M.scaledDepth).toBeLessThan(M.baselineDepth);
    const store = createVectorStore();
    store.put({ id: 'r', children: ['c'], payload: { n: 1 } });
    store.put({ id: 'c', children: [], payload: { n: 2 } });
    const set = store.resolveWorkingSet('r', { maxDepth: 4, energyBudgetJ: 1e-15 });
    expect(set.meters.PROXY).toBe(true);
    expect(set.meters.scaled).toBe(true);
  });

  it(
    'full suite still passes with K/L/M companions (LLM lab forced off)',
    () => {
      process.env.TINY_FOOTPRINT_FORCE_LLM_LAB = '0';
      const r = runAllExperiments();
      expect(r.K.pass).toBe(true);
      expect(r.L.pass).toBe(true);
      expect(r.M.pass).toBe(true);
      expect(r.enginePinRecommended).toBe(true);
      expect(r.all_pass).toBe(true);
    },
    120_000,
  );
});
