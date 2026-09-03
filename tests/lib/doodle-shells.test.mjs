import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOODLE_SHELL_DEFAULT,
  DOODLE_SHELL_IDS,
  DOODLE_SHELLS,
  applyDoodleShells,
  assignDoodleShells,
  clearDoodleShellMapCache,
  groupDoodlesByShell,
  loadDoodleShellMap,
  normalizeDoodleShell,
  resolveDoodleShell,
} from '../../lib/doodle-shells.mjs';
import { normalizeDoodleWork } from '../../lib/doodles-gallery.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('Doodle nested shells · Core · Amphitheater · Horizon', () => {
  it('exposes three shell ids matching exhibit grammar', () => {
    expect(DOODLE_SHELL_IDS).toEqual(['core', 'amphitheater', 'horizon']);
    expect(DOODLE_SHELLS.map((s) => s.id)).toEqual(DOODLE_SHELL_IDS);
    expect(DOODLE_SHELL_DEFAULT).toBe('amphitheater');
    expect(DOODLE_SHELLS.every((s) => s.href && s.label && s.lede)).toBe(true);
  });

  it('ships a filename/id shell map covering live wall filing', () => {
    const mapPath = join(ROOT, 'data/doodles-shell-map.json');
    expect(existsSync(mapPath)).toBe(true);
    clearDoodleShellMapCache();
    const map = loadDoodleShellMap();
    expect(Object.keys(map.byFilename).length).toBeGreaterThan(300);
    expect(Object.keys(map.byId).length).toBeGreaterThan(300);
    const shells = new Set(Object.values(map.byFilename));
    expect([...shells].sort()).toEqual(['amphitheater', 'core', 'horizon']);
  });

  it('resolves shell from explicit field, then map, then default', () => {
    clearDoodleShellMapCache();
    expect(normalizeDoodleShell('CORE')).toBe('core');
    expect(normalizeDoodleShell('nope')).toBe(null);
    expect(resolveDoodleShell({ shell: 'horizon' })).toBe('horizon');
    expect(resolveDoodleShell({ filename: 'IMG_9358.jpeg' })).toBe('horizon');
    expect(resolveDoodleShell({ filename: 'IMG_0136.jpeg' })).toBe('core');
    expect(resolveDoodleShell({ filename: 'IMG_2903.jpeg' })).toBe('amphitheater');
    expect(resolveDoodleShell({ filename: 'unknown-new.jpeg' })).toBe('amphitheater');
  });

  it('groups works Core → Amphitheater → Horizon and preserves order', () => {
    const works = [
      normalizeDoodleWork({ id: 'a', src: 'https://x/a.jpg', filename: 'IMG_2903.jpeg' }),
      normalizeDoodleWork({ id: 'b', src: 'https://x/b.jpg', filename: 'IMG_0136.jpeg' }),
      normalizeDoodleWork({ id: 'c', src: 'https://x/c.jpg', filename: 'IMG_9358.jpeg' }),
      normalizeDoodleWork({ id: 'd', src: 'https://x/d.jpg', filename: 'IMG_4548.jpeg' }),
    ];
    const groups = groupDoodlesByShell(works);
    expect(groups.map((g) => g.id)).toEqual(['core', 'amphitheater', 'horizon']);
    expect(groups[0].works.map((w) => w.id)).toEqual(['b']);
    expect(groups[1].works.map((w) => w.id)).toEqual(['a', 'd']);
    expect(groups[2].works.map((w) => w.id)).toEqual(['c']);
  });

  it('applyDoodleShells stamps shell onto manifest works', () => {
    const stamped = applyDoodleShells({
      version: 1,
      works: [
        { id: 'x', src: 'https://x/x.jpg', filename: 'IMG_9388.jpeg', mature: true },
      ],
    });
    expect(stamped.works[0].shell).toBe('horizon');
  });

  it('assignDoodleShells updates selected ids', () => {
    const man = {
      version: 1,
      works: [
        normalizeDoodleWork({ id: 'ddl-a', src: 'https://x/a.jpg', filename: 'a.jpeg', shell: 'amphitheater' }),
        normalizeDoodleWork({ id: 'ddl-b', src: 'https://x/b.jpg', filename: 'b.jpeg' }),
      ],
    };
    const next = assignDoodleShells(man, [
      { id: 'ddl-a', shell: 'core' },
      { id: 'ddl-b', shell: 'horizon' },
    ]);
    expect(next.works.find((w) => w.id === 'ddl-a').shell).toBe('core');
    expect(next.works.find((w) => w.id === 'ddl-b').shell).toBe('horizon');
  });

  it('gallery page renders three shell walls and Player 1 shell controls', () => {
    const html = readFileSync(join(ROOT, 'interfaces/doodles-gallery.html'), 'utf8');
    expect(html).toContain('id="shell-walls"');
    expect(html).toContain('shell-core');
    expect(html).toContain('shell-amphitheater');
    expect(html).toContain('shell-horizon');
    expect(html).toContain('three nested shells');
    expect(html).toContain("postManifestAction('assignShells'");
    expect(html).toContain('id="batch-shell"');
    expect(html).toContain('museum-wall__shell');
    expect(html).not.toContain('id="gallery-grid"');
  });

  it('API wires assignShells and applies shells on GET', () => {
    const api = readFileSync(join(ROOT, 'api/doodles.js'), 'utf8');
    expect(api).toContain("action === 'assignShells'");
    expect(api).toContain('applyDoodleShells');
    expect(api).toContain('DOODLE_SHELLS');
  });
});
