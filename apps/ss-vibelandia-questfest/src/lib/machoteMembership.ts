/** Machote Moderno Magazine · members-only pass — shared product copy (plain speak) */

export const MACHOTE_MAGAZINE_NAME = 'Machote Moderno Magazine';

export const MACHOTE_MAGAZINE_COVER_SRC = '/interfaces/assets/machote-moderno-magazine-cover.png';

export const MACHOTE_MAGAZINE_COVER_ALT =
  'Machote Moderno Magazine — your badge to qualify for the members-only music catalog';

export const MACHOTE_CAMPAIGN_COVER_SRC =
  '/interfaces/goldilocks-deliveries/assets/grs-menu-food-delivery.jpg';

export const MACHOTE_CAMPAIGN_COVER_ALT =
  'Golden-age valet on a bicycle carrying a silver room-service cloche through neon-lit downtown Reno';

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
  'QUESTFEST Goldilocks Room Service in Puerto Reno · guests · no-cost Goldilocks Valet franchise';

export const MACHOTE_ROOM_SERVICE_REGIONS =
  'Downtown · Midtown · UNR · Idlewild · Reno Experience District';

export const MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB =
  'Howard Hughes Pioneering, Golden Age Spirit. Electric bikes and e-scooters — good for the environment and good for Valet Franchisee wallets.';

export const MACHOTE_ROOM_SERVICE_CTA = 'Explore Hire-A-Goldilocks-Valet-Concierge →';

export const MACHOTE_CAMPAIGN_JOIN_CTA = 'Follow Machote on Facebook to join →';

export const MACHOTE_CAMPAIGN_EYEBROW = 'THE GOLDILOCKS EXPERIENCE · QUESTFEST · PUERTO RENO';

export const MACHOTE_CAMPAIGN_TITLE = 'The Goldilocks Experience';

export const MACHOTE_MEMBERS_PASS_TITLE = 'Members pass · full music catalog';

export const MACHOTE_MEMBERS_PASS_SHORT = 'Machote members · catalog pass';

export const MACHOTE_HUB_PASS_CTA =
  'Unlock full Sonic Singularity catalog · Machote members · $16.18/mo on honor';

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
  "What's it mean? Goldilocks is where win-win-wins converge — not too much, not too little for guests, franchise valets, purveyors, and the environment. Hire-A-Goldilocks-Valet-Concierge is QUESTFEST room service in Puerto Reno: order from your purveyor of choice, book a Valet to pick up and deliver, or let us handle everything for 18% of the total bill.";

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
    title: 'What it is',
    body:
      'Core-centric room service in dense hubs: food delivery, personal shopping, and personal assistance by the hour or day. Human coordination on electric bike or e-scooter. Old-school pacing. No app store. No surge math.',
  },
  {
    title: 'Why it exists',
    body:
      'Rideshare apps maximize platform profit; Goldilocks is tuned for what is right for all. Short runs worth doing without sprawl markup. Guests who get it stay in their rhythm — Fair Exchange with open tip splits: franchise valets keep 67%; the app takes 33%.',
  },
  {
    title: 'Interested in joining?',
    body:
      'Follow Machote Moderno Magazine on Facebook if you want to join Hire-A-Goldilocks-Valet-Concierge as guest or Goldilocks Valet franchisee —',
    footerLinkLabel: 'Machote Moderno on Facebook',
  },
];
