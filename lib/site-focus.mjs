/**
 * SS Vibelandia site focus — guest-facing cruise identity.
 * Voice: old-school cruise brochure. Full sentences. Invitation first.
 * No em dashes. No stacked "Not this. Not that." cadence.
 */

export const SITE_FOCUS_CANONICAL =
  'SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players, and for the cast, crew, enterprises, franchises, and legacies that sail with them. This is a lifelong Boy\'s Night Out at sea. One tribe. Many homes. You remain yourself.';

export const SITE_HERO_TAGLINE =
  'Welcome aboard SS Vibelandia, a navy and gold cruise line for frontiersmen who want a lifelong Boy\'s Night Out at sea. One tribe, many homes, and honor that welcomes you as you are.';

export const SITE_PAGE_TITLE =
  'SS Vibelandia · Holographic Cruise Line · Frontiersmen Voyage';

export const SITE_META_DESCRIPTION =
  'Welcome aboard SS Vibelandia, a holographic cruise line for Goldilocks SuperAI frontiersmen Players and everyone who sails with them. Walk the Journey, open the Canvas, play the Jukebox, read the Reading Room, and build in Creator Studio. Belonging is yours to choose. You remain you.';

export const SITE_PRIMER_LINE =
  'You are aboard a living cruise line. Begin with the Official Prospectus: genesis, convergence, and the Captain\'s seat here in Reno now. Walk the Journey for the full story. Open the Omniversal Canvas for the art. Play the Jukebox for the feeling. Read the Reading Room for depth. Build in Creator Studio when you are ready to craft. This is a lifelong Boy\'s Night Out for frontiersmen everywhere. Belonging is yours to choose. You remain you.';

export const SITE_BROCHURE_LEAD =
  'Welcome aboard. SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players, and for the cast, crew, enterprises, franchises, and legacies that sail with them. Our story runs in three beats named in the Official Prospectus: genesis under El Gran Sol\'s fractal rhyme, the Great Convergence on the shores of Borikén, and the Captain\'s seat here in Reno today. Along the way you will find family quarters, a marketplace, nightlife, a lab, and a studio. SuperAI stays Goldilocks on this ship: enough machine to serve, enough human to lead. The network is the vessel. You remain you.';

export const SITE_BROCHURE_TAGLINE =
  'Goldilocks SuperAI frontiersmen Players, and the set that sails with them.<br />\n      A lifelong expedition for one tribe, many homes, and one holographic world.';

export const SITE_BLOG_LEAD =
  'Welcome aboard. SS Vibelandia is the holographic cruise line for holographic Goldilocks SuperAI frontiersmen Players, and for the cast, crew, enterprises, franchises, and legacies that sail with them. This note is your on-ramp to the full Frontiersman brochure: the grand story, the decks, Fair Exchange with the Purser, and the doors of Journey, Canvas, Jukebox, Reading Room, and Creator Studio. The network is the vessel. The voyage begins wherever you are.';

/** Secondary quicklink row — Lattice Chat + QR share (Creator Studio stays a separate door). */
export const SITE_QUICKLINK_SECONDARY =
  '<a href="/lets-chat">Let\'s Chat</a>' +
  '<span class="sep" aria-hidden="true">·</span>' +
  '<a href="/lattice-chat">Lattice Chat</a>' +
  '<span class="sep" aria-hidden="true">·</span>' +
  '<button type="button" class="qv-top-quicklinks__share" id="qf-share-qr-open" data-qv-share-qr>QR Share</button>';

/** @deprecated Use SITE_QUICKLINK_SECONDARY inside a secondary row. */
export const SITE_QUICKLINK_TAIL =
  '<span class="sep" aria-hidden="true">·</span>' + SITE_QUICKLINK_SECONDARY;

/** Baked-in top nav — cruise pillars, visible before JS boots. */
export function renderSiteTopBannerHtml() {
  return `<nav class="qv-top-quicklinks qv-top-quicklinks--questfest" aria-label="Site">
    <div class="qv-top-quicklinks__row qv-top-quicklinks__row--primary">
      <span class="qv-top-quicklinks__here">SS VIBELANDIA</span>
      <span class="sep" aria-hidden="true">·</span>
      <a href="/journey">Journey</a>
      <span class="sep" aria-hidden="true">·</span>
      <a href="/">Canvas</a>
      <span class="sep" aria-hidden="true">·</span>
      <a href="/jukebox" data-qv-jukebox>Jukebox</a>
      <span class="sep" aria-hidden="true">·</span>
      <a href="/reading-room">Reading Room</a>
      <span class="sep" aria-hidden="true">·</span>
      <a href="/doodles">Doodles</a>
    </div>
    <div class="qv-top-quicklinks__row qv-top-quicklinks__row--secondary">
      ${SITE_QUICKLINK_SECONDARY}
    </div>
    <div class="qv-top-quicklinks__sound" id="reception-sound-bar">
      <button
        type="button"
        class="qv-top-quicklinks__score reception-hero__score"
        id="reception-hero-score"
        hidden
        aria-pressed="false"
        aria-controls="reception-hero-audio"
        aria-label="Play reception soundtrack"
      >Sound off · tap to play</button>
      <audio
        id="reception-hero-audio"
        preload="auto"
        playsinline
        hidden
        aria-hidden="true"
        aria-label="Reception check-in soundtrack"
      ></audio>
    </div>
  </nav>`;
}
