import { describe, expect, it } from 'vitest';
import {
  findStandaloneSuite,
  loadStandaloneSuiteManifest,
  standaloneGithubHrefForResearch,
} from '../../lib/standalone-suite-manifest.mjs';
import { normalizeRepoLinksInHtml } from '../../lib/whitepaper-render.mjs';

describe('standalone-suite-manifest', () => {
  it('lists Synthio and Metamorphic standalone suites', () => {
    const m = loadStandaloneSuiteManifest();
    expect(m.suites.map((s) => s.id).sort()).toEqual([
      'synthobs-tbme-metamorphic-octaves',
      'synthio-mri-cloud-antenna',
      'synthio-mri-vs-legacy-perf',
    ]);
  });

  it('finds suite by id and path', () => {
    expect(findStandaloneSuite('synthio-mri-vs-legacy-perf')?.github).toBe(
      'https://github.com/FractiAI/synthio-mri-vs-legacy-perf',
    );
    expect(findStandaloneSuite('research/synthio-mri-cloud-antenna')?.id).toBe(
      'synthio-mri-cloud-antenna',
    );
  });

  it('rewrites ../research/ suite roots to standalone GitHub', () => {
    expect(standaloneGithubHrefForResearch('../research/synthio-mri-vs-legacy-perf/')).toBe(
      'https://github.com/FractiAI/synthio-mri-vs-legacy-perf/',
    );
    expect(standaloneGithubHrefForResearch('../research/synthio-mri-cloud-antenna/')).toBe(
      'https://github.com/FractiAI/synthio-mri-cloud-antenna/',
    );
  });

  it('rewrites nested research paths to tree URLs', () => {
    expect(standaloneGithubHrefForResearch('../research/synthio-mri-vs-legacy-perf/src/bloch_cpu.mjs')).toBe(
      'https://github.com/FractiAI/synthio-mri-vs-legacy-perf/tree/main/src/bloch_cpu.mjs',
    );
  });
});

describe('normalizeRepoLinksInHtml · standalone Synthio suites', () => {
  it('maps research suite hrefs to FractiAI standalone repos', () => {
    const html =
      '<a href="../research/synthio-mri-vs-legacy-perf/">perf</a>' +
      '<a href="../research/synthio-mri-cloud-antenna/data/empirical_report.json">data</a>';
    const out = normalizeRepoLinksInHtml(html);
    expect(out).toContain('href="https://github.com/FractiAI/synthio-mri-vs-legacy-perf/"');
    expect(out).toContain(
      'href="https://github.com/FractiAI/synthio-mri-cloud-antenna/tree/main/data/empirical_report.json"',
    );
  });
});
