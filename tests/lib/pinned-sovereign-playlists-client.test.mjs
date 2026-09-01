import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('syncPinnedSovereignPlaylists (client)', () => {
  it('keeps full canonical track lists before catalog tracks hydrate', () => {
    const src = read('apps/ss-vibelandia-questfest/src/lib/pinnedSovereignPlaylists.ts');
    expect(src).toContain('const trackIds = [...canonical]');
    expect(src).not.toContain('canonical.filter((id) => valid.has(id))');
  });
});
