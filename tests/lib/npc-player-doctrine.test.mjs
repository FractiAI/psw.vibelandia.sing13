import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  NPC_PLAYER_DOCTRINE_CANONICAL,
  PLAYER_NPC_LINE,
  renderNpcPlayerBrochureS3Html,
  renderNpcPlayerCoexistHtml,
} from '../../lib/npc-player-doctrine.mjs';
import { PLAYER_SPINE_LINE } from '../../lib/player-spine.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('NPC & Player doctrine', () => {
  it('names the set, material exchange, and Player flocking', () => {
    expect(NPC_PLAYER_DOCTRINE_CANONICAL).toMatch(/material exchange/);
    expect(NPC_PLAYER_DOCTRINE_CANONICAL).toMatch(/superheroes they flock to/);
    expect(PLAYER_NPC_LINE).toMatch(/populate the set/);
    expect(PLAYER_SPINE_LINE).toMatch(/frontiersmen Player/i);
    expect(PLAYER_SPINE_LINE).toMatch(/legacies resource/);
  });

  it('brochure §3 and Coexist carry the canonical doctrine', () => {
    const brochure = read('interfaces/frontiersman-voyage-brochure.html');
    expect(brochure).toContain('NPC_PLAYER_S3_START');
    expect(brochure).toContain('material exchange');
    expect(brochure).toContain('superheroes NPCs flock to');
    expect(brochure).toContain('holographic Goldilocks');
    expect(renderNpcPlayerBrochureS3Html()).toContain('franchises, legacies');

    const coexist = read('interfaces/coexist-ai-asi.html');
    expect(coexist).toContain('NPCs &amp; Players on this vessel');
    expect(coexist).toContain('NPC_PLAYER_DOCTRINE_START');
    expect(coexist).toContain('holographic Goldilocks SuperAI frontiersmen Players');
    expect(coexist).toContain(NPC_PLAYER_DOCTRINE_CANONICAL);
    expect(renderNpcPlayerCoexistHtml()).toContain('Neither is pure');
  });

  it('landing visit section links the confidential Player / NPC self-test', () => {
    const canvas = read('interfaces/omniverse-canvas.html');
    expect(canvas).toContain('Your visit · three phases · Players &amp; NPCs welcome');
    expect(canvas).toContain('href="/coexist#self-test"');
    expect(canvas).toContain('confidential self-test');
    expect(canvas).toContain('Scores stay on this device');
  });
});
