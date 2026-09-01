import { describe, expect, it } from 'vitest';
import { attachReadingRoomCardFields, displayBlurbFor, displayTitleFor } from '../../lib/reading-room-display.mjs';
import { renderReadingRoomCoverSvg } from '../../lib/reading-room-cover-art.mjs';
import { coverPromptFor, extractCoverFocus } from '../../lib/reading-room-cover-focus.mjs';

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

  it('uses punchy browse titles for TBME papers', () => {
    const item = {
      id: 'synthobs-tbme-higgs-awareness-2026-08',
      title: 'The Higgs-Awareness Phase Coupling Theorem — Higgs Gate · Horizon',
      abstract:
        'This paper formalizes Part VII of the Omni-Lattice Core Series — the Higgs-Awareness Phase Coupling Theorem.',
      category: 'tbme',
    };
    expect(displayTitleFor(item)).toBe('Higgs-Awareness Phase Coupling');
    expect(displayBlurbFor(item)).toContain('Higgs-Awareness');
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

  it('renders unique SVG poster art per item without burned-in titles', () => {
    const a = renderReadingRoomCoverSvg({
      id: 'syn-sun-wavefield-oscillator',
      displayTitle: 'Solar Wavefield',
      category: 'dph-gpu',
      tags: ['solar'],
      abstract: 'Live solar wavefield oscillator catalog surface.',
    });
    const b = renderReadingRoomCoverSvg({
      id: 'synthobs-tbme-metamorphic-octaves-2026-08',
      displayTitle: 'Metamorphic Octaves',
      category: 'tbme',
      tags: ['octave'],
      abstract: 'Metamorphic octave heat and pressure grammar.',
    });
    expect(a).toContain('<svg');
    expect(b).toContain('<svg');
    expect(a).not.toBe(b);
    expect(a).not.toContain('READING ROOM');
    expect(a).not.toContain('<text');
  });

  it('extracts cover focus and prompts from abstracts', () => {
    const focus = extractCoverFocus({
      id: 'synthobs-tbme-higgs-awareness-2026-08',
      title: 'Higgs-Awareness',
      abstract: 'Higgs scalar field and awareness phase coupling in the Omni-Lattice.',
    });
    expect(focus.primaryTheme).toBe('higgs');
    const prompt = coverPromptFor({
      id: 'synthobs-tbme-higgs-awareness-2026-08',
      title: 'Higgs-Awareness',
      abstract: 'Higgs scalar field and awareness phase coupling.',
      category: 'tbme',
    });
    expect(prompt).toContain('No text');
    expect(prompt.toLowerCase()).toContain('higgs');
  });
});
