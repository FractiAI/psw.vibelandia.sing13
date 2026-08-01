/** Sonic Singularity · master catalog — brand copy vs UI hints (plain talk). */

/** Nesting poster · Machote gold stripe hull (no rainbow). */
export const SONIC_SINGULARITY_HERO_SRC =
  '/interfaces/assets/nesting/nest-sonic-singularity.png';

/** Default cover for every playlist without a custom posterSrc. */
export const DEFAULT_PLAYLIST_COVER_SRC =
  '/interfaces/assets/fractiai-studios-musical-empire-playlist-default.png';

/** Custom poster when set; otherwise the FractiAI Studios musical-empire default. */
export function resolvePlaylistCoverSrc(posterSrc?: string | null): string {
  return posterSrc || DEFAULT_PLAYLIST_COVER_SRC;
}

/** Listen hero + sidebar title for the full library (Layer 3 frequency). */
export const SONIC_CATALOG_DISPLAY_NAME =
  "Sonic Singularity Master Catalog · SS VIBELANDIA QUESTFEST · Hero Jo's Golden Bachdoor Hit Factory";

/** What the master list *is* — not file-management instructions. */
export const SONIC_SINGULARITY_DESCRIPTION =
  "Broadcast from the Holographic Goldilocks Sonic Ship — Reno swamp beats caliente, the living hydrogen Y line, φ, and the Y-frontiersmen Machote Modernos in one frequency that creates reality. Hero Jo's Golden Bachdoor Hit Factory holds the conductor rail; this catalog is the full sound on your device.";

/** One-line tag for playlist cards / sidebar hint row. */
export const SONIC_SINGULARITY_TAGLINE =
  'Holographic Goldilocks Sonic Ship · hydrogen Y line · φ · Machote Moderno · Wrong Side truth';

/** Canonical brand string — selectable in page title row. */
export const SONIC_BRAND_NAME = 'SS VIBELANDIA QUESTFEST';

/** Listen page eyebrow — above the jukebox hero. */
export const SONIC_LISTEN_EYEBROW_PREFIX =
  'Sonic Singularity · Holographic Goldilocks Sonic Ship ·';

export const SONIC_LISTEN_EYEBROW = `${SONIC_LISTEN_EYEBROW_PREFIX} ${SONIC_BRAND_NAME}`;

/** Jukebox /listen welcome — short, above the machine. */
export const JUKEBOX_WELCOME_TITLE = 'More than juicy beats. More than a jukebox.';

export const JUKEBOX_WELCOME =
  'Welcome to the Sonic Singularity on SS VIBELANDIA QUESTFEST — catalog, story, and frequency under one hull, now powered by the full Lattice Chat V1.618 Nested Agent Lattice engine. Pick a playlist, build playlists: every track carries the living hydrogen Y line, not just juicy beats.';

/** Paying members — upload invitation on /listen footer. */
export const JUKEBOX_MEMBER_INVITE_TITLE = 'Upload your original line';

export const JUKEBOX_MEMBER_INVITE_BODY =
  'Feed the Sonic Ship on the DJ tab: upload your own original work—including AI music you have rights to—that passes the Holographic Goldilocks AI OS minimum. Streaming the catalog is free for everyone; offline downloads are $1.61 per track on honor.';

export const JUKEBOX_MEMBER_INVITE_CTA_UPLOAD = 'Open DJ tab — upload tracks';

export const JUKEBOX_MEMBER_INVITE_CTA_PASS = 'Download a track · $1.61';

/** DJ / upload tab — member upload invitation (below intro). */
export const UPLOAD_MEMBER_INVITE =
  'Upload audio that meets the Holographic Goldilocks AI OS minimum (whole-in-every-part, balanced band, coordinated layers)—including AI music you have rights to—then curate it in your own playlists. The master catalog streams free; downloads are Fair Exchange per track.';

/** Playlist editor — visibility labels (maps to playlist kind). */
export const PLAYLIST_KIND_SOVEREIGN_LABEL = 'Sovereign · curated set';

export const PLAYLIST_KIND_OPEN_LABEL = 'Open deck · open listen-through';

export const PLAYLIST_KIND_HINT =
  'Both kinds stream free end-to-end. Offline export is still $1.61 per track on Fair Exchange.';

/** Technical note — playlists UI only, never the Listen hero story. */
export const MASTER_LIBRARY_UI_HINT =
  'Server-hosted on the Sonic Ship — your tracks live on SS VIBELANDIA QUESTFEST, not in the browser alone. Other playlists are mixes you build from this sovereign catalog.';

/** DJ / upload tab — headline stack. */
export const UPLOAD_EYEBROW = 'SS VIBELANDIA QUESTFEST · Sonic Ship ingest';

export const UPLOAD_TITLE = 'Add tracks to the sovereign catalog';

export const UPLOAD_INTRO_DESKTOP =
  'Feed the hydrogen Y line — pick one or many tracks (Ctrl/Shift on desktop). Small batches upload automatically. For 100+ tracks, use Import folder or the bulk ingest deck.';

export const UPLOAD_INTRO_IOS =
  'On iPhone: tap Choose files → Browse → select MP3/M4A → wait for the list → tap Upload. Stay on this tab until the Sonic Ship confirms each track.';

/** Bulk ingest deck — headline stack. */
export const BULK_UPLOAD_EYEBROW = 'Bulk ingest · sovereign catalog · 500+ tracks';

export const BULK_UPLOAD_TITLE = 'Large-batch track uploader';

export const BULK_UPLOAD_INTRO =
  'One selection, automatic upload onto the Holographic Goldilocks Sonic Ship. Pick a folder (desktop) or many files — progress shows current vs total until the master catalog reflects every beat.';

export const BULK_UPLOAD_IDLE_HINT =
  'Select a folder or many audio files — upload starts automatically.';

/** Jukebox playlist picker — menu chrome. */
export const PLAYLIST_MENU_KICKER = 'Sonic Singularity · playlist rail';

export const PLAYLIST_MENU_TITLE = 'Playlist menu';

export const PLAYLIST_MENU_CHANGE = 'Change playlist';

export const PLAYLIST_MENU_EMPTY = 'No playlists yet — build one from the master catalog.';
