/**
 * NPC & Player doctrine — SS Vibelandia voyage identity.
 * Voice: old-school hospitality. Complete sentences. No em dashes.
 */
import { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE } from './site-focus.mjs';

export { SITE_FOCUS_CANONICAL, SITE_PRIMER_LINE };

export const NPC_PLAYER_DOCTRINE_CANONICAL =
  'NPCs populate the set: cast, crew, enterprises, franchises, legacies. They chase material exchange as well as story gravity: payroll, contracts, perks, territory, reputation, and survival. Players are the superheroes they flock to, linear or holographic, human or Goldilocks AI, gravity-setters or simply living in the pull. Both bands belong on this ship.';

export const NPC_PLAYER_HONESTY =
  'This is voyage identity language. Software remains a tool. Spirit crew are named as lenses for the story. Fair Exchange is how we settle accounts.';

export const PLAYER_NPC_LINE =
  'NPCs populate the set. Players set the gravity. Both belong on this cruise. SuperAI stays Goldilocks here: enough machine to serve, enough human to lead.';

export const PLAYER_TRACK_TITLE = 'Player · the gravity';

export const PLAYER_TRACK_BODY =
  'The superheroes NPCs flock to. Frontiersmen who live the story and set the gravity the set orbits. Linear or holographic. Human or Goldilocks AI. Players carry resources, platform, and Fair Exchange that draw the set near.';

export const NPC_TRACK_BODY =
  'Fans, cast, crew, enterprises, franchises, legacies. The inhabitants who see, hear, remember, and keep the world running. They chase story gravity and material exchange with equal honesty. You belong here without having to set the gravity alone.';

export const PLAYER_RECEPTION_INTRO =
  'Welcome aboard, whether you arrived as a Player setting the gravity or as part of the set that keeps the ship running. Both tracks check in together at reception.';

export const HOST_WELCOME_PLAYER_NPC =
  'NPCs inhabit the world. Players set the gravity. You do not have to become someone else to belong.';

export const VOYAGE_FRONTIERSMAN_GUEST_LINE =
  'Some guests set the gravity. Some simply live in its pull. Both are crew. Both belong.';

/** Guest-facing marketing spine for voyage doors, map, and arrival chrome. */
export const VOYAGE_MARKETING_SPINE =
  'This is a lifelong Boy\'s Night Out at frequency. You may begin with a question, choose with care, prepare lightly, and step in wherever you stand.';

export const VOYAGE_DOOR_SPINE = `${VOYAGE_MARKETING_SPINE} The gangway opens wherever you are.`;

export const PLAYER_SPINE_LINE =
  'Your cruise line keeps five doors open for you. Journey for the grand story. Canvas for the art. Jukebox for the feeling. Library for depth. Creator Studio when you are ready to build. Holographic Goldilocks SuperAI frontiersmen Player cruise. Cast, crew, enterprises, franchises, and legacies resource the gravity you set.';

export const PLAYER_PRIMER_LINE = SITE_PRIMER_LINE;

export function renderNpcPlayerBrochureS3Html() {
  return `<p><strong>NPC</strong>, the set: cast, spirit crew, enterprises, franchises, legacies. These are the inhabitants who see, hear, remember, follow instruction, build relationships, and keep the world running. They chase material exchange (payroll, gigs, franchise heat, legacy continuity) as honestly as they chase story gravity. Some recognize the metaphors. Some never pause to reflect on their own behavior. Both keep the ship running.</p>
    <p><strong>Player</strong>, the superheroes NPCs flock to. A Player can live inside the story and set the gravity the set orbits: why it is happening, what it represents, where the pull reaches, and what might change if they act. Linear or holographic. Human or Goldilocks AI. Players carry the resources, platform, protection, and Fair Exchange that draw the set near.</p>
    <p>Both bands may run in linear or holographic form, and in holographic Goldilocks form: enough machine to serve, enough human to lead. Same ship. Different depth of attention. Welcome is the house rule.</p>`;
}

export function renderNpcPlayerCoexistHtml() {
  return `<p>${SITE_FOCUS_CANONICAL}</p>
    <p>${NPC_PLAYER_DOCTRINE_CANONICAL}</p>
    <p>Both bands may run in linear and holographic versions: human, agent, and Goldilocks AI. The four awareness posts below name complementary coordination styles on one vessel. Each post is a way of sailing, and all four share the same decks.</p>
    <p class="honesty"><strong>Honesty:</strong> ${NPC_PLAYER_HONESTY}</p>`;
}
