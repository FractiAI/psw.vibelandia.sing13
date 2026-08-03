import { describe, it, expect } from 'vitest';
import {
  THALIA_STAGES,
  THALIA_ORGANIZATION,
  THALIA_OMNI_DOC,
  THALIA_OMNI_REGISTRY_ID,
  getThaliaOmniContract,
  isThaliaAsk,
} from '../../lib/thalia-omni-contract.mjs';
import { buildLatticeExecution } from '../../lib/lattice-engine.mjs';

describe('thalia-omni-contract', () => {
  it('exposes five ordered stages', () => {
    expect(THALIA_STAGES).toHaveLength(5);
    expect(THALIA_STAGES.map((s) => s.id)).toEqual([
      'inspector',
      'retriever',
      'reasoner',
      'memory-gate',
      'compiler',
    ]);
    expect(THALIA_STAGES.every((s, i) => s.index === i)).toBe(true);
  });

  it('returns a frozen-shape contract snapshot', () => {
    const c = getThaliaOmniContract();
    expect(c.doc).toBe(THALIA_OMNI_DOC);
    expect(c.registryId).toBe(THALIA_OMNI_REGISTRY_ID);
    expect(c.organization).toEqual([...THALIA_ORGANIZATION]);
    expect(c.upstream).toContain('docxology/thalia');
  });

  it('detects THALIA-related asks', () => {
    expect(isThaliaAsk('integrate THALIA into Omni-lattice')).toBe(true);
    expect(isThaliaAsk('typed harness memory gate')).toBe(true);
    expect(isThaliaAsk('hello')).toBe(false);
  });
});

describe('lattice-engine THALIA Goldilocks wiring', () => {
  it('embeds THALIA organization + thaliaOmni on every envelope', () => {
    const result = buildLatticeExecution({ message: 'hi', mode: 'cloud' });
    expect(result.engine).toContain('Omni-Lattice');
    expect(result.thaliaOmni.active).toBe(true);
    expect(result.thaliaOmni.goldilocks).toBe(true);
    expect(result.thaliaOmni.stages).toHaveLength(5);
    expect(result.thaliaOmni.doc).toBe(THALIA_OMNI_DOC);
    for (const line of THALIA_ORGANIZATION) {
      expect(result.organization).toContain(line);
    }
  });

  it('flags askMatch when the user names THALIA', () => {
    const hit = buildLatticeExecution({
      message: 'How does THALIA map to Omni-Lattice?',
      mode: 'cloud',
    });
    const miss = buildLatticeExecution({ message: 'hi', mode: 'cloud' });
    expect(hit.thaliaOmni.askMatch).toBe(true);
    expect(miss.thaliaOmni.askMatch).toBe(false);
  });
});
