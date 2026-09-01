import { describe, expect, it } from 'vitest';
import { attachReadingRoomCardFields, displayBlurbFor, displayTitleFor } from '../../lib/reading-room-display.mjs';
import { renderReadingRoomCoverSvg } from '../../lib/reading-room-cover-art.mjs';

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
    });
    expect(card.coverSrc).toBe('/interfaces/assets/reading-room-covers/coherence-plain-speak.svg');
    expect(card.displayTitle).toBeTruthy();
    expect(card.displayBlurb).toBeTruthy();
  });

  it('renders unique SVG poster art per item', () => {
    const a = renderReadingRoomCoverSvg({
      id: 'syn-sun-wavefield-oscillator',
      displayTitle: 'Solar Wavefield',
      category: 'dph-gpu',
      tags: ['solar'],
    });
    const b = renderReadingRoomCoverSvg({
      id: 'synthobs-tbme-metamorphic-octaves-2026-08',
      displayTitle: 'Metamorphic Octaves',
      category: 'tbme',
      tags: ['octave'],
    });
    expect(a).toContain('<svg');
    expect(b).toContain('<svg');
    expect(a).not.toBe(b);
  });
});
