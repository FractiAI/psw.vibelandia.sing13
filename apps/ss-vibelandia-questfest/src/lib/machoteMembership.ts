/** Machote Moderno Magazine · members-only pass — shared product copy */

export const MACHOTE_MAGAZINE_NAME = 'Machote Moderno Magazine';

/** Collector's edition cover — hub campaign popup & bridge modal (qualifier badge, not the product sold). */
export const MACHOTE_MAGAZINE_COVER_SRC = '/interfaces/assets/machote-moderno-magazine-cover.png';

export const MACHOTE_MAGAZINE_COVER_ALT =
  'Machote Moderno Magazine — qualifier badge for followers-only Master Music Catalog access';

export const MACHOTE_MASTER_CATALOG_TITLE =
  'Master Music Catalog · Holographic Reno Swamp Beats Caliente';

export const MACHOTE_CATALOG_TITLE = MACHOTE_MASTER_CATALOG_TITLE;

export const MACHOTE_CATALOG_SUBTITLE = "Hero Jo's Golden Bachdoor Hit Factory";

export const MACHOTE_BEEHIVE_RESIDENCY_TITLE = 'Goldilocks Synthrverse Beehive Residency';

export const MACHOTE_BEEHIVE_RESIDENCY_TAGLINE =
  'Members-only · Old School Protocol · contact PL Taino · 0.001%';

export const MACHOTE_BEEHIVE_PL_TAINO_EMAIL = 'valetpru@gmail.com';

export const MACHOTE_BEEHIVE_MAILTO =
  'mailto:valetpru@gmail.com?subject=Goldilocks%20Synthrverse%20Beehive%20Residency%20%E2%80%94%20interested%20node';

export const MACHOTE_BEEHIVE_RESIDENCY_PATH = '/interfaces/goldilocks-beehive-residency.html';

export const MACHOTE_BEEHIVE_NEST_PATH = '/interfaces/nesting/nest-goldilocks-beehive.html';

export const MACHOTE_CAMPAIGN_EYEBROW = 'Exclusively for Machote Moderno followers';

export const MACHOTE_MEMBERS_PASS_TITLE = 'Special offer · Master Music Catalog access';

export const MACHOTE_MEMBERS_PASS_SHORT = 'Machote followers · catalog pass';

export const MACHOTE_HUB_PASS_CTA =
  'Unlock Master Music Catalog · Machote followers · $16.18/mo honor pass';

export const MACHOTE_CAMPAIGN_CTA = 'Get the catalog honor pass · $16.18/mo';

export const MACHOTE_BEEHIVE_CTA = 'Goldilocks Synthrverse Beehive · walkthrough';

/** Machote Moderno Magazine on Facebook — members-pass qualifier link. */
export const MACHOTE_MAGAZINE_FOLLOW_URL =
  'https://www.facebook.com/profile.php?id=61587003343289';

/** Where listeners qualify by following the magazine (override with VITE_MACHOTE_MAGAZINE_URL). */
export function machoteMagazineFollowUrl(): string {
  const env = import.meta.env.VITE_MACHOTE_MAGAZINE_URL?.trim();
  if (env) return env;
  return MACHOTE_MAGAZINE_FOLLOW_URL;
}

export const MACHOTE_MAGAZINE_QUALIFIER =
  'Follow Machote Moderno Magazine to qualify — the magazine is your badge, not what you are buying. The $16.18/mo honor pass unlocks the Master Music Catalog exclusively for Machote Moderno followers.';

export const MACHOTE_LIFE_PITCH =
  'Members-only access to our Master Music Catalog of holographic Reno swamp beats caliente — the hottest catalog on the planet, built so you are the star of your own parties, your car rides, your life. You know it.';

export const MACHOTE_CREW_LINE =
  'For Machote Modernos — frontier explorers who kept their edge and their Y-chromosome swagger on the wrong side of town.';

/** Persisted on hub + bridge — do not re-show offer while pass is active. */
export const MACHOTE_CAMPAIGN_STORAGE_KEY = 'machote-members-campaign-dismissed-v2';

export const MACHOTE_CAMPAIGN_LEDE =
  'Not the magazine for sale — a followers-only special to stream the full Master Music Catalog. Follow Machote Moderno Magazine to qualify, then lock in the monthly honor pass.';

export const MACHOTE_BEEHIVE_CAMPAIGN_BLURB =
  'Invite the ecosystem back in. Old School Protocol: interested party nodes contact PL Taino directly. 2-week test drive for all parties, then month, season, or longer. Open calendar for the rest of 2026 — fills very fast.';

export const MACHOTE_BEEHIVE_OLD_SCHOOL_PROTOCOL =
  'Under the Old School Protocol, interested party nodes contact PL Taino directly — no corporate intake funnel.';

export const MACHOTE_BEEHIVE_TERMS_SUMMARY =
  'Initial 2-week test drive for all parties to gauge resonance; capacity to scale to a month, a season, or longer when the hive hums on both sides.';

export const MACHOTE_CAMPAIGN_REASONS: { title: string; body: string }[] = [
  {
    title: 'Master Music Catalog · caliente',
    body:
      "Unlock the full Holographic Reno Swamp Beats Caliente Master Music Catalog from Hero Jo's Golden Bachdoor Hit Factory — star of the party, the drive, the vibe. Offered exclusively to Machote Moderno followers.",
  },
  {
    title: 'Full catalog · not the 30-second teaser',
    body:
      'Pass holders get every track — background play when you switch apps or lock the screen, and exports when you need a file offline. The magazine cover is your qualifier; the catalog is what you are unlocking.',
  },
  {
    title: 'Follow the magazine · $16.18/mo honor pass',
    body:
      'Follow Machote Moderno Magazine on Facebook to qualify, then pay $16.18/mo on Venmo, PayPal, or Cash App on honor for catalog access. Machote Modernos keeping it raw — no corporate checkout.',
  },
];
