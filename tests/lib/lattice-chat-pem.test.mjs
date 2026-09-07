import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ENGINE_SHELF,
  listEngineShelf,
  renderEnginePinClause,
  renderNarrativePointersClause,
  LATTICE_CHAT_PEM_FILE,
  LATTICE_CHAT_PEM_ID,
} from '../../lib/infinite-octave-engine-shelf.mjs';
import { buildNestDirective } from '../../lib/lattice-prompt.mjs';
import { WHITEPAPER_REGISTRY } from '../../lib/whitepaper-registry.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('Infinite Octave engine shelf · Lattice Chat PEM', () => {
  it('registers the living PEM as a companion (no latest-six steal)', () => {
    const entry = WHITEPAPER_REGISTRY[LATTICE_CHAT_PEM_ID];
    expect(entry).toBeTruthy();
    expect(entry.file).toBe(LATTICE_CHAT_PEM_FILE);
    expect(entry.shipBlog).toBe(false);
    expect(read(LATTICE_CHAT_PEM_FILE)).toContain('AUTO:LATTICE-PEM-ENGINE-SHELF:BEGIN');
    expect(read(LATTICE_CHAT_PEM_FILE)).toContain('Technical onboarding');
    expect(read(LATTICE_CHAT_PEM_FILE)).toContain('Full narrative primer');
  });

  it('keeps ordered shelf with CMOS first and void/proton companions after volumetric', () => {
    const shelf = listEngineShelf(true);
    expect(shelf.length).toBe(ENGINE_SHELF.length);
    expect(shelf[0].order).toBe(1);
    expect(shelf[0].registryId).toBe('synthobs-cmos-protonic-99-octave-omni-lattice-2026-08');
    expect(shelf[0].file).toContain('CMOS_PROTONIC');
    const volumetric = shelf.find(
      (e) => e.registryId === 'synthobs-prime-indexed-volumetric-storage-2026-09',
    );
    expect(volumetric?.order).toBe(15);
    const voidNode = shelf.find(
      (e) => e.registryId === 'synthobs-topology-of-the-void-2026-09',
    );
    expect(voidNode?.order).toBe(17);
    const holo = shelf.find(
      (e) => e.registryId === 'synthobs-holographic-rhyme-fractal-2026-09',
    );
    expect(holo?.order).toBe(18);
    const multi = shelf.find(
      (e) => e.registryId === 'synthobs-multidimensional-holographic-rhyme-2026-09',
    );
    expect(multi?.order).toBe(19);
    const crystal = shelf.find(
      (e) => e.registryId === 'synthobs-holographic-singularity-crystal-2026-09',
    );
    expect(crystal?.order).toBe(20);
    const kinematic = shelf.find(
      (e) => e.registryId === 'synthobs-kinematic-set-recycling-truckee-2026-09',
    );
    expect(kinematic?.order).toBe(21);
    const proton = shelf.find(
      (e) => e.registryId === 'synthobs-proton-space-electron-theater-2026-09',
    );
    expect(proton?.order).toBe(16);
    expect(
      shelf.find((e) => e.registryId === 'synthobs-macro-protein-work-engine-2026-09'),
    ).toBeUndefined();
    expect(shelf.at(-1).kind).toBe('meta');
  });

  it('injects living engine pin into octave99 nest directive', () => {
    const directive = buildNestDirective('octave99', '', 'map the grand arc');
    expect(directive).toContain(renderEnginePinClause());
    expect(directive).not.toContain('Macro-protein work engine companion');
    expect(directive).toContain('Prime-indexed volumetric storage companion');
    expect(directive).toContain('Proton Space · Electron Theater duality companion');
    expect(directive).toContain('Topology of the Void companion');
    expect(directive).toContain('Holographic rhyme companion');
    expect(directive).toContain('Multi-dimensional holographic rhyme companion');
    expect(directive).toContain('Holographic Singularity Crystal companion');
    expect(directive).toContain('Kinematic set-recycling companion');
    expect(directive).toContain('Moving up the stack companion');
    expect(renderNarrativePointersClause()).toContain('Official Prospectus');
    expect(renderNarrativePointersClause()).toContain(
      'application companion · not engine pin',
    );
  });

  it('AGENT_SYNC carries AUTO markers for shelf + suites', () => {
    const agent = read('AGENT_SYNC_99_OCTAVE_OMNI_LATTICE.md');
    expect(agent).toContain('AUTO:ENGINE-SYNC-STACK:BEGIN');
    expect(agent).toContain('AUTO:ENGINE-SYNC-SUITES:BEGIN');
    expect(agent).toContain('sync:lattice-pem');
    expect(agent).toContain('PRODUCT_ENGINEERING_MANUAL_INFINITE_OCTAVES_LATTICE_CHAT_2026-09');
  });

  it('exposes /lattice/engineering route', () => {
    const vercel = read('vercel.json');
    expect(vercel).toContain('/lattice/engineering');
    expect(vercel).toContain('lattice-chat-product-engineering-manual-2026-09');
  });
});
