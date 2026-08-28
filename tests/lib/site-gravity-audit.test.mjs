import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('Site gravity audit · Player 1 report', () => {
  it('rewrites /site-gravity-audit and links from my whiteboard', () => {
    const vercel = read('vercel.json');
    expect(vercel).toMatch(/"source":\s*"\/site-gravity-audit"/);
    const audit = read('interfaces/site-gravity-audit-2026-08.html');
    expect(audit).toContain('Site gravity audit');
    expect(audit).toContain('Human gravity');
    expect(audit).toContain('prelude session');
    const whiteboard = read('interfaces/my-whiteboard.html');
    expect(whiteboard).toContain('href="/site-gravity-audit"');
    expect(whiteboard).toContain('Site gravity audit');
  });
});
