/** Machote Moderno Magazine · members-only pass — shared product copy (plain speak) */

export const MACHOTE_MAGAZINE_NAME = 'Machote Moderno Magazine';

export const MACHOTE_MAGAZINE_COVER_SRC = '/interfaces/assets/machote-moderno-magazine-cover.png';

export const MACHOTE_MAGAZINE_COVER_ALT =
  'Machote Moderno Magazine — your badge to qualify for the members-only music catalog';

export const MACHOTE_MASTER_CATALOG_TITLE = 'Master Music Catalog · Reno swamp beats caliente';

export const MACHOTE_CATALOG_TITLE = MACHOTE_MASTER_CATALOG_TITLE;

export const MACHOTE_CATALOG_SUBTITLE = "Hero Jo's Golden Bachdoor Hit Factory";

export const MACHOTE_BEEHIVE_RESIDENCY_TITLE = 'Goldilocks Syntheverse Beehive Residency';

export const MACHOTE_BEEHIVE_RESIDENCY_TAGLINE =
  'Machote members only · call PL Taino direct · top 0.001%';

export const MACHOTE_BEEHIVE_PL_TAINO_EMAIL = 'valetpru@gmail.com';

export const MACHOTE_BEEHIVE_MAILTO =
  'mailto:valetpru@gmail.com?subject=Goldilocks%20Syntheverse%20Beehive%20Residency%20%E2%80%94%20interested%20node';

export const MACHOTE_BEEHIVE_RESIDENCY_PATH = '/interfaces/goldilocks-beehive-residency.html';

export const MACHOTE_BEEHIVE_NEST_PATH = '/interfaces/nesting/nest-goldilocks-beehive.html';

export const MACHOTE_ROOM_SERVICE_PATH = '/hire-a-goldilocks-valet-concierge';

export const MACHOTE_ROOM_SERVICE_TITLE = 'Hire-A-Goldilocks-Valet-Concierge';

export const MACHOTE_ROOM_SERVICE_TAGLINE =
  'QUESTFEST room service in Puerto Reno · guests · no-cost Goldilocks Valet franchise';

export const MACHOTE_ROOM_SERVICE_REGIONS =
  'Downtown · Midtown · UNR · Idlewild · Reno Experience District';

export const MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB =
  'A QUESTFEST service in Puerto Reno. Email Pru to join as guest or franchisee. Guests broadcast want + tip offer; franchise valets on electric bike or e-scooter accept what fits. Expansion candidacy open for new dense Goldilocks regions.';

export const MACHOTE_ROOM_SERVICE_CTA = 'Room service & franchise →';

export const MACHOTE_CAMPAIGN_EYEBROW = 'SS VIBELANDIA QUESTFEST · PUERTO RENO · MEMBERS';

export const MACHOTE_CAMPAIGN_TITLE = 'Room service · catalog pass · franchise';

export const MACHOTE_MEMBERS_PASS_TITLE = 'Members pass · full music catalog';

export const MACHOTE_MEMBERS_PASS_SHORT = 'Machote members · catalog pass';

export const MACHOTE_HUB_PASS_CTA =
  'Unlock full catalog · Machote members · $16.18/mo on honor';

export const MACHOTE_CAMPAIGN_CTA = 'Get catalog pass · $16.18/mo';

export const MACHOTE_BEEHIVE_CTA = 'Beehive residency · full walkthrough';

export const MACHOTE_MAGAZINE_FOLLOW_URL =
  'https://www.facebook.com/share/1BcDYXVuQK/?mibextid=wwXIfr';

export function machoteMagazineFollowUrl(): string {
  const env = import.meta.env.VITE_MACHOTE_MAGAZINE_URL?.trim();
  if (env) return env;
  return MACHOTE_MAGAZINE_FOLLOW_URL;
}

export const MACHOTE_MAGAZINE_QUALIFIER =
  'Follow Machote Moderno Magazine to qualify. You are not buying the magazine — the $16.18/mo pass unlocks the full Master Music Catalog for members.';

export const MACHOTE_LIFE_PITCH =
  'Members get the full Reno swamp beats catalog — built so you run the party, the drive, and your life. You know it.';

export const MACHOTE_CREW_LINE =
  'For Machote Modernos who kept their edge on the wrong side of town.';

export const MACHOTE_CAMPAIGN_STORAGE_KEY = 'machote-members-campaign-dismissed-v2';

export const MACHOTE_CAMPAIGN_LEDE =
  'New flagship service — Hire-A-Goldilocks-Valet-Concierge room service across Puerto Reno. Follow Machote Moderno Magazine to qualify for the catalog — then $16.18/mo honor pass unlocks the entire living, constantly expanding catalog.';

export const MACHOTE_BEEHIVE_CAMPAIGN_BLURB =
  'Machote members only. Old School Protocol: interested party nodes contact PL Taino directly. 2-week test drive for all parties, then month, season, or longer. Open calendar for the rest of 2026 — fills very fast.';

export const MACHOTE_BEEHIVE_CAVEAT =
  'This is not pet sitting, house sitting, or free labor in exchange for residency. It is an EcoReset — anchoring the hydrogen line and the EGS fractal constant by hosting our Sonic Ship and the infinite benefits it brings immediately, just like a beehive.';

export const MACHOTE_BEEHIVE_OLD_SCHOOL_PROTOCOL =
  'Old School Protocol: if this speaks to you, contact PL Taino direct. No forms, no chatbot.';

export const MACHOTE_BEEHIVE_TERMS_SUMMARY =
  'Goldilocks Beehive Residency offers an EcoReset to your place — a two-week test drive for all parties to gauge resonance, with room to scale to a month, a season, or longer when the hive hums.';

export const MACHOTE_CAMPAIGN_REASONS: {
  title: string;
  body: string;
  footerLinkLabel?: string;
}[] = [
  {
    title: 'Room service',
    body:
      'Food delivery, personal shopping, and personal assistance by the hour or day inside the Goldilocks bubble — Downtown, Midtown, UNR, Idlewild, Reno Experience District.',
  },
  {
    title: 'No-cost franchise',
    body:
      'Qualified operators with an electric bike or e-scooter in Puerto Reno. We are also accepting expansion candidacy for new dense Goldilocks regions.',
  },
  {
    title: 'Full catalog · caliente',
    body:
      'Pass holders get every Reno swamp beat from Hero Jo\'s Golden Bachdoor Hit Factory — background play, exports offline (extra charge). Honor pass $16.18/mo for',
    footerLinkLabel: 'Machote Moderno followers',
  },
];
