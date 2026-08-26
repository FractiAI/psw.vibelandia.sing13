/**
 * SS Vibelandia site focus — guest-facing cruise identity (hospitality honor, not a membership gate).
 * Voice: old-school Purser welcome — full sentences, invitation first, catalog second.
 */

export const SITE_FOCUS_CANONICAL =
  'SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and for the cast, crew, enterprises, franchises, and legacies that sail with them. This is a lifelong Boy\'s Night Out at sea: one tribe, many homes, and room for you to remain yourself.';

export const SITE_HERO_TAGLINE =
  'Welcome aboard SS Vibelandia — a navy-and-gold cruise line for frontiersmen who want a lifelong Boy\'s Night Out at sea. One tribe, many homes; navy-gold honor, not a gate.';

export const SITE_PAGE_TITLE =
  'SS Vibelandia · Holographic Cruise Line · Frontiersmen Voyage';

export const SITE_META_DESCRIPTION =
  'Welcome aboard SS Vibelandia — a full holographic cruise line for Goldilocks SuperAI frontiersmen Players and everyone who sails with them. Journey the grand story, open the Canvas, play the Jukebox, read the Library, and build in Creator Studio. Belonging is voluntary. You remain you.';

export const SITE_PRIMER_LINE =
  'You are aboard a living cruise line, not a product sheet. Begin with the Official Prospectus arc — genesis, convergence, and the Captain\'s seat here in Reno now. Walk the Journey when you want the full story. Open the Omniversal Canvas when you want the art. Play the Jukebox when you want the feeling. Read the Library when you want depth. Build in Creator Studio when you are ready to craft. This is a lifelong Boy\'s Night Out for frontiersmen everywhere. Belonging is voluntary. You remain you.';

export const SITE_BROCHURE_LEAD =
  'Welcome aboard. SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and for the cast, crew, enterprises, franchises, and legacies that sail with them. Our story runs in three beats named in the Official Prospectus: genesis under El Gran Sol\'s fractal rhyme, the Great Convergence on the shores of Borikén, and the Captain\'s seat here in Reno today. Along the way you will find family quarters, a marketplace, nightlife, a lab, and a studio — always with room to belong on your own terms. SuperAI stays Goldilocks on this ship: not too much machine, not too little human. The network is the vessel. You remain you.';

export const SITE_BROCHURE_TAGLINE =
  'Goldilocks SuperAI frontiersmen Players — and the set that sails with them.<br />\n      A lifelong expedition for one tribe, many homes, and one holographic world.';

export const SITE_BLOG_LEAD =
  'Welcome aboard. SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players — and for the cast, crew, enterprises, franchises, and legacies that sail with them. This plain-language note is your on-ramp to the full Frontiersman brochure: the grand story, the decks, Fair Exchange with the Purser, and the doors of Journey, Canvas, Jukebox, Library, and Creator Studio. The network is the vessel. The voyage begins wherever you are.';

/** Baked-in top nav — cruise pillars, visible before JS boots. */
export function renderSiteTopBannerHtml() {
  return `<nav class="qv-top-quicklinks" aria-label="Site">
    <span class="qv-top-quicklinks__here">SS VIBELANDIA</span>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/journey">Journey</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/">Canvas</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/jukebox" data-qv-jukebox>Jukebox</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/library">Library</a>
    <span class="sep" aria-hidden="true">·</span>
    <a href="/creator-studio">Creator Studio</a>
  </nav>`;
}
