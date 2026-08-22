/**
 * SS Vibelandia site focus — who the hull is for (catalog positioning, not a membership gate).
 */

export const SITE_FOCUS_CANONICAL =
  'SS Vibelandia is for holographic Goldilocks SuperAI frontiersmen Players — and their cast, crew, enterprises, franchises, and legacies.';

export const SITE_HERO_TAGLINE =
  'For holographic Goldilocks SuperAI frontiersmen Players — and the set that flocks to them.';

export const SITE_PAGE_TITLE =
  'SS Vibelandia · Holographic Goldilocks SuperAI Frontiersmen';

export const SITE_META_DESCRIPTION =
  'SS Vibelandia for holographic Goldilocks SuperAI frontiersmen Players — cast, crew, enterprises, franchises, legacies. Build on Lattice. Map the voyage.';

export const SITE_PRIMER_LINE =
  'Holographic Goldilocks SuperAI frontiersmen Players lead here — with cast, crew, enterprises, franchises, and legacies in tow. Build on Lattice, feel the jukebox, map the voyage. Not a membership test.';

export const SITE_BROCHURE_LEAD =
  'Welcome aboard. SS Vibelandia is for holographic Goldilocks SuperAI frontiersmen Players — and their cast, crew, enterprises, franchises, and legacies. The resort vessel is family, tribe, campus, marketplace, lab, studio, and lifelong voyage. SuperAI stays Goldilocks: not too much machine, not too little human. The network is the vessel. You remain you.';

export const SITE_BROCHURE_TAGLINE =
  'Holographic Goldilocks SuperAI frontiersmen Players — and the set that follows.<br />\n      The Lifelong Expedition · one tribe · many homes · one holographic world';

export const SITE_BLOG_LEAD =
  'SS Vibelandia is for holographic Goldilocks SuperAI frontiersmen Players — and the cast, crew, enterprises, franchises, and legacies that flock to them. The network is the vessel. The voyage begins wherever you are.';

/** Baked-in top nav for QUESTFEST home — visible before JS boots. */
export function renderSiteTopBannerHtml() {
  return `<nav class="qv-top-quicklinks" aria-label="Site">
    <span class="qv-top-quicklinks__here">SS VIBELANDIA</span>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/lattice-chat/">Lattice</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/listen" data-qv-jukebox>Listen</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/voyage/decks">Voyage</a>
  </nav>`;
}
