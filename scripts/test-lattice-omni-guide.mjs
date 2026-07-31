#!/usr/bin/env node
/** Smoke test · Lattice Omni guide membership + catalog pin. */
import assert from 'node:assert/strict';
import {
  LATTICE_OMNI_GUIDE_ID,
  isLatticeOmniPaper,
  listLatticeOmniPapers,
  renderLatticeOmniTocMarkdown,
} from '../lib/lattice-omni-guide.mjs';
import { WHITEPAPER_REGISTRY } from '../lib/whitepaper-registry.mjs';
import { buildWhitepaperCatalog } from '../lib/whitepaper-catalog.mjs';

assert.ok(WHITEPAPER_REGISTRY[LATTICE_OMNI_GUIDE_ID], 'guide registered');
assert.equal(WHITEPAPER_REGISTRY[LATTICE_OMNI_GUIDE_ID].catalogPriority, 0);

assert.equal(isLatticeOmniPaper(LATTICE_OMNI_GUIDE_ID, WHITEPAPER_REGISTRY[LATTICE_OMNI_GUIDE_ID]), false);
assert.equal(isLatticeOmniPaper('synthobs-mag-substrate-2026-07', WHITEPAPER_REGISTRY['synthobs-mag-substrate-2026-07']), true);
assert.equal(isLatticeOmniPaper('synthobs-omni-lattice-unification-2026-07', WHITEPAPER_REGISTRY['synthobs-omni-lattice-unification-2026-07']), true);

const papers = listLatticeOmniPapers();
assert.ok(papers.length >= 20, `expected ≥20 lattice/omni papers, got ${papers.length}`);
assert.ok(!papers.some((p) => p.id === LATTICE_OMNI_GUIDE_ID), 'guide excluded from TOC list');

const toc = renderLatticeOmniTocMarkdown(papers);
assert.match(toc, /synthobs-mag-substrate/);
assert.match(toc, /Living table/);

const catalog = await buildWhitepaperCatalog();
assert.equal(catalog.items[0]?.id, LATTICE_OMNI_GUIDE_ID, 'guide must be first catalog item');

console.log(
  JSON.stringify(
    {
      ok: true,
      latticeOmniCount: papers.length,
      catalogTop: catalog.items[0].id,
      catalogTopTitle: catalog.items[0].title,
    },
    null,
    2,
  ),
);
