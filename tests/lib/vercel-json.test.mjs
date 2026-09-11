import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');

describe('vercel.json', () => {
  it('parses as valid JSON (ship-blog rewrite inserts must not leave stray braces)', () => {
    const raw = readFileSync(resolve(ROOT, 'vercel.json'), 'utf8');
    expect(() => JSON.parse(raw)).not.toThrow();
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed.rewrites)).toBe(true);
    expect(parsed.rewrites.length).toBeGreaterThan(100);
  });
});
