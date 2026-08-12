import { describe, expect, it } from 'vitest';
import {
  findLatticeRepository,
  listGuestRepositories,
  loadLatticeRepositoriesCatalog,
  resolveLatticeRepoSelection,
} from '../../lib/lattice-repositories.mjs';

describe('lattice repositories catalog', () => {
  it('loads curated guest-selectable repositories', () => {
    const cat = loadLatticeRepositoriesCatalog();
    expect(cat.defaultId).toBe('sing13');
    expect(cat.repositories.length).toBeGreaterThanOrEqual(8);
    const guests = listGuestRepositories();
    expect(guests.every((r) => r.guestSelectable !== false)).toBe(true);
    expect(guests.some((r) => r.id === 'sing13')).toBe(true);
  });

  it('resolves allowlisted workstream selection', () => {
    const hit = resolveLatticeRepoSelection('digits-master');
    expect(hit.ok).toBe(true);
    if (hit.ok) {
      expect(hit.repo.url).toMatch(/synthobs-99-octave-digits-master/);
    }
    const miss = resolveLatticeRepoSelection('https://github.com/evil/not-allowlisted');
    expect(miss.ok).toBe(false);
  });

  it('finds by id or url', () => {
    expect(findLatticeRepository('sing13')?.name).toBe('psw.vibelandia.sing13');
    expect(
      findLatticeRepository('https://github.com/FractiAI/psw.vibelandia.sing13')?.id,
    ).toBe('sing13');
  });
});
