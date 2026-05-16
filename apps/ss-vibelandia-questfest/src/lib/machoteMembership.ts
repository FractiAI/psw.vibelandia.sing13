/** Machote Moderno Magazine · members-only pass — shared product copy */

export const MACHOTE_MAGAZINE_NAME = 'Machote Moderno Magazine';

export const MACHOTE_MEMBERS_PASS_TITLE = 'Machote Moderno Magazine · Members-only pass';

export const MACHOTE_CATALOG_TITLE = 'Reno Holographic Swamp Beats Caliente Catalog';

export const MACHOTE_CATALOG_SUBTITLE = "Hero Jo's Golden Bachdoor Hit Factory";

export const MACHOTE_MEMBERS_PASS_SHORT = 'Machote Magazine members pass';

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
  'Following Machote Moderno Magazine is your qualifier for the members-only monthly pass.';

export const MACHOTE_LIFE_PITCH =
  'Members-only access to the hottest Reno holographic swamp beats caliente catalog on the planet — built so you are the star of your own parties, your car rides, your life. You know it.';

export const MACHOTE_CREW_LINE =
  'For Machote Modernos — frontier explorers who kept their edge and their Y-chromosome swagger on the wrong side of town.';

export const MACHOTE_CAMPAIGN_STORAGE_KEY = 'machote-members-campaign-dismissed-v1';

export const MACHOTE_CAMPAIGN_REASONS: { title: string; body: string }[] = [
  {
    title: 'Be the one with the cool music',
    body:
      "Access the hottest Reno Swamp Beats Caliente from Hero Jo's Golden Bachdoor Hit Factory — star of the party, the drive, the vibe. All crafted with the Hydrogen Line Frontiersman Machote Moderno Y-chromosome beings from everywhere, united in our Machote Moderno style, tastes, interests, and way of life.",
  },
  {
    title: 'Full catalog · background play',
    body:
      'Members get the whole Reno Holographic Swamp Beats Caliente Catalog — not the 30-second teaser. Full tracks, background audio when you switch apps or lock the screen, and exports when you need a file offline.',
  },
  {
    title: 'Follow the magazine · $16.18/mo honor pass',
    body:
      'Follow Machote Moderno Magazine on Facebook to qualify, then pay $16.18/mo on Venmo, PayPal, or Cash App on honor. Machote Modernos keeping it raw — no corporate checkout, just the pass and the catalog.',
  },
];
