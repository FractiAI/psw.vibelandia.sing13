import { describe, it, expect } from 'vitest';
import {
  githubTreeHrefForResearch,
  normalizeRepoLinksInHtml,
} from '../../lib/whitepaper-render.mjs';
import { findLatticeRepository } from '../../lib/lattice-repositories.mjs';
import { CATALOG_SURFACES } from '../../lib/whitepaper-catalog.mjs';

describe('research suite links on whitepaper reader', () => {
  it('rewrites relative research/ hrefs to the SING 13 GitHub tree', () => {
    expect(githubTreeHrefForResearch('../research/synthio-mri-vs-legacy-perf/')).toBe(
      'https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf/',
    );
    expect(githubTreeHrefForResearch('/research/synthio-mri-vs-legacy-perf/src/bloch_cpu.mjs')).toBe(
      'https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf/src/bloch_cpu.mjs',
    );
    expect(githubTreeHrefForResearch('https://example.com/x')).toBeNull();
  });

  it('normalizeRepoLinksInHtml rewrites standalone suite anchors', () => {
    const html = '<p><a href="../research/synthio-mri-vs-legacy-perf/">suite</a></p>';
    const out = normalizeRepoLinksInHtml(html);
    expect(out).toContain(
      'https://github.com/FractiAI/psw.vibelandia.sing13/tree/main/research/synthio-mri-vs-legacy-perf/',
    );
    expect(out).not.toContain('href="../research/');
  });

  it('lists the suite on catalog + lattice workstreams (monorepo tree, not a sibling)', () => {
    const card = CATALOG_SURFACES.find((s) => s.id === 'repo-synthio-mri-vs-legacy-perf');
    expect(card?.href).toMatch(/tree\/main\/research\/synthio-mri-vs-legacy-perf/);
    const repo = findLatticeRepository('synthio-mri-vs-legacy-perf');
    expect(repo?.directory).toBe('research/synthio-mri-vs-legacy-perf');
    expect(repo?.url).toBe('https://github.com/FractiAI/psw.vibelandia.sing13');
  });
});
