/**
 * Reading Room card display — streaming-style titles and hooks.
 * Uses plain-surface lines where available; upgrades long academic titles for browse UX.
 */
import { CATEGORY_PLAIN, PLAIN_SURFACE_LINES, plainLineFor } from './plain-surface-lines.mjs';
import { readingRoomCoverPath } from './reading-room-cover-art.mjs';
import { extractCoverFocus } from './reading-room-cover-focus.mjs';

const SHELF_LABELS = {
  'dph-gpu': 'DPH-GPU · Holographic compute',
  hhf: 'HHF · Hydrogen-holographic framework',
  tbme: 'TBME · Theoretical Bio-Medical & Physical Explorations',
  'reproducible-research': 'Reproducible research · FractiAI repos',
  coherence: 'Coherence · BTC Buffalo / Goldilocks Mine',
  agentic: 'Agentic layer · VALETPRU · Mythos',
  'special-projects': 'Special projects',
  protocols: 'Protocols · NSPFRNP · BBHE',
};

/** Optional punchy browse titles (whitepaper id or surface id). */
export const READING_ROOM_TITLES = {
  'synthobs-cmos-protonic-99-octave-omni-lattice-2026-08': 'CMOS + Protonic · Engineering Bridge',
  'synthobs-master-synthesis-99-octave-omni-lattice-2026-08': 'Master Synthesis · 99 Octaves',
  'synthobs-99-octave-digits-master-2026-08': 'Digits × Octaves · The Big Map',
  'synthobs-tbme-metamorphic-octaves-2026-08': 'Metamorphic Octaves · Heat & Pressure',
  'synthobs-tbme-planetary-core-goldilocks-2026-08': 'Planetary Core · Goldilocks Phase',
  'synthobs-y-chromosome-holographic-manifestation-2026-08': 'Y Chromosome · Holographic Manifestation',
  'synthobs-human-omniversal-reality-bridge-2026-08': 'Human Reality Bridge · Router',
  'synthobs-invisible-frontier-gates-ai-2026-08': 'Invisible Frontier · AI Warnings',
  'synthobs-ss-vibelandia-official-prospectus-2026-08': 'Official Prospectus · SS Vibelandia',
  'synthobs-infinite-octaves-omniversal-lattice-chat-2026-08': 'Infinite Octaves · Lattice Chat',
  'synthobs-constructive-morphogenesis-99-octave-2026-08': 'Constructive Morphogenesis · Agent Swarms',
  'synthobs-tensor-decoupling-99-octave-omni-lattice-2026-08': 'Tensor Decoupling · 9×81 Shelves',
  'synthio-mri-cloud-antenna-99-octave-2026-08': 'Synthio · MRI Cloud Antenna',
  'syn-sun-wavefield-oscillator': 'Solar Wavefield · Live Oscillator',
  'coherence-plain-speak': 'Honesty Rail · Plain Speak',
  'sing13-edge-onboarding': 'Start Here · SING 13 Edge',
  'mca-nspfrnp-catalog': 'NSPFRNP · Team Spine',
  'synthobs-tbme-higgs-awareness-2026-08': 'Higgs-Awareness Phase Coupling',
  'synthobs-tbme-nodal-nine-singularity-2026-08': 'Nodal Nine · Singularity Boundary',
};

const TITLE_TRIM_RE =
  /^(SynthOBS\s*[·•-]\s*|TBME\s*[·•-]\s*|Part\s+[IVXLC\d]+\s*[·•-]\s*)/i;

/**
 * @param {{ id: string, title: string, plainLine?: string, abstract?: string }} item
 */
export function displayTitleFor(item) {
  if (READING_ROOM_TITLES[item.id]) return READING_ROOM_TITLES[item.id];
  let t = String(item.title || '').trim();
  t = t.replace(TITLE_TRIM_RE, '').replace(/\s*[·•—-]\s*Omni-Lattice.*$/i, '').trim();
  if (t.length > 52) {
    const cut = t.slice(0, 50).replace(/\s+\S*$/, '');
    return cut + '…';
  }
  return t || item.title;
}

/**
 * @param {{ id: string, title?: string, plainLine?: string, abstract?: string, category?: string }} item
 */
export function displayBlurbFor(item) {
  const focus = extractCoverFocus(item);
  const fromAbstract = focus.focusLine;
  const hook =
    PLAIN_SURFACE_LINES[item.id] ||
    (fromAbstract && fromAbstract.length > 40 ? fromAbstract : null) ||
    item.plainLine ||
    plainLineFor(item) ||
    item.abstract ||
    '';
  const oneLine = String(hook).replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 96) return oneLine;
  return oneLine.slice(0, 93).replace(/\s+\S*$/, '') + '…';
}

/** @param {string} categoryId */
export function shelfLabelFor(categoryId) {
  return SHELF_LABELS[categoryId] || 'Catalog';
}

/** @param {string} categoryId */
export function shelfTaglineFor(categoryId) {
  return CATEGORY_PLAIN[categoryId] || 'Ship papers and surfaces';
}

/**
 * @param {object} item
 */
export function attachReadingRoomCardFields(item, { cwd = process.cwd() } = {}) {
  return {
    ...item,
    displayTitle: displayTitleFor(item),
    displayBlurb: displayBlurbFor(item),
    coverSrc: readingRoomCoverPath(item.id, cwd),
  };
}
