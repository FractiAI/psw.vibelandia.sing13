import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  shouldAdvanceOnBackgroundHandoff,
  shouldStartBackgroundHandoff,
} from '../../lib/background-handoff.mjs';

function read(rel) {
  return readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
}

describe('background handoff · no soft-pause by default', () => {
  it('advances on the hidden handoff element when background play is allowed', () => {
    expect(
      shouldAdvanceOnBackgroundHandoff({
        allowBackgroundPlay: true,
        documentHidden: true,
        hasBackgroundElement: true,
      }),
    ).toBe(true);
  });

  it('does not hand off when the tab is visible or preference is off', () => {
    expect(
      shouldAdvanceOnBackgroundHandoff({
        allowBackgroundPlay: true,
        documentHidden: false,
        hasBackgroundElement: true,
      }),
    ).toBe(false);
    expect(
      shouldAdvanceOnBackgroundHandoff({
        allowBackgroundPlay: false,
        documentHidden: true,
        hasBackgroundElement: true,
      }),
    ).toBe(false);
  });

  it('skips starting a second stream when primary is still audible', () => {
    expect(
      shouldStartBackgroundHandoff({
        allowBackgroundPlay: true,
        documentHidden: true,
        hasBackgroundElement: true,
        primaryStillAudible: true,
      }),
    ).toBe(false);
    expect(
      shouldStartBackgroundHandoff({
        allowBackgroundPlay: true,
        documentHidden: true,
        hasBackgroundElement: true,
        primaryStillAudible: false,
      }),
    ).toBe(true);
  });

  it('BridgePlayer tries background play() and soft-pauses only on failure', () => {
    const src = read('apps/ss-vibelandia-questfest/src/components/player/BridgePlayer.tsx');
    expect(src).toContain('shouldAdvanceOnBackgroundHandoff');
    expect(src).toContain('bg.src = src');
    expect(src).toContain('.play()');
    expect(src).toMatch(/\.catch\(\(\)\s*=>\s*\{[\s\S]*Paused in background/);
    // Must not unconditionally soft-pause before attempting play.
    expect(src).not.toMatch(
      /Soft-pause\s+instead;[\s\S]{0,80}pb\.setPlaying\(false\)/,
    );
  });

  it('useBackgroundPlayback only hands off after primary stalls', () => {
    const src = read('apps/ss-vibelandia-questfest/src/hooks/useBackgroundPlayback.ts');
    expect(src).toContain('shouldStartBackgroundHandoff');
    expect(src).toContain('primaryStillAudible');
    expect(src).toContain('mediaIsAudible(handoffEl)');
  });
});
