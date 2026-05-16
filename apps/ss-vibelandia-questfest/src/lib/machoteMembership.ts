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
