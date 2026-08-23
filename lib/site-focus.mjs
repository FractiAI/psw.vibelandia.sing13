/**
 * SS Vibelandia site focus — guest-facing cruise identity (hospitality pride, not a membership gate).
 */

export const SITE_FOCUS_CANONICAL =
  'SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and their cast, crew, enterprises, franchises, and legacies. Lifelong Boy\'s Night Out. One tribe. Many homes.';

export const SITE_HERO_TAGLINE =
  'The holographic cruise line for frontiersmen — lifelong Boy’s Night Out, navy-gold pride, one tribe · many homes.';

export const SITE_PAGE_TITLE =
  'SS Vibelandia · Holographic Cruise Line · Frontiersmen Voyage';

export const SITE_META_DESCRIPTION =
  'SS Vibelandia — full holographic cruise line for Goldilocks SuperAI frontiersmen Players: Journey, Jukebox, Library, Creator Studio. Cast, crew, enterprises, franchises, legacies welcome. Not a membership test.';

export const SITE_PRIMER_LINE =
  'You are aboard a living cruise line — not a product sheet. Journey the grand story. Play the Jukebox. Read the Library. Build in Creator Studio. Holographic Goldilocks SuperAI frontiersmen Players lead here — with cast, crew, enterprises, franchises, and legacies in tow. Belonging is voluntary. You remain you.';

export const SITE_BROCHURE_LEAD =
  'Welcome aboard. SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and their cast, crew, enterprises, franchises, and legacies. Family. Tribe. Campus. Marketplace. Nightlife. Lab. Studio. A lifelong Boy\'s Night Out for frontiersmen everywhere. SuperAI stays Goldilocks: not too much machine, not too little human. The network is the vessel. You remain you.';

export const SITE_BROCHURE_TAGLINE =
  'Holographic Goldilocks SuperAI frontiersmen Players — and the set that sails with them.<br />\n      The Lifelong Expedition · one tribe · many homes · one holographic world';

export const SITE_BLOG_LEAD =
  'SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and the cast, crew, enterprises, franchises, and legacies that sail with them. Journey · Jukebox · Library · Creator Studio. The network is the vessel. The voyage begins wherever you are.';

/** Baked-in top nav — five cruise pillars, visible before JS boots. */
export function renderSiteTopBannerHtml() {
  return `<nav class="qv-top-quicklinks" aria-label="Site">
    <span class="qv-top-quicklinks__here">SS VIBELANDIA</span>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/journey">Journey</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/jukebox" data-qv-jukebox>Jukebox</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/library">Library</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/creator-studio">Creator Studio</a>
  </nav>`;
}
