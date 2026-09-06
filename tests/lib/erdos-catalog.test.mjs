import { describe, it, expect, afterAll } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildErdosCatalog } from '../../lib/erdos-catalog.mjs';

const dir = await mkdtemp(join(tmpdir(), 'erdos-catalog-'));
const outPath = join(dir, 'erdos-353-catalog.json');
const first = await buildErdosCatalog({ outPath });
const catalog = JSON.parse(await readFile(outPath, 'utf8'));

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('buildErdosCatalog', () => {
  it('writes all 353 problems and reports the count', () => {
    expect(first.count).toBe(353);
    expect(catalog.problems).toHaveLength(353);
    expect(catalog.problems.map((p) => p.id)).toEqual(
      Array.from({ length: 353 }, (_, i) => i + 1),
    );
  });

  it('carries the demonstration manifest metadata', () => {
    expect(catalog.schema).toBe('syntheverse-erdos-353/v4');
    expect(catalog.auditId).toContain('ERDÖS');
    expect(catalog.paperReference).toContain('Google DeepMind');
  });

  it('flags the nine DeepMind bridge rows (345–353) with the bridge solver', () => {
    for (const id of [345, 346, 347, 348, 349, 350, 351, 352, 353]) {
      const row = catalog.problems[id - 1];
      expect(row.solver).toBe('bridge');
      expect(row.groupLabel).toContain('Bridge');
    }
    expect(catalog.problems[0].solver).not.toBe('bridge');
  });

  it('keeps the kernel-verified Lean certificate for row 256', () => {
    expect(catalog.goldilocksProgress.verifiedCatalogRows).toEqual([256]);
    expect(catalog.problems[255].proof).toContain('GoldilocksErdos.Catalog.row256');
    expect(catalog.problems[255].proof).toContain('KERNEL VERIFIED');
  });

  it('is deterministic — identical bytes across runs', async () => {
    const second = await buildErdosCatalog({ outPath });
    expect(second.count).toBe(first.count);
    const again = await buildErdosCatalog({ outPath: join(dir, 'again.json') });
    expect(await readFile(join(dir, 'again.json'), 'utf8')).toBe(
      await readFile(outPath, 'utf8'),
    );
    expect(again.count).toBe(353);
  });
});
