import { describe, expect, it } from 'vitest';
import { attachReadingRoomCardFields, displayBlurbFor, displayTitleFor } from '../../lib/reading-room-display.mjs';

describe('Reading Room display cards', () => {
  it('shortens browse titles and hooks from plain lines', () => {
    const item = {
      id: 'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08',
      title: 'SynthOBS · CMOS Protonic 99 Octave Omni-Lattice · Part 0',
      plainLine: 'PINNED engineering bridge for linear systems',
      category: 'dph-gpu',
    };
    expect(displayTitleFor(item)).toBe('CMOS + Protonic · Engineering Bridge');
    expect(displayBlurbFor(item)).toContain('engineering bridge');
  });

  it('attaches coverSrc and display fields for catalog API', () => {
    const card = attachReadingRoomCardFields({
      id: 'coherence-plain-speak',
      title: 'Coherence Plain Speak',
      category: 'coherence',
      abstract: 'Honesty rail for what is real versus metaphor on this ship.',
    });
    expect(card.coverSrc).toBe('/interfaces/assets/reading-room-covers/coherence-plain-speak.jpg');
    expect(card.coverPrompt).toContain('no text');
    expect(card.coverFocus).toContain('Honesty');
    expect(card.displayTitle).toBeTruthy();
    expect(card.displayBlurb).toBeTruthy();
  });

  it('builds abstract-derived visual prompts', async () => {
    const { visualPromptFor, abstractFocusLine } = await import('../../lib/reading-room-cover-prompt.mjs');
    const focus = abstractFocusLine({
      abstract: 'CMOS protonic bands as engineering bridge. Not a foundry tape-out.',
    });
    expect(focus).toContain('CMOS');
    expect(visualPromptFor({ abstract: focus, category: 'dph-gpu' })).toContain('no text');
  });
});
