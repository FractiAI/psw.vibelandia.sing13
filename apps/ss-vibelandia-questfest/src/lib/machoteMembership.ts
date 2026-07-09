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

export const MACHOTE_ROOM_SERVICE_TAGLINE = 'Your Personal Concierge for Downtown Reno';

export const MACHOTE_ROOM_SERVICE_REGIONS =
  'Downtown Reno · Midtown · Idlewild · University District · Riverwalk · The Reno Experience Zone';

export const MACHOTE_ROOM_SERVICE_CAMPAIGN_BLURB =
  'Practical help first. Adventure second. Goldilocks Valet Concierge is part of the larger SS Vibelandia QuestFest vision.';

export const MACHOTE_ROOM_SERVICE_CTA = 'Hire a Concierge · Book Now';

export const MACHOTE_QUESTFEST_UNIVERSE_PATH = '/hire-a-goldilocks-valet-concierge#questfest-universe';

export const MACHOTE_GUEST_PATH = '/hire-a-goldilocks-valet-concierge/guest';

export const MACHOTE_BOOK_MAIL =
  'mailto:valetpru@gmail.com?subject=Hire-A-Goldilocks-Valet-Concierge%20%E2%80%94%20book%20now&body=Name%3A%0ANeighborhood%3A%0AWhat%20I%20need%3A%0APreferred%20time%3A';

export const MACHOTE_CAMPAIGN_HIRE_CTA = 'Hire a Concierge · Book Now';

export const MACHOTE_CAMPAIGN_QUEST_CTA = 'Explore QuestFest';

export const MACHOTE_CAMPAIGN_BROWSE_CTA = 'Browse services →';

export const MACHOTE_CAMPAIGN_JOIN_CTA = 'Email Pru to get started →';

export const MACHOTE_CAMPAIGN_EYEBROW = 'Downtown Reno · Personal Concierge';

export const MACHOTE_CAMPAIGN_TITLE = 'Hire-A-Goldilocks-Valet-Concierge';

export const MACHOTE_CAMPAIGN_TAGLINE = 'Your Personal Concierge for Downtown Reno';

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
  'I help residents, visitors, professionals, seniors, and travelers with everyday tasks throughout Downtown Reno, Midtown, Idlewild, and nearby districts — on electric bike, not in a car idling at the curb.';

export const MACHOTE_CAMPAIGN_CHECKLIST: string[] = [
  'E-bike courier — low emissions, no parking cruise or sprawl markup downtown',
  'Fair for operators — your valet keeps 67%, not a gig-app squeeze',
  'Real human assistance — not another app',
];

export const MACHOTE_CAMPAIGN_UNIVERSE_TEASER =
  'If you’re curious, step aboard and discover the story behind the service. Email Pru to get signed up as a guest — one email, one human answer.';

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
    title: 'Services',
    body:
      'Food pickup, groceries, errands, pharmacy runs, hotel guest help, personal shopping, walking companion, and hourly concierge — throughout the downtown core.',
  },
  {
    title: 'How it works',
    body: 'Text or call. Tell Pru what you need. Receive a quote. Relax while it gets handled.',
  },
  {
    title: 'Get started',
    body: 'Email Pru with your name, neighborhood, and what you need. No forms, no app.',
  },
];
